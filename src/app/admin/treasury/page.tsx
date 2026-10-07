"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Loader2,
  Wallet,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  Clock,
} from "lucide-react";

type Range = "7d" | "30d" | "90d" | "1y" | "all";

interface TreasuryData {
  range: Range;
  currency: string;
  kpis: {
    currentBalance: number;
    netCollections: number;
    netPayouts: number;
    netWithdraws: number;
    netCharges: number;
    netRefunds: number;
    avgProcessingSeconds: number;
  };
  counts: {
    collections: number;
    payouts: number;
    refunds: number;
    charges: number;
  };
  recent: {
    id: string;
    reference: string;
    merchantRef: string | null;
    amount: number;
    currency: string;
    status: string;
    rawStatus?: string;
    type: string;
    method: string | null;
    tags: string[];
    createdAt: string;
  }[];
  trend: { day: string; total: number }[];
  transactionCount: number;
}

function fmtMoney(amount: number, currency: string): string {
  return `${currency} ${Math.round(amount).toLocaleString()}`;
}

function fmtSeconds(s: number): string {
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}m ${sec}s`;
}

function typeLabel(type: string): string {
  switch (type) {
    case "collection": return "Collection";
    case "payout":     return "Payout";
    case "charge":     return "Charge";
    case "refund":     return "Refund";
    case "chargeback": return "Chargeback";
    case "reversal":   return "Reversal";
    default:           return type;
  }
}

function statusBadge(status: string): string {
  switch (status) {
    case "successful":
    case "completed": return "bg-green-100 text-green-800";
    case "pending":
    case "initiated":
    case "processing":
    case "on_hold":   return "bg-yellow-100 text-yellow-800";
    case "failed":    return "bg-red-100 text-red-800";
    case "cancelled": return "bg-gray-100 text-gray-700";
    default:          return "bg-gray-100 text-gray-700";
  }
}

export default function TreasuryPage() {
  const [data, setData] = useState<TreasuryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("30d");

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/treasury?range=${range}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load treasury data");
      } else {
        setData(json);
      }
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const ranges: { value: Range; label: string }[] = [
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
    { value: "90d", label: "90d" },
    { value: "1y", label: "1y" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Treasury</h1>
          <p className="text-dark/60 mt-1">
            Live balance, payouts, and Nylon Pay account activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-light rounded-xl p-1">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  range === r.value
                    ? "bg-white text-primary shadow-sm"
                    : "text-dark/60 hover:text-dark"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="p-2 rounded-lg hover:bg-light"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-dark/60">Loading from Nylon Pay…</p>
        </div>
      ) : error ? (
        <div className="card p-6 border-l-4 border-red-500 bg-red-50">
          <p className="font-semibold text-red-800 mb-1">Could not load treasury</p>
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-xs text-red-600 mt-3">
            Check that NYLONPAY_API_KEY and NYLONPAY_API_SECRET are set in Vercel.
          </p>
        </div>
      ) : !data ? (
        <p className="text-dark/60">No data</p>
      ) : (
        <>
          <div className="card p-8 bg-[#0B3D2E] text-white">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm text-white/70 font-medium uppercase tracking-wider">
                Current Balance
              </span>
              <Wallet className="w-5 h-5 text-white/50" />
            </div>
            <p className="text-4xl md:text-5xl font-bold text-gold">
              {fmtMoney(data.kpis.currentBalance, data.currency)}
            </p>
            <p className="text-xs text-white/50 mt-3">
              {data.transactionCount} transactions in range · updated just now
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-dark/50 mb-1">
                  Net Collections
                </p>
                <p className="text-xl font-bold text-dark">
                  {fmtMoney(data.kpis.netCollections, data.currency)}
                </p>
                <p className="text-xs text-dark/50 mt-1">
                  {data.counts.collections} successful
                </p>
              </div>
            </div>

            <div className="card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-dark/50 mb-1">
                  Net Withdraws
                </p>
                <p className="text-xl font-bold text-dark">
                  {fmtMoney(data.kpis.netWithdraws, data.currency)}
                </p>
                <p className="text-xs text-dark/50 mt-1">
                  {data.counts.payouts} payouts
                </p>
              </div>
            </div>

            <div className="card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-dark/50 mb-1">
                  Net Charges
                </p>
                <p className="text-xl font-bold text-dark">
                  {fmtMoney(data.kpis.netCharges, data.currency)}
                </p>
                <p className="text-xs text-dark/50 mt-1">
                  {data.counts.charges > 0
                    ? `${data.counts.charges} fees`
                    : "Estimated at 3%"}
                </p>
              </div>
            </div>

            <div className="card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-dark/50 mb-1">
                  Refunds
                </p>
                <p className="text-xl font-bold text-dark">
                  {fmtMoney(data.kpis.netRefunds, data.currency)}
                </p>
                <p className="text-xs text-dark/50 mt-1">
                  {data.counts.refunds} refunds
                </p>
              </div>
            </div>

            <div className="card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-dark/50 mb-1">
                  Avg Processing Time
                </p>
                <p className="text-xl font-bold text-dark">
                  {fmtSeconds(data.kpis.avgProcessingSeconds)}
                </p>
                <p className="text-xs text-dark/50 mt-1">
                  Collection → confirmed
                </p>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-5 border-b border-light">
              <h2 className="font-bold text-lg">Recent Nylon Pay Transactions</h2>
              <p className="text-xs text-dark/60 mt-1">
                Live from Nylon Pay — collections, payouts, charges, refunds
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light text-xs uppercase text-dark/60">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Reference</th>
                    <th className="text-left px-4 py-3 font-semibold">Type</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Method</th>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light">
                  {data.recent.map((t) => {
                    const label = typeLabel(t.type);
                    return (
                      <tr key={t.id} className="hover:bg-light/50">
                        <td className="px-4 py-3 text-xs text-dark/80 max-w-[280px]">
                          <div className="mb-1">
                            <div className="text-[9px] uppercase tracking-wider text-dark/40 font-semibold mb-0.5">
                              Transaction ID
                            </div>
                            <div className="font-mono break-all">{t.reference}</div>
                          </div>
                          {t.merchantRef && (
                            <div>
                              <div className="text-[9px] uppercase tracking-wider text-dark/40 font-semibold mb-0.5">
                                Merchant Reference
                              </div>
                              <div className="font-mono text-primary font-semibold break-all">
                                {t.merchantRef}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-dark/70">
                            {label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-dark">
                          {fmtMoney(t.amount, t.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge(t.status)}`}>
                            {t.status}
                          </span>
                          {t.rawStatus && t.rawStatus !== t.status && (
                            <div className="text-[10px] text-dark/40 mt-1 font-mono">
                              {t.rawStatus}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-dark/70">
                          {t.method || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-dark/70 whitespace-nowrap">
                          {new Date(t.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                  {data.recent.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-dark/60">
                        No transactions in this range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
