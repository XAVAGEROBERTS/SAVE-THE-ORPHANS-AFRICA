// src/app/api/webhooks/nylon/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature, verifyPayment } from "@/lib/nylonpay";

// Basic email sanity check — not exhaustive, just prevents junk hitting Resend
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && EMAIL_RE.test(email.trim());
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const signature =
      req.headers.get("x-nylon-signature") ||
      req.headers.get("x-nylonpay-signature") ||
      req.headers.get("x-signature") ||
      "";

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("[webhook] invalid signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const tx = body.payload || body.data || body;

    const event = String(body.event || body.type || tx.event || "").toLowerCase();

    const reference =
      tx.reference ||
      tx.merchantReference ||
      body.reference ||
      body.merchantReference ||
      body.metadata?.reference ||
      tx.metadata?.reference ||
      tx.merchant_reference ||
      body.metadata?.merchant_reference ||
      tx.metadata?.merchant_reference;

    const transactionId =
      tx.transactionId || tx.transaction_id || body.transactionId;

    const rawStatus = String(tx.status || body.status || "").toLowerCase();

    if (!reference) {
      console.error("[webhook] missing reference", {
        event: body.event,
        txKeys: tx ? Object.keys(tx) : [],
        bodyKeys: Object.keys(body),
      });
      return NextResponse.json({ received: true });
    }

    const isSuccess =
      event === "transaction.completed" ||
      event === "transaction.successful" ||
      event === "payment.completed" ||
      event === "payment.success" ||
      event === "invoice.paid" ||
      ["success", "successful", "completed", "paid"].includes(rawStatus);

    const isFailure =
      event === "transaction.failed" ||
      event === "transaction.cancelled" ||
      event === "payment.failed" ||
      event === "payment.cancelled" ||
      event === "invoice.failed" ||
      ["failed", "cancelled", "canceled", "expired"].includes(rawStatus);

    const finalStatus = isSuccess
      ? "completed"
      : isFailure
        ? "failed"
        : "pending";

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ── Multi-strategy lookup ──
    let donation: any = null;
    let matchedBy = "";

    const candidates = [
      { value: reference, field: "payment_reference", tag: "ref→payment_reference" },
      { value: reference, field: "reference", tag: "ref→reference" },
      { value: transactionId, field: "payment_reference", tag: "txId→payment_reference" },
      { value: transactionId, field: "reference", tag: "txId→reference" },
      { value: body.metadata?.reference, field: "reference", tag: "meta→reference" },
      { value: tx.metadata?.reference, field: "reference", tag: "tx.meta→reference" },
      { value: body.metadata?.merchant_reference, field: "reference", tag: "meta.merchant→reference" },
      { value: tx.metadata?.merchant_reference, field: "reference", tag: "tx.meta.merchant→reference" },
    ].filter((c) => c.value);

    for (const c of candidates) {
      const r = await supabase
        .from("donations")
        .select("*")
        .eq(c.field, c.value as string)
        .maybeSingle();
      if (r.data) {
        donation = r.data;
        matchedBy = c.tag;
        break;
      }
    }

    if (!donation && transactionId) {
      try {
        const txInfo = await verifyPayment(transactionId);
        if (txInfo.success && txInfo.reference) {
          const r = await supabase
            .from("donations")
            .select("*")
            .eq("reference", txInfo.reference)
            .maybeSingle();
          if (r.data) {
            donation = r.data;
            matchedBy = "nylonpay-lookup";
          }
        }
      } catch (err: any) {
        console.error("[webhook] Lookup error:", err?.message);
      }
    }

    if (!donation) {
      console.error("[webhook] donation not found after all strategies", {
        reference,
        transactionId,
        event,
        status: rawStatus,
        candidatesTried: candidates.map((c) => c.tag),
      });
      return NextResponse.json({ received: true });
    }

    console.log(
      `[webhook] matched ${donation.reference} via ${matchedBy} → ${finalStatus}`
    );

    // ── Update donation ──
    await supabase
      .from("donations")
      .update({
        status: finalStatus,
        payment_method: "nylonpay",
        gateway_status: event || rawStatus || null,
        completed_at: isSuccess ? new Date().toISOString() : null,
        raw_gateway_response: body,
      })
      .eq("id", donation.id);

    // ── Monthly charge handling ──
    const isMonthlyCharge = !!donation.parent_reference;

    if (isMonthlyCharge && finalStatus === "failed") {
      const { data: recentCharges } = await supabase
        .from("donations")
        .select("status, created_at")
        .eq("parent_reference", donation.parent_reference)
        .order("created_at", { ascending: false })
        .limit(3);

      const lastThreeFailed =
        recentCharges?.length === 3 &&
        recentCharges.every((c) => c.status === "failed");

      if (lastThreeFailed) {
        await supabase
          .from("donations")
          .update({
            is_active_subscription: false,
            subscription_cancelled_at: new Date().toISOString(),
          })
          .eq("reference", donation.parent_reference);
      }
    }

    // ── Receipt on success (idempotent) ──
    if (finalStatus === "completed") {
      // 1. Only send once — check receipt_sent_at
      if (donation.receipt_sent_at) {
        console.log(
          `[webhook] receipt already sent for ${donation.reference} at ${donation.receipt_sent_at} — skipping`
        );
      } else if (!isValidEmail(donation.donor_email)) {
        console.warn(
          `[webhook] invalid or missing donor_email for ${donation.reference}:`,
          donation.donor_email
        );
      } else {
        try {
          const { sendEmail, notifyAdmin } = await import("@/lib/email/resend");
          const { donationReceiptEmail } = await import("@/lib/email/templates");

          const html = donationReceiptEmail({
            donorName: donation.donor_name || "",
            amount: Number(donation.amount),
            currency: donation.currency,
            reference: donation.reference,
            program: donation.program,
            frequency: donation.frequency,
            date: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });

          // Send to donor
          await sendEmail({
            to: donation.donor_email.trim(),
            subject: `Donation Receipt — ${donation.reference}`,
            html,
          });

          // Notify admin (fire-and-forget — failure shouldn't block)
          notifyAdmin("donation", {
            reference: donation.reference,
            amount: `${donation.currency} ${Number(donation.amount).toLocaleString()}`,
            donor_name: donation.donor_name,
            donor_email: donation.donor_email,
            program: donation.program,
            frequency: donation.frequency,
            payment_method: "nylonpay",
          }).catch((e) =>
            console.error("[webhook] admin notify failed:", e?.message)
          );

          // Mark receipt sent — AFTER successful send
          await supabase
            .from("donations")
            .update({ receipt_sent_at: new Date().toISOString() })
            .eq("id", donation.id);

          console.log(
            `[webhook] receipt sent to ${donation.donor_email} for ${donation.reference}`
          );
        } catch (emailErr: any) {
          // Don't mark receipt_sent_at on failure — next retry will try again
          console.error(
            "[webhook] receipt failed:",
            emailErr?.message || emailErr
          );
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[webhook] handler error:", error?.message, error?.stack);
    // Still return 200 — Nylon would retry on 5xx, which won't help here
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}