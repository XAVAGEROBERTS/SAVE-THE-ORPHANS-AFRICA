import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPayment } from "@/lib/nylonpay";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: pendings, error } = await supabase
    .from("donations")
    .select("id, reference, payment_reference, created_at, amount, currency")
    .eq("status", "pending")
    .not("payment_reference", "is", null)
    .lt("created_at", fiveMinutesAgo)
    .limit(100);

  if (error) {
    console.error("reconcile: query failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!pendings || pendings.length === 0) {
    return NextResponse.json({ reconciled: 0, message: "No pending rows" });
  }

  const results: any[] = [];

  for (const row of pendings) {
    try {
      const verification = await verifyPayment(row.payment_reference);

      if (!verification.success) {
        const reason = String(verification.error || "");

        // "Transaction not found" means Nylon Pay has no record of this UUID.
        // Treat it as a terminal failure so it doesn't stay pending forever.
        const isNotFound =
          reason.includes("not_found") ||
          reason.toLowerCase().includes("transaction not found");

        if (isNotFound) {
          await supabase
            .from("donations")
            .update({
              status: "failed",
              gateway_status: "not_found_at_gateway",
              completed_at: null,
            })
            .eq("id", row.id);

          results.push({
            reference: row.reference,
            action: "failed",
            reason: "not_found_at_gateway",
          });
          continue;
        }

        // Anything else (network error, auth, etc.) — leave as pending for retry
        results.push({
          reference: row.reference,
          action: "skip",
          reason: verification.error,
        });
        continue;
      }

      const ageHours =
        (Date.now() - new Date(row.created_at).getTime()) / 1000 / 60 / 60;

      let newStatus: "completed" | "failed" | null = null;

      if (verification.status === "completed") {
        newStatus = "completed";
      } else if (verification.status === "failed") {
        newStatus = "failed";
      } else if (verification.status === "pending" && ageHours > 2) {
        // Prompt abandoned — no response within 2 hours. Treat as failed.
        newStatus = "failed";
      }

      if (!newStatus) {
        results.push({
          reference: row.reference,
          action: "still_pending",
          status: verification.status,
        });
        continue;
      }

      await supabase
        .from("donations")
        .update({
          status: newStatus,
          gateway_status:
            newStatus === "completed"
              ? "verified_completed"
              : ageHours > 2 && verification.status === "pending"
                ? "expired_no_response"
                : "verified_failed",
          completed_at:
            newStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", row.id);

      results.push({ reference: row.reference, action: newStatus });
    } catch (err: any) {
      console.error(`reconcile: row ${row.reference} failed`, err);
      results.push({
        reference: row.reference,
        action: "error",
        error: err.message,
      });
    }
  }

  const completed = results.filter((r) => r.action === "completed").length;
  const failed = results.filter((r) => r.action === "failed").length;
  const stillPending = results.filter((r) => r.action === "still_pending").length;

  console.log(
    `Reconcile: ${completed} completed, ${failed} failed, ${stillPending} still pending`
  );

  return NextResponse.json({
    scanned: pendings.length,
    completed,
    failed,
    stillPending,
    results,
  });
}