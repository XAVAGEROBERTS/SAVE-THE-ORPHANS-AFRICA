import { config } from "dotenv";
config({ path: ".env.local" });

import { createNylonPay } from "@nile-squad/nylonpay-ts";

async function main() {
  const apiKey = (process.env.NYLONPAY_API_KEY || "").trim();
  const apiSecret = (process.env.NYLONPAY_API_SECRET || "").trim();
  const nylon = createNylonPay({ apiKey, apiSecret });

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400_000).toISOString();
  const result = await nylon.listTransactions({ limit: 100, createdAfter: ninetyDaysAgo });

  if (!result.isOk) { console.error(result.error); process.exit(1); }

  // Print the 5 most recent transactions in full detail
  const recent = result.value.transactions.slice(0, 5);
  for (const t of recent) {
    console.log(JSON.stringify({
      id: t.id,
      reference: t.reference,
      amount: t.amount,
      status: t.status,
      type: t.type,
      createdAt: t.createdAt,
      tags: t.tags,
    }, null, 2));
    console.log("---");
  }
}

main().catch(console.error);
