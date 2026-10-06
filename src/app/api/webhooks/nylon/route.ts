import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/nylonpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-nylonpay-signature") ||
      req.headers.get("x-signature") ||
      "";

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("Nylon Pay webhook: invalid signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log("Nylon Pay webhook received:", payload);

    const event = String(payload.event || payload.type || "").toLowerCase();

    const reference =
      payload.reference ||
      payload.data?.reference ||
      payload.merchantReference ||
      payload.data?.merchantReference;

    const rawStatus = String(
      payload.status || payload.data?.status || ""
    ).toLowerCase();

    if (!reference) {
      console.error("Nylon Pay webhook: missing reference", payload);
      return NextResponse.json({ received: true });
    }

    const isSuccess =
      event === "payment.completed" ||
      event === "payment.success" ||
      event === "invoice.paid" ||
      ["success", "successful", "completed", "paid"].includes(rawStatus);

    const isFailure =
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

    // Match by payment_reference (the UUID Nylon Pay sends back)
    const { data: donation, error: findErr } = await supabase
      .from("donations")
      .select("*")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (findErr) {
      console.error("Supabase lookup error:", findErr);
      return NextResponse.json({ received: true });
    }

    if (!donation) {
      console.error("Donation not found for payment_reference:", reference);
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("donations")
      .update({
        status: finalStatus,
        payment_method: "nylonpay",
        gateway_status: rawStatus || event || null,
        completed_at: isSuccess ? new Date().toISOString() : null,
        raw_gateway_response: payload,
      })
      .eq("id", donation.id);

    console.log(`Webhook: donation ${donation.reference} → ${finalStatus}`);

    // Monthly charge handling
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

    // Send receipt on success
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
          subject: isMonthlyCharge
            ? `Monthly Donation Receipt — ${donation.reference}`
            : `Donation Receipt — ${donation.reference}`,
          html,
        });
      } catch (emailErr) {
        console.error("Failed to send receipt:", emailErr);
      }
    }

    // Notify admin on failure
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
            ${isMonthlyCharge ? `<p>Parent pledge: <strong>${donation.parent_reference}</strong></p>` : ""}
            <p>Donor: ${donation.donor_email}</p>
            <p>Amount: ${donation.amount} ${donation.currency}</p>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to notify admin:", emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Nylon Pay webhook error:", error);
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}