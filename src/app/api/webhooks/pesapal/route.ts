import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPesapalToken, getTransactionStatus } from "@/lib/pesapal";

/**
 * Pesapal calls this endpoint after every payment (IPN).
 * It sends ?OrderTrackingId=xxx&OrderMerchantReference=yyy&OrderNotificationType=IPNCHANGE
 */
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
    // Verify the transaction status with Pesapal
    const token = await getPesapalToken();
    const status = await getTransactionStatus(token, orderTrackingId);

    console.log("Pesapal status:", status);

    // status.status_code: 0=INVALID, 1=COMPLETED, 2=FAILED, 3=REVERSED
    const isCompleted = status.status_code === 1;
    const paymentStatus = isCompleted ? "completed" : "failed";

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update the donation record
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
    } else {
      console.log("Donation updated:", merchantReference, paymentStatus);
    }

    // Pesapal expects a JSON response
    return NextResponse.json({
      order_tracking_id: orderTrackingId,
      merchant_reference: merchantReference,
      status: paymentStatus,
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    // Still return 200 so Pesapal doesn't retry indefinitely
    return NextResponse.json({ ok: true });
  }
}

// Pesapal may also POST
export async function POST(req: NextRequest) {
  return GET(req);
}