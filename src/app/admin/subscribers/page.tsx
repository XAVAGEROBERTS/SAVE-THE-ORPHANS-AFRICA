"use client";

import { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { formatDate } from "@/utils/format";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  is_active: boolean;
}

export default function SubscribersPage() {
  const { data: subscribers, isLoading } = useRealtimeTable<Subscriber>({
    table: "subscribers",
    orderBy: { column: "subscribed_at", ascending: false },
  });

  const [filtered, setFiltered] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!search) {
      setFiltered(subscribers);
    } else {
      const s = search.toLowerCase();
      setFiltered(
        subscribers.filter(
          (sub) =>
            sub.email?.toLowerCase().includes(s) ||
            (sub.name?.toLowerCase().includes(s) ?? false)
        )
      );
    }
  }, [search, subscribers]);

  function exportCSV() {
    const headers = ["Email", "Name", "Subscribed At", "Status"];
    const rows = filtered.map((sub) => [
      sub.email,
      sub.name || "",
      new Date(sub.subscribed_at).toISOString(),
      sub.is_active ? "Active" : "Unsubscribed",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Newsletter Subscribers</h1>
          <p className="text-dark/60 mt-1 flex items-center gap-2">
            {subscribers.filter((s) => s.is_active).length} active ·{" "}
            {subscribers.length} total
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 w-64"
            />
          </div>
          <button onClick={exportCSV} className="btn-primary text-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-dark/60">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-dark/60">No subscribers yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-dark">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-dark">Email</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-dark">Subscribed</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-dark">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-light/50">
                  <td className="px-6 py-4 text-sm text-dark">{sub.name || "—"}</td>
                  <td className="px-6 py-4 text-sm text-dark">{sub.email}</td>
                  <td className="px-6 py-4 text-sm text-dark/60">
                    {formatDate(sub.subscribed_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        sub.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {sub.is_active ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}