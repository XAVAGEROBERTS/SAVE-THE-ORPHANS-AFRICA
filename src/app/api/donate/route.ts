import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createInvoice } from "@/lib/nylonpay";

const UGX_PER_USD = Number(process.env.UGX_PER_USD || 3700);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, frequency, program, donorName, donorEmail } = body;

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

    const merchantRef = `SOA${Date.now().toString(36).slice(-8)}${Math.random()
      .toString(36)
      .substring(2, 6)}`.slice(0, 15).padEnd(13, "0");

    // Use the service role for the insert (RLS bypass)
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const isMonthly = frequency === "monthly";

    await adminSupabase.from("donations").insert({
      reference: merchantRef,
      amount: amountUsd,
      currency: "USD",
      settle_currency: "UGX",
      settle_amount: amountUgx,
      frequency: frequency || "one-time",
      program: program || "general",
      donor_name: donorName || null,
      donor_email: donorEmail,
      donor_phone: null,
      preferred_method: "mobile_money",
      status: "pending",
      payment_method: "nylonpay",
      is_active_subscription: isMonthly,
      next_charge_at: isMonthly
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    });

    const description = `Donation to Save the Orphans Africa — ${
      program || "General Fund"
    } ($${amountUsd.toFixed(2)})`;

    const metadata = {
      reference: merchantRef,
      program: String(program || "general"),
      frequency: String(frequency || "one-time"),
      amount_usd: String(amountUsd),
      amount_ugx: String(amountUgx),
    };

    const invoice = await createInvoice({
      amount: amountUgx,
      currency: "UGX",
      description,
      customer: {
        name: donorName || "Donor",
        email: donorEmail,
      },
      merchantReference: merchantRef,
      metadata,
    });

    if (!invoice.success || !invoice.payment_url) {
      await adminSupabase
        .from("donations")
        .update({
          status: "failed",
          gateway_status: "invoice_create_failed",
          raw_gateway_response: invoice,
        })
        .eq("reference", merchantRef);

      return NextResponse.json(
        {
          error:
            invoice.error ||
            "Could not start the payment. Please try again.",
        },
        { status: 500 }
      );
    }

    await adminSupabase
      .from("donations")
      .update({
        payment_reference: invoice.invoice_id || invoice.reference,
      })
      .eq("reference", merchantRef);

    return NextResponse.json({
      mode: "link",
      paymentLink: invoice.payment_url,
      merchantRef,
      invoiceId: invoice.invoice_id,
    });
  } catch (error: any) {
    console.error("Donate endpoint error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}