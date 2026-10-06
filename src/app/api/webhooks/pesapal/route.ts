// src/app/api/webhooks/pesapal/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/pesapal";
import { createAdminClient } from "@/lib/supabase/admin";

async function processNotification(
  orderTrackingId: string,
  merchantReference: string,
  notificationType?: string
) {
  const status = await getTransactionStatus(orderTrackingId);
  const isCompleted = Number(status.status_code) === 1;
  const supabase = createAdminClient();

  if (notificationType === "RECURRING") {
    await supabase.from("donations").insert({
      reference: `REC-${orderTrackingId}`,
      parent_reference: merchantReference,
      amount: status.amount,
      currency: status.currency,
      frequency: "monthly",
      status: isCompleted ? "completed" : "failed",
      payment_method: status.payment_method || "pesapal",
      pesapal_status: status.payment_status_description || null,
      completed_at: isCompleted ? new Date().toISOString() : null,
      raw_gateway_response: status,
    });
  } else {
    await supabase
      .from("donations")
      .update({
        status: isCompleted
          ? "completed"
          : Number(status.status_code) === 2
            ? "failed"
            : "pending",
        payment_method: status.payment_method || null,
        pesapal_status: status.payment_status_description || null,
        completed_at: isCompleted ? new Date().toISOString() : null,
        raw_gateway_response: status,
      })
      .eq("merchant_reference", merchantReference);
  }

  return status;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderTrackingId = body.OrderTrackingId || body.orderTrackingId;
    const merchantReference =
      body.OrderMerchantReference || body.orderMerchantReference;
    const notificationType =
      body.OrderNotificationType || body.orderNotificationType;

    if (orderTrackingId && merchantReference) {
      await processNotification(
        orderTrackingId,
        merchantReference,
        notificationType
      );
    }

    return NextResponse.json({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId,
      orderMerchantReference: merchantReference,
      status: 200,
    });
  } catch (err) {
    console.error("Pesapal IPN POST error:", err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderTrackingId = searchParams.get("OrderTrackingId");
    const merchantReference = searchParams.get("OrderMerchantReference");
    const notificationType = searchParams.get("OrderNotificationType");

    if (orderTrackingId && merchantReference) {
      await processNotification(
        orderTrackingId,
        merchantReference,
        notificationType ?? undefined
      );
    }

    return NextResponse.json({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId,
      orderMerchantReference: merchantReference,
      status: 200,
    });
  } catch (err) {
    console.error("Pesapal IPN GET error:", err);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
}