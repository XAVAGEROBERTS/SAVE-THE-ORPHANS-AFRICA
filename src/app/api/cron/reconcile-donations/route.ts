import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPayment } from "@/lib/nylonpay";

// ---- Thresholds (tunable) ----
// ABANDONED: no payment_reference after this window → user never started on Nylon
const ABANDONED_AFTER_MS = 15 * 60 * 1000; // 15 min
// EXPIRED: has payment_reference but still pending after this → user started, never completed
const EXPIRED_AFTER_MS = 60 * 60 * 1000; // 60 min

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = Date.now();
  const abandonedCutoff = new Date(now - ABANDONED_AFTER_MS).toISOString();

  // ---- Fetch ALL pending rows older than the abandoned window ----
  // NOTE: we no longer filter out rows with NULL payment_reference.
  // Those are exactly the abandoned rows we want to catch.
  const { data: pendings, error } = await supabase
    .from("donations")
    .select(
      "id, reference, payment_reference, created_at, amount, currency, donor_email"
    )
    .eq("status", "pending")
    .lt("created_at", abandonedCutoff)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("[reconcile] query failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!pendings || pendings.length === 0) {
    return NextResponse.json({ reconciled: 0, message: "No stale pending rows" });
  }

  const results: any[] = [];

  for (const row of pendings) {
    const ageMs = now - new Date(row.created_at).getTime();

    try {
      // ---- Case 1: no payment_reference at all ----
      // The user filled the form but /api/donate never got a response from Nylon
      // (or was still inserting when they closed the tab). Nothing to verify —
      // mark abandoned.
      if (!row.payment_reference) {
        await supabase
          .from("donations")
          .update({
            status: "abandoned",
            gateway_status: "no_payment_reference",
            completed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);

        results.push({ reference: row.reference, action: "abandoned", reason: "no_reference" });
        continue;
      }

      // ---- Case 2: has payment_reference — ask Nylon what really happened ----
      const verification = await verifyPayment(row.payment_reference);

      if (!verification.success) {
        const reason = String(verification.error || "");
        const reasonLower = reason.toLowerCase();
        const isNotFound =
          reasonLower.includes("not_found") || reasonLower.includes("not found");

        if (isNotFound) {
          // Nylon has no record of this reference. User never entered their phone.
          await supabase
            .from("donations")
            .update({
              status: "abandoned",
              gateway_status: "not_found_at_gateway",
              completed_at: null,
              raw_gateway_response: {
                getStatus_error: reason,
                getTransaction_error: verification.fallbackError || null,
              },
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);

          results.push({ reference: row.reference, action: "abandoned", reason: "not_found" });
          continue;
        }

        // Transient error — leave pending, retry next run
        results.push({ reference: row.reference, action: "skip", reason });
        continue;
      }

      // ---- Case 3: Nylon responded ----
      if (verification.status === "completed") {
        // Missed webhook — self-heal. Set completed; the webhook (or a
        // separate trigger) will send the receipt.
        await supabase
          .from("donations")
          .update({
            status: "completed",
            gateway_status: "verified_completed",
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);

        results.push({ reference: row.reference, action: "completed" });
        continue;
      }

      if (verification.status === "failed" || verification.status === "cancelled") {
        await supabase
          .from("donations")
          .update({
            status: "failed",
            gateway_status: "verified_failed",
            completed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);

        results.push({ reference: row.reference, action: "failed" });
        continue;
      }

      // Still pending on Nylon's side
      if (verification.status === "pending") {
        if (ageMs >= EXPIRED_AFTER_MS) {
          await supabase
            .from("donations")
            .update({
              status: "expired",
              gateway_status: "expired_no_confirmation",
              completed_at: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);

          results.push({ reference: row.reference, action: "expired" });
        } else {
          // Still within grace — leave pending, check next run
          results.push({
            reference: row.reference,
            action: "still_pending",
            age_minutes: Math.round(ageMs / 60000),
          });
        }
        continue;
      }

      // Unknown status from Nylon — leave pending
      results.push({
        reference: row.reference,
        action: "unknown_status",
        status: verification.status,
      });
    } catch (err: any) {
      console.error(`[reconcile] row ${row.reference} failed`, err);
      results.push({ reference: row.reference, action: "error", error: err?.message });
    }
  }

  const summary = {
    scanned: pendings.length,
    completed: results.filter((r) => r.action === "completed").length,
    failed: results.filter((r) => r.action === "failed").length,
    abandoned: results.filter((r) => r.action === "abandoned").length,
    expired: results.filter((r) => r.action === "expired").length,
    stillPending: results.filter((r) => r.action === "still_pending").length,
    skipped: results.filter((r) => r.action === "skip" || r.action === "error").length,
  };

  console.log("[reconcile] summary", summary);

  return NextResponse.json({ ...summary, results });
}
