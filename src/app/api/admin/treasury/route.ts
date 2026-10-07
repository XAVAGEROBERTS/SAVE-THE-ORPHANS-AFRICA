import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { getClient as getNylonPay } from "@/lib/nylonpay";

export const dynamic = "force-dynamic";

type Range = "7d" | "30d" | "90d" | "1y" | "all";

function rangeStart(range: Range): string | null {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  switch (range) {
    case "7d": return new Date(now - 7 * day).toISOString();
    case "30d": return new Date(now - 30 * day).toISOString();
    case "90d": return new Date(now - 90 * day).toISOString();
    case "1y": return new Date(now - 365 * day).toISOString();
    case "all": return null;
  }
}

interface TxSummary {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  method: string | null;
  mode: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

async function fetchAllTransactions(
  nylonpay: any,
  filters: { createdAfter?: string; createdBefore?: string }
): Promise<TxSummary[]> {
  const pageSize = 100;
  const maxPages = 5;
  const all: TxSummary[] = [];

  for (let page = 0; page < maxPages; page++) {
    const result = await nylonpay.listTransactions({
      limit: pageSize,
      offset: page * pageSize,
      ...filters,
    });

    if (!result.isOk) {
      console.error("[treasury] listTransactions failed:", result.error);
      break;
    }

    const txs: TxSummary[] = result.value.transactions || [];
    all.push(...txs);

    if (txs.length < pageSize) break;
  }

  return all;
}

export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") || "30d") as Range;
  const startIso = rangeStart(range) ?? undefined;

  let nylonpay;
  try {
    nylonpay = getNylonPay();
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Nylon Pay not configured" },
      { status: 500 }
    );
  }

  const transactions = await fetchAllTransactions(nylonpay, {
    createdAfter: startIso,
  });

  const isSuccessful = (s: string) => s === "successful" || s === "completed";

  const sum = (type: string) =>
    transactions
      .filter((t) => t.type === type && isSuccessful(t.status))
      .reduce((s, t) => s + Number(t.amount || 0), 0);

  const count = (type: string) =>
    transactions.filter((t) => t.type === type && isSuccessful(t.status)).length;

  const netCollections = sum("collection");
  const netRefunds = sum("refund");
  const netCharges = sum("charge");
  const netWithdraws = sum("payout");
  const netPayouts = sum("payout");

  const currentBalance =
    netCollections - netWithdraws - netCharges - netRefunds;

  const successfulCollections = transactions.filter(
    (t) => t.type === "collection" && isSuccessful(t.status)
  );
  let avgProcessingSeconds = 0;
  if (successfulCollections.length > 0) {
    const totalMs = successfulCollections.reduce((s, t) => {
      const a = new Date(t.createdAt).getTime();
      const b = new Date(t.updatedAt).getTime();
      return s + Math.max(0, b - a);
    }, 0);
    avgProcessingSeconds = totalMs / successfulCollections.length / 1000;
  }

  const recent = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 20)
    .map((t) => ({
      id: t.id,
      reference: t.reference,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      type: t.type,
      method: t.method,
      createdAt: t.createdAt,
    }));

  const byDay = new Map<string, number>();
  for (const t of successfulCollections) {
    const day = new Date(t.createdAt).toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + Number(t.amount || 0));
  }
  const trend = Array.from(byDay.entries())
    .map(([day, total]) => ({ day, total }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return NextResponse.json({
    range,
    currency: successfulCollections[0]?.currency || "UGX",
    kpis: {
      currentBalance,
      netCollections,
      netPayouts,
      netWithdraws,
      netCharges,
      netRefunds,
      avgProcessingSeconds,
    },
    counts: {
      collections: count("collection"),
      payouts: count("payout"),
      refunds: count("refund"),
      charges: count("charge"),
    },
    recent,
    trend,
    transactionCount: transactions.length,
  });
}
