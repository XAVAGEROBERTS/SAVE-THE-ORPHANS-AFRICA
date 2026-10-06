import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature, verifyPayment } from "@/lib/nylonpay";

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
    console.log("[webhook] received:", JSON.stringify(body));

    // Nylon Pay nests the transaction data under "payload"
    const tx = body.payload || body.data || body;

    const event = String(body.event || body.type || tx.event || "").toLowerCase();

    // Try every plausible location for the reference
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

    const transactionId = tx.transactionId || tx.transaction_id || body.transactionId;

    const rawStatus = String(tx.status || body.status || "").toLowerCase();

    if (!reference) {
      console.error(
        "[webhook] missing reference. Full body: " + JSON.stringify(body)
      );
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

    // Try candidate references in order
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

    // Last resort — ask Nylon Pay for the transaction metadata
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
      console.error(
        "[webhook] donation not found after all strategies. reference=" +
          reference +
          " transactionId=" +
          transactionId +
          " body=" +
          JSON.stringify(body)
      );
      return NextResponse.json({ received: true });
    }

    console.log(
      `[webhook] matched ${donation.reference} via ${matchedBy} → ${finalStatus}`
    );

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

    // ── Receipt on success ──
    if (finalStatus === "completed" && donation.donor_email) {
      try {
        const { sendEmail } = await import("@/lib/email/resend");
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

        await sendEmail({
          to: donation.donor_email,
          subject: `Donation Receipt — ${donation.reference}`,
          html,
        });
      } catch (emailErr) {
        console.error("[webhook] receipt failed:", emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[webhook] handler error:", error?.message, error?.stack);
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}