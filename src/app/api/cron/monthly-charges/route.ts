import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { collectDonation } from "@/lib/nylonpay";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date().toISOString();

    const { data: pledges, error } = await supabase
      .from("donations")
      .select("*")
      .eq("frequency", "monthly")
      .eq("is_active_subscription", true)
      .is("subscription_cancelled_at", null)
      .lte("next_charge_at", now)
      .order("next_charge_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("monthly-charges: fetch error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!pledges || pledges.length === 0) {
      return NextResponse.json({ processed: 0, message: "No charges due" });
    }

    const results: any[] = [];

    for (const pledge of pledges) {
      try {
        const merchantRef = `REC${Date.now().toString(36).slice(-8)}${Math.random()
          .toString(36)
          .substring(2, 6)}`.slice(0, 15).padEnd(13, "0");

        const amountUgx = Number(pledge.settle_amount);
        const description = `Monthly donation to Save the Orphans Africa — ${
          pledge.program || "General Fund"
        }`;

        await supabase.from("donations").insert({
          reference: merchantRef,
          parent_reference: pledge.reference,
          amount: pledge.amount,
          currency: pledge.currency,
          settle_currency: "UGX",
          settle_amount: amountUgx,
          frequency: "monthly",
          program: pledge.program,
          donor_name: pledge.donor_name,
          donor_email: pledge.donor_email,
          donor_phone: pledge.donor_phone,
          preferred_method: "mobile_money",
          status: "pending",
          payment_method: "nylonpay",
        });

        const collected = await collectDonation({
          amount: amountUgx,
          currency: "UGX",
          description,
          customer: {
            name: pledge.donor_name || "Donor",
            email: pledge.donor_email,
            phone: pledge.donor_phone,
          },
          merchantReference: merchantRef,
          metadata: {
            reference: merchantRef,
            parent_reference: pledge.reference,
            program: String(pledge.program || "general"),
            frequency: "monthly",
            amount_ugx: String(amountUgx),
          },
        });

        if (collected.success) {
          await supabase
            .from("donations")
            .update({ payment_reference: collected.reference })
            .eq("reference", merchantRef);
        } else {
          await supabase
            .from("donations")
            .update({ status: "failed", raw_gateway_response: collected })
            .eq("reference", merchantRef);
        }

        const nextDelayDays = collected.success ? 30 : 7;
        const next = new Date(
          Date.now() + nextDelayDays * 24 * 60 * 60 * 1000
        ).toISOString();

        await supabase
          .from("donations")
          .update({ next_charge_at: next })
          .eq("id", pledge.id);

        results.push({
          pledge: pledge.reference,
          charge: merchantRef,
          success: collected.success,
        });
      } catch (err: any) {
        console.error(`monthly-charges: pledge ${pledge.reference} failed`, err);
        results.push({ pledge: pledge.reference, error: err.message });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (err: any) {
    console.error("monthly-charges cron error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}