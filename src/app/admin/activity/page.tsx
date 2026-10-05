"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Activity, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { formatDate } from "@/utils/format";

interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string;
  user_name: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  record_summary: string | null;
  changes: any;
  created_at: string;
}

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800",
  login: "bg-purple-100 text-purple-800",
  logout: "bg-gray-100 text-gray-800",
};

export default function ActivityPage() {
  const { data: activities, isLoading } = useRealtimeTable<ActivityLog>({
    table: "admin_activity",
    orderBy: { column: "created_at", ascending: false },
  });

  const [filtered, setFiltered] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let result = activities;

    if (actionFilter !== "all") {
      result = result.filter((a) => a.action === actionFilter);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.user_email?.toLowerCase().includes(s) ||
          a.user_name?.toLowerCase().includes(s) ||
          a.table_name?.toLowerCase().includes(s) ||
          a.record_summary?.toLowerCase().includes(s)
      );
    }

    setFiltered(result);
  }, [activities, search, actionFilter]);

  function exportCSV() {
    const headers = ["User", "Email", "Action", "Table", "Summary", "Date"];
    const rows = filtered.map((a) => [
      a.user_name || "",
      a.user_email,
      a.action,
      a.table_name,
      a.record_summary || "",
      new Date(a.created_at).toISOString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `activity-${new Date().toISOString().split("T")[0]}.csv`;
    el.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Activity Log</h1>
          <p className="text-dark/60 mt-1 flex items-center gap-2">
            {activities.length} total events
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="form-input w-40"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
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
            Export
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-dark/60">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Activity className="w-12 h-12 text-dark/20 mx-auto mb-4" />
          <p className="text-dark/60">No activity yet.</p>
          <p className="text-dark/40 text-sm mt-2">
            Admin actions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-light">
            {filtered.map((log) => {
              const isOpen = expanded === log.id;
              return (
                <div key={log.id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : log.id)}
                    className="w-full text-left p-4 hover:bg-light/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                              actionColors[log.action] || actionColors.update
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-xs text-dark/50 font-mono">
                            {log.table_name}
                          </span>
                        </div>
                        <div className="text-sm text-dark font-medium truncate">
                          {log.record_summary || "No summary"}
                        </div>
                        <div className="text-xs text-dark/50 mt-1">
                          by {log.user_name || log.user_email}
                        </div>
                      </div>
                      <div className="text-xs text-dark/40 shrink-0">
                        {formatDate(log.created_at)}
                      </div>
                    </div>
                  </button>

                  {isOpen && log.changes && (
                    <div className="px-4 pb-4 bg-light/30">
                      <div className="bg-white rounded-lg p-3 border border-light">
                        <p className="text-xs font-semibold text-dark/60 mb-2">
                          Change Details
                        </p>
                        <pre className="text-xs text-dark/70 overflow-x-auto whitespace-pre-wrap break-all">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}