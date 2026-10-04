import { NextRequest, NextResponse } from "next/server";
import { getPesapalToken, submitOrder } from "@/lib/pesapal";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      currency,
      frequency,
      program,
      donorName,
      donorEmail,
      donorPhone,
      preferredMethod,
    } = body;

    // ---------- Validation ----------
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!donorEmail || !donorEmail.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // ---------- Pesapal readiness check ----------
    const ipnId = process.env.PESAPAL_IPN_ID;
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

    if (
      !ipnId ||
      !consumerKey ||
      !consumerSecret ||
      consumerKey.startsWith("placeholder") ||
      consumerSecret.startsWith("placeholder")
    ) {
      return NextResponse.json(
        {
          error:
            "Online donations are being set up and will be available soon. Please contact us at info@savetheorphansafrica.org to donate now.",
        },
        { status: 503 }
      );
    }

    // ---------- Generate unique merchant reference ----------
    const merchantRef = `SOA-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // ---------- Pre-record donation as pending ----------
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const nameParts = (donorName || "Anonymous Donor").trim().split(" ");
    const firstName = nameParts[0] || "Anonymous";
    const lastName = nameParts.slice(1).join(" ") || "Donor";

    // ---------- Pesapal auth ----------
    const token = await getPesapalToken();

    // ---------- Submit order ----------
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const orderResponse = await submitOrder(token, {
      id: merchantRef,
      currency: currency || "USD",
      amount: Number(amount),
      description: `Donation to Save the Orphans Africa — ${
        program || "General Fund"
      }`,
      callback_url: `${siteUrl}/donate/success?ref=${merchantRef}`,
      notification_id: ipnId,
      billing_address: {
        email_address: donorEmail,
        phone_number: donorPhone || "",
        first_name: firstName,
        last_name: lastName,
      },
    });

    // ---------- Store pending donation ----------
    const { error: insertError } = await supabase.from("donations").insert({
      reference: merchantRef,
      amount: Number(amount),
      currency: currency || "USD",
      frequency: frequency || "one-time",
      program: program || "general",
      donor_name: donorName || null,
      donor_email: donorEmail,
      donor_phone: donorPhone || null,
      status: "pending",
      payment_method: preferredMethod || "any",
      payment_reference: orderResponse.order_tracking_id,
    });

    if (insertError) {
      console.error("Failed to store donation:", insertError.message);
    }

    return NextResponse.json({
      paymentLink: orderResponse.redirect_url,
      merchantRef,
      orderTrackingId: orderResponse.order_tracking_id,
    });
  } catch (error: any) {
    console.error("Donation endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}