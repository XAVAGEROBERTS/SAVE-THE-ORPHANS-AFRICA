import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { submitOrder } from "@/lib/pesapal";

const UGX_PER_USD = Number(process.env.UGX_PER_USD || 3700);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      frequency,
      program,
      donorName,
      donorEmail,
      donorPhone,
      preferredMethod,
    } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!donorEmail || !String(donorEmail).includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const amountUsd = Number(amount);
    const amountUgx = Math.round(amountUsd * UGX_PER_USD);

    if (amountUgx < 500) {
      const minUsd = (500 / UGX_PER_USD).toFixed(2);
      return NextResponse.json(
        { error: `Minimum donation is about $${minUsd} (500 UGX)` },
        { status: 400 }
      );
    }

    const merchantRef = `SOA-PESP-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)
      .toUpperCase()}`;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
      preferred_method: preferredMethod || "card",
      status: "pending",
      payment_method: "pesapal",
    });

    const [firstName, ...rest] = String(donorName || "Donor")
      .trim()
      .split(/\s+/);
    const lastName = rest.join(" ") || "Donor";

    // Determine if this is a monthly/recurring donation
    const isMonthly = frequency === "monthly";

    // Format dates for Pesapal (dd-MM-yyyy)
    const pad = (n: number) => String(n).padStart(2, "0");
    const fmt = (d: Date) =>
      `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 10); // 10-year open-ended monthly gift

    const order = await submitOrder({
      id: merchantRef,
      amount: amountUgx,
      currency: "UGX",
      description: isMonthly
        ? `Monthly donation to Save the Orphans Africa — ${
            program || "General Fund"
          }`
        : `Donation to Save the Orphans Africa — ${
            program || "General Fund"
          } ($${amountUsd.toFixed(2)})`,
      callbackUrl: `${siteUrl}/donate/success?ref=${merchantRef}&gateway=pesapal`,
      cancellationUrl: `${siteUrl}/donate`,
      billingAddress: {
        email_address: donorEmail,
        phone_number: donorPhone || undefined,
        first_name: firstName,
        last_name: lastName,
        country_code: "UG",
      },
      // Recurring payment fields (only for monthly)
      ...(isMonthly
        ? {
            accountNumber: merchantRef,
            subscription: {
              start_date: fmt(startDate),
              end_date: fmt(endDate),
              frequency: "MONTHLY" as const,
            },
          }
        : {}),
    });

    await supabase
      .from("donations")
      .update({
        payment_reference: order.order_tracking_id,
      })
      .eq("reference", merchantRef);

    return NextResponse.json({
      redirectUrl: order.redirect_url,
      orderTrackingId: order.order_tracking_id,
      merchantReference: merchantRef,
    });
  } catch (error: any) {
    console.error("Pesapal donate error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}