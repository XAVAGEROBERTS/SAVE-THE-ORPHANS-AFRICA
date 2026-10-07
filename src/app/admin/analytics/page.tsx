"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Target,
  Award,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Range = "7d" | "30d" | "90d" | "1y" | "all";

interface Analytics {
  range: Range;
  kpis: {
    totalRaised: number;
    totalAttempts: number;
    completedCount: number;
    successRate: number;
    avgDonation: number;
  };
  trend: { day: string; total: number; count: number }[];
  programs: { program: string; total: number; count: number }[];
  methods: { method: string; total: number; count: number }[];
  frequencies: { frequency: string; total: number; count: number }[];
  topDonors: { email: string; total: number; count: number; name: string }[];
  funnel: {
    attempted: number;
    completed: number;
    pending: number;
    failed: number;
    abandoned: number;
    expired: number;
  };
}

const PALETTE = [
  "#176B45",
  "#F4B942",
  "#E53E3E",
  "#805AD5",
  "#3182CE",
  "#DD6B20",
];

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="card p-6 flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}20` }}
      >
        <Icon className="w-6 h-6" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-dark/50 mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-dark truncate">{value}</p>
        {sub && <p className="text-xs text-dark/60 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<Range>("30d");

  async function load() {
    setIsLoading(true);
    const res = await fetch(`/api/admin/analytics?range=${range}`);
    const json = await res.json();
    setData(json);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const ranges: { value: Range; label: string }[] = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "1y", label: "1 year" },
    { value: "all", label: "All time" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Analytics</h1>
          <p className="text-dark/60 mt-1">
            Donation trends, conversion, and donor insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1 bg-light rounded-xl p-1">
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

      {isLoading || !data ? (
        <div className="card p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-dark/60">Loading analytics…</p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={DollarSign}
              label="Total Raised"
              value={fmtMoney(data.kpis.totalRaised)}
              sub={`${data.kpis.completedCount} donations`}
              accent="#176B45"
            />
            <KpiCard
              icon={TrendingUp}
              label="Success Rate"
              value={`${data.kpis.successRate.toFixed(1)}%`}
              sub={`${data.kpis.completedCount} of ${data.kpis.totalAttempts} attempts`}
              accent="#3182CE"
            />
            <KpiCard
              icon={Award}
              label="Average Donation"
              value={fmtMoney(data.kpis.avgDonation)}
              sub="Per successful donation"
              accent="#F4B942"
            />
            <KpiCard
              icon={Target}
              label="Total Attempts"
              value={data.kpis.totalAttempts.toLocaleString()}
              sub="All statuses"
              accent="#805AD5"
            />
          </div>

          {/* Donation trend */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">Donation Trend</h2>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#176B45" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#176B45" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: any) => fmtMoney(Number(v))}
                    labelFormatter={(l) => `Date: ${l}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#176B45"
                    strokeWidth={2}
                    fill="url(#trendFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Programs */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Raised by Program</h2>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={data.programs}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="program" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: any) => fmtMoney(Number(v))} />
                    <Bar dataKey="total" fill="#176B45" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Methods */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">By Payment Method</h2>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.methods}
                      dataKey="total"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {data.methods.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmtMoney(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Conversion Funnel</h2>
              <div className="space-y-3">
                {[
                  { label: "Attempted", value: data.funnel.attempted, color: "bg-dark/20" },
                  { label: "Completed", value: data.funnel.completed, color: "bg-green-500" },
                  { label: "Pending", value: data.funnel.pending, color: "bg-yellow-500" },
                  { label: "Failed", value: data.funnel.failed, color: "bg-red-500" },
                  { label: "Abandoned", value: data.funnel.abandoned, color: "bg-gray-400" },
                  { label: "Expired", value: data.funnel.expired, color: "bg-orange-500" },
                ].map((row) => {
                  const pct =
                    data.funnel.attempted > 0
                      ? (row.value / data.funnel.attempted) * 100
                      : 0;
                  return (
                    <div key={row.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-dark">{row.label}</span>
                        <span className="text-dark/60">
                          {row.value} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-light rounded-full overflow-hidden">
                        <div
                          className={`h-full ${row.color} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top donors */}
            <div className="card p-6">
              <h2 className="font-bold text-lg mb-4">Top Donors</h2>
              {data.topDonors.length === 0 ? (
                <p className="text-dark/60 text-sm">No donations yet</p>
              ) : (
                <div className="space-y-3">
                  {data.topDonors.map((d, i) => (
                    <div key={d.email} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-dark truncate">
                          {d.name || d.email}
                        </p>
                        <p className="text-xs text-dark/50 truncate">{d.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">
                          {fmtMoney(d.total)}
                        </p>
                        <p className="text-xs text-dark/50">
                          {d.count} donation{d.count > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
