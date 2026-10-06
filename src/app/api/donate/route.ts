import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { collectDonation } from "@/lib/nylonpay";

const UGX_PER_USD = Number(process.env.UGX_PER_USD || 3700);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, frequency, program, donorName, donorEmail, donorPhone } =
      body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!donorEmail || !String(donorEmail).includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }
    if (!donorPhone || String(donorPhone).replace(/\s/g, "").length < 9) {
      return NextResponse.json(
        { error: "Please enter a valid phone number for Mobile Money." },
        { status: 400 }
      );
    }

    const amountUsd = Number(amount);
    const amountUgx = Math.round(amountUsd * UGX_PER_USD);

    if (amountUgx < 500) {
      return NextResponse.json(
        { error: "Minimum donation is 500 UGX" },
        { status: 400 }
      );
    }

    const isMonthly = frequency === "monthly";

    // Your own reference — used as the DB lookup key
    const merchantRef = `SOA${Date.now().toString(36).slice(-8)}${Math.random()
      .toString(36)
      .substring(2, 6)}`.slice(0, 15).padEnd(13, "0");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const nextChargeAt = isMonthly
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    await supabase.from("donations").insert({
      reference: merchantRef,
      amount: amountUsd,
      currency: "USD",
      settle_currency: "UGX",
      settle_amount: amountUgx,
      frequency: frequency || "one-time",
      program: program || "general",
      donor_name: donorName || null,
      donor_email: donorEmail,
      donor_phone: donorPhone || null,
      preferred_method: "mobile_money",
      status: "pending",
      payment_method: "nylonpay",
      is_active_subscription: isMonthly,
      next_charge_at: nextChargeAt,
    });

    const description = `Donation to Save the Orphans Africa — ${
      program || "General Fund"
    } ($${amountUsd.toFixed(2)})`;

    const collected = await collectDonation({
      amount: amountUgx,
      currency: "UGX",
      description,
      customer: {
        name: donorName || "Donor",
        email: donorEmail,
        phone: donorPhone,
      },
      merchantReference: merchantRef,
      metadata: {
        reference: merchantRef,
        program: String(program || "general"),
        frequency: String(frequency || "one-time"),
        amount_usd: String(amountUsd),
        amount_ugx: String(amountUgx),
      },
    });

    if (!collected.success) {
      await supabase
        .from("donations")
        .update({ status: "failed", raw_gateway_response: collected })
        .eq("reference", merchantRef);

      return NextResponse.json(
        { error: collected.error || "Failed to start Mobile Money payment" },
        { status: 500 }
      );
    }

    // Save Nylon Pay's UUID for webhook lookup
    await supabase
      .from("donations")
      .update({ payment_reference: collected.reference })
      .eq("reference", merchantRef);

    return NextResponse.json({
      mode: "prompt",
      merchantRef,
      paymentReference: collected.reference,
      isSubscription: isMonthly,
      message: isMonthly
        ? "A payment prompt has been sent to your phone. Approve it to start your monthly gift. You'll receive a new prompt each month."
        : "A payment prompt has been sent to your phone. Approve it to complete your donation.",
    });
  } catch (error: any) {
    console.error("Donate endpoint error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}