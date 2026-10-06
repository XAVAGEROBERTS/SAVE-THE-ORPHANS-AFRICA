import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/nylonpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Official header only
    const signature = req.headers.get("x-nylon-signature") || "";

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("[webhook] signature verification FAILED → 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Nylon shape: { delivery_id, event, payload: { reference, status, ... }, timestamp }
    const event = String(body.event || "").toLowerCase();
    const inner = body.payload || body.data || {};
    const rawStatus = String(inner.status || body.status || "").toLowerCase();

    const reference =
      inner.reference ||
      body.reference ||
      inner.merchantReference ||
      body.merchantReference ||
      body.metadata?.reference ||
      null;

    if (!reference) {
      console.error("[webhook] missing reference", {
        event,
        delivery_id: body.delivery_id,
      });
      // Still 200 so Nylon doesn't keep retrying a malformed payload forever
      return NextResponse.json({ received: true });
    }

    // Map Nylon's real events:
    // transaction.successful | transaction.failed | transaction.cancelled | transaction.processing
    const isSuccess =
      event === "transaction.successful" ||
      ["successful", "success", "completed", "paid"].includes(rawStatus);

    const isFailure =
      event === "transaction.failed" ||
      event === "transaction.cancelled" ||
      ["failed", "cancelled", "canceled", "expired"].includes(rawStatus);

    // processing → leave pending (webhook may arrive before terminal state)
    const finalStatus = isSuccess
      ? "completed"
      : isFailure
        ? "failed"
        : "pending";

    // Human-readable audit label for Path 2
    const gatewayStatus =
      event ||
      (isSuccess
        ? "transaction.successful"
        : isFailure
          ? "transaction.failed"
          : rawStatus || "unknown");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Look up by payment_reference (invoice id / nylon id) first, then merchant reference
    let { data: donation, error: findErr } = await supabase
      .from("donations")
      .select("*")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (findErr) {
      console.error("[webhook] lookup payment_reference error:", findErr);
    }

    if (!donation) {
      const r2 = await supabase
        .from("donations")
        .select("*")
        .eq("reference", reference)
        .maybeSingle();
      if (r2.error) {
        console.error("[webhook] lookup reference error:", r2.error);
      }
      donation = r2.data;
    }

    // Fallback: metadata.reference from invoice create
    if (!donation && (body.metadata?.reference || inner.metadata?.reference)) {
      const metaRef =
        body.metadata?.reference || inner.metadata?.reference;
      const r3 = await supabase
        .from("donations")
        .select("*")
        .eq("reference", metaRef)
        .maybeSingle();
      donation = r3.data;
    }

    if (!donation) {
      console.error(
        "[webhook] donation not found for reference:",
        reference,
        { event, delivery_id: body.delivery_id }
      );
      return NextResponse.json({ received: true });
    }

    // Idempotency: don't overwrite completed/refunded with a later failed/processing
    if (donation.status === "completed" || donation.status === "refunded") {
      if (finalStatus !== "completed") {
        console.log(
          `[webhook] skip: donation ${donation.reference} already ${donation.status}`
        );
        return NextResponse.json({ received: true });
      }
    }

    // Only move pending → terminal (or re-affirm completed)
    if (finalStatus === "pending") {
      console.log(
        `[webhook] processing event for ${donation.reference} — leaving pending`
      );
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("donations")
      .update({
        status: finalStatus,
        payment_method: "nylonpay",
        gateway_status: gatewayStatus,
        completed_at: isSuccess ? new Date().toISOString() : null,
        raw_gateway_response: body,
      })
      .eq("id", donation.id);

    console.log(
      `[webhook] donation ${donation.reference} → ${finalStatus} (${gatewayStatus})`
    );

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

        console.warn(
          `Pledge ${donation.parent_reference} deactivated after 3 failures`
        );
      }
    }

    if (finalStatus === "completed" && donation.donor_email) {
      try {
        const { sendEmail } = await import("@/lib/email/resend");
        const { donationReceiptEmail } = await import(
          "@/lib/email/templates"
        );

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
          subject: isMonthlyCharge
            ? `Monthly Donation Receipt — ${donation.reference}`
            : `Donation Receipt — ${donation.reference}`,
          html,
        });
      } catch (emailErr) {
        console.error("Failed to send receipt:", emailErr);
      }
    }

    if (finalStatus === "failed") {
      try {
        const { sendEmail } = await import("@/lib/email/resend");
        await sendEmail({
          to: process.env.ADMIN_EMAIL!,
          subject: isMonthlyCharge
            ? `Monthly charge failed — ${donation.reference}`
            : `Donation failed — ${donation.reference}`,
          html: `
            <p>Donation <strong>${donation.reference}</strong> failed.</p>
            ${
              isMonthlyCharge
                ? `<p>Parent pledge: <strong>${donation.parent_reference}</strong></p>`
                : ""
            }
            <p>Donor: ${donation.donor_email}</p>
            <p>Amount: ${donation.amount} ${donation.currency}</p>
            <p>Gateway: ${gatewayStatus}</p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to notify admin:", emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[webhook] unhandled error:", error);
    // Still 200 so Nylon doesn't treat a code bug as a permanent delivery failure
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}