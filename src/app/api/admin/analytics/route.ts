import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/admin/auth";

type Range = "7d" | "30d" | "90d" | "1y" | "all";

function rangeStart(range: Range): string | null {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  switch (range) {
    case "7d":
      return new Date(now - 7 * day).toISOString();
    case "30d":
      return new Date(now - 30 * day).toISOString();
    case "90d":
      return new Date(now - 90 * day).toISOString();
    case "1y":
      return new Date(now - 365 * day).toISOString();
    case "all":
      return null;
  }
}

export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") || "30d") as Range;
  const startIso = rangeStart(range);

  const supabase = createAdminClient();

  // Base query — all donations in range
  let query = supabase
    .from("donations")
    .select(
      "id, reference, amount, currency, frequency, program, donor_email, donor_name, status, payment_method, preferred_method, created_at, completed_at"
    )
    .order("created_at", { ascending: false });

  if (startIso) {
    query = query.gte("created_at", startIso);
  }

  const { data: donations, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = donations || [];
  const completed = rows.filter((d) => d.status === "completed");
  const failed = rows.filter((d) => d.status === "failed");
  const pending = rows.filter((d) => d.status === "pending");
  const abandoned = rows.filter((d) => d.status === "abandoned");
  const expired = rows.filter((d) => d.status === "expired");

  // ---- KPIs ----
  const totalRaised = completed.reduce((s, d) => s + Number(d.amount || 0), 0);
  const totalAttempts = rows.length;
  const successRate =
    totalAttempts > 0 ? (completed.length / totalAttempts) * 100 : 0;
  const avgDonation =
    completed.length > 0 ? totalRaised / completed.length : 0;

  // ---- Time-series: daily totals ----
  const byDay = new Map<string, { total: number; count: number }>();
  for (const d of completed) {
    const day = new Date(d.created_at).toISOString().slice(0, 10);
    const cur = byDay.get(day) || { total: 0, count: 0 };
    cur.total += Number(d.amount || 0);
    cur.count += 1;
    byDay.set(day, cur);
  }
  const trend = Array.from(byDay.entries())
    .map(([day, v]) => ({ day, total: v.total, count: v.count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  // ---- By program ----
  const byProgram = new Map<string, { total: number; count: number }>();
  for (const d of completed) {
    const key = d.program || "general";
    const cur = byProgram.get(key) || { total: 0, count: 0 };
    cur.total += Number(d.amount || 0);
    cur.count += 1;
    byProgram.set(key, cur);
  }
  const programs = Array.from(byProgram.entries())
    .map(([program, v]) => ({ program, total: v.total, count: v.count }))
    .sort((a, b) => b.total - a.total);

  // ---- By method ----
  const byMethod = new Map<string, { total: number; count: number }>();
  for (const d of completed) {
    const key =
      d.payment_method === "nylonpay"
        ? d.preferred_method === "card"
          ? "Card"
          : "Mobile Money"
        : d.payment_method || "Other";
    const cur = byMethod.get(key) || { total: 0, count: 0 };
    cur.total += Number(d.amount || 0);
    cur.count += 1;
    byMethod.set(key, cur);
  }
  const methods = Array.from(byMethod.entries())
    .map(([method, v]) => ({ method, total: v.total, count: v.count }))
    .sort((a, b) => b.total - a.total);

  // ---- By frequency ----
  const byFrequency = new Map<string, { total: number; count: number }>();
  for (const d of completed) {
    const key = d.frequency || "one-time";
    const cur = byFrequency.get(key) || { total: 0, count: 0 };
    cur.total += Number(d.amount || 0);
    cur.count += 1;
    byFrequency.set(key, cur);
  }
  const frequencies = Array.from(byFrequency.entries())
    .map(([frequency, v]) => ({ frequency, total: v.total, count: v.count }));

  // ---- Top donors (by total raised) ----
  const byDonor = new Map<string, { total: number; count: number; name: string }>();
  for (const d of completed) {
    const key = d.donor_email || "unknown";
    const cur = byDonor.get(key) || {
      total: 0,
      count: 0,
      name: d.donor_name || "",
    };
    cur.total += Number(d.amount || 0);
    cur.count += 1;
    byDonor.set(key, cur);
  }
  const topDonors = Array.from(byDonor.entries())
    .map(([email, v]) => ({ email, total: v.total, count: v.count, name: v.name }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // ---- Status funnel ----
  const funnel = {
    attempted: totalAttempts,
    completed: completed.length,
    pending: pending.length,
    failed: failed.length,
    abandoned: abandoned.length,
    expired: expired.length,
  };

  return NextResponse.json({
    range,
    kpis: {
      totalRaised,
      totalAttempts,
      completedCount: completed.length,
      successRate,
      avgDonation,
    },
    trend,
    programs,
    methods,
    frequencies,
    topDonors,
    funnel,
  });
}
