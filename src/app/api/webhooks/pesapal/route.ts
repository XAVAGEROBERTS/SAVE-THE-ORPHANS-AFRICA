import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPesapalToken, getTransactionStatus } from "@/lib/pesapal";
import { sendEmail } from "@/lib/email/resend";
import { donationReceiptEmail, adminNotificationEmail } from "@/lib/email/templates";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderTrackingId = searchParams.get("OrderTrackingId");
  const merchantReference = searchParams.get("OrderMerchantReference");
  const notificationType = searchParams.get("OrderNotificationType");

  console.log("Pesapal IPN received:", {
    orderTrackingId,
    merchantReference,
    notificationType,
  });

  if (!orderTrackingId || !merchantReference) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    // Verify with Pesapal
    const token = await getPesapalToken();
    const status = await getTransactionStatus(token, orderTrackingId);

    console.log("Pesapal status:", status);

    const isCompleted = status.status_code === 1;
    const paymentStatus = isCompleted ? "completed" : "failed";

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update donation record
    const { error } = await supabase
      .from("donations")
      .update({
        status: paymentStatus,
        payment_reference: status.confirmation_code || orderTrackingId,
        payment_method: status.payment_method || "pesapal",
      })
      .eq("reference", merchantReference);

    if (error) {
      console.error("Failed to update donation:", error);
      return NextResponse.json({ ok: false });
    }

    console.log("Donation updated:", merchantReference, paymentStatus);

    // =====================================================================
    // If payment completed — send receipt + notify admin
    // =====================================================================
    if (isCompleted) {
      const { data: donation } = await supabase
        .from("donations")
        .select("*")
        .eq("reference", merchantReference)
        .maybeSingle();

      if (donation) {
        // ---------- Donation receipt to donor ----------
        if (donation.donor_email) {
          try {
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

            console.log("Receipt sent to:", donation.donor_email);
          } catch (receiptErr) {
            console.error("Failed to send receipt:", receiptErr);
          }
        }

        // ---------- Admin notification ----------
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
        if (adminEmail) {
          try {
            const html = adminNotificationEmail({
              type: "donation",
              data: {
                amount: `${donation.currency} ${Number(donation.amount).toLocaleString()}`,
                donor: donation.donor_name || "Anonymous",
                email: donation.donor_email || "—",
                phone: donation.donor_phone || "—",
                program: donation.program,
                frequency: donation.frequency,
                reference: donation.reference,
                method: status.payment_method || "pesapal",
              },
            });

            await sendEmail({
              to: adminEmail,
              subject: `[SOA] New Donation: ${donation.currency} ${donation.amount}`,
              html,
            });

            console.log("Admin notified of donation");
          } catch (notifyErr) {
            console.error("Failed to notify admin:", notifyErr);
          }
        }
      }
    }

    return NextResponse.json({
      order_tracking_id: orderTrackingId,
      merchant_reference: merchantReference,
      status: paymentStatus,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    // Always return 200 so Pesapal doesn't retry forever
    return NextResponse.json({ ok: true });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}