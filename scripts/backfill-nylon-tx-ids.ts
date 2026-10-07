import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { createNylonPay } from "@nile-squad/nylonpay-ts";

async function main() {
  const apiKey = (process.env.NYLONPAY_API_KEY || "").trim();
  const apiSecret = (process.env.NYLONPAY_API_SECRET || "").trim();
  const nylon = createNylonPay({ apiKey, apiSecret });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400_000).toISOString();
  const result = await nylon.listTransactions({ limit: 100, createdAfter: ninetyDaysAgo });

  if (!result.isOk) { console.error(result.error); process.exit(1); }
  const txs = result.value.transactions;
  console.log(`Found ${txs.length} Nylon transactions\n`);

  // Clear all so we re-populate with correct values
  console.log("Clearing all nylon_transaction_id for re-population...");
  const { error: clearErr } = await supabase
    .from("donations")
    .update({ nylon_transaction_id: null })
    .eq("payment_method", "nylonpay");

  if (clearErr) { console.error(clearErr.message); process.exit(1); }
  console.log("✅ Cleared\n");

  const { data: donations } = await supabase
    .from("donations")
    .select("id, reference, amount, settle_amount, created_at, payment_reference")
    .eq("payment_method", "nylonpay");

  console.log(`Found ${donations?.length || 0} donations\n`);

  let matched = 0;
  for (const d of donations ?? []) {
    const donationTime = new Date(d.created_at).getTime();
    const donationAmount = Number(d.settle_amount || d.amount);

    // PRIMARY: match by invoice-id (payment_reference === tx.id)
    const byInvoice = txs.find((t) => t.id === d.payment_reference);

    // FALLBACK: match by amount + time
    const byTimeAmount = txs.find((t) => {
      const txTime = new Date(t.createdAt).getTime();
      const txAmount = Number(t.amount);
      return Math.abs(txTime - donationTime) < 120_000 && Math.abs(txAmount - donationAmount) < 1;
    });

    const match = byInvoice || byTimeAmount;
    const matchedBy = byInvoice ? "invoice-id" : byTimeAmount ? "amount+time" : "none";

    if (match) {
      // ✅ Use `reference` (transaction ID), NOT `id` (invoice ID)
      const txId = match.reference;
      const { error: updateErr } = await supabase
        .from("donations")
        .update({ nylon_transaction_id: txId })
        .eq("id", d.id);

      if (updateErr) {
        console.error(`❌ ${d.reference}:`, updateErr.message);
      } else {
        console.log(`✅ ${d.reference} → ${txId} (via ${matchedBy})`);
        matched++;
      }
    } else {
      console.log(`⚠️  ${d.reference} — no match`);
    }
  }

  console.log(`\nDone. Matched ${matched} of ${donations?.length || 0}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
