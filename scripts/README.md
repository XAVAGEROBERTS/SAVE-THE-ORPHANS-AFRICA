# Scripts

One-time and diagnostic tools for Save the Orphans Africa.

## diagnose-nylon-tx.ts
Prints the 5 most recent transactions from Nylon Pay to inspect field names
(`id`, `reference`, etc).

    npx tsx scripts/diagnose-nylon-tx.ts

## backfill-nylon-tx-ids.ts
Backfills `nylon_transaction_id` on donations by matching each row to a
Nylon transaction via invoice ID or (amount + time).

    npx tsx scripts/backfill-nylon-tx-ids.ts

Both scripts require `.env.local` with the following set:
- NYLONPAY_API_KEY
- NYLONPAY_API_SECRET
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
