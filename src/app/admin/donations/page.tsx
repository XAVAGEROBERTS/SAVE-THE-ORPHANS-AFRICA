"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Download,
  DollarSign,
  Trash2,
  Edit,
  X,
  RefreshCw,
  CheckSquare,
  Square,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { createClient } from "@/lib/supabase/client";

interface Donation {
  id: string;
  reference: string;
  parent_reference: string | null;
  amount: number;
  currency: string;
  settle_currency: string | null;
  settle_amount: number | null;
  frequency: string;
  program: string;
  donor_name: string | null;
  donor_email: string | null;
  donor_phone: string | null;
  status: string;
  payment_method: string | null;
  preferred_method: string | null;
  gateway_status: string | null;
  payment_reference: string | null;
  created_at: string;
  completed_at: string | null;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

function gatewayLabel(d: Donation): string {
  if (d.reference?.startsWith("REC")) return "Nylon Pay · Recurring";
  if (d.payment_method === "nylonpay") {
    if (d.parent_reference) return "Nylon Pay · Recurring";
    return "Nylon Pay";
  }
  if (d.payment_method === "pesapal" || d.reference?.includes("PESP")) {
    return "Pesapal";
  }
  return "—";
}

function methodLabel(d: Donation): string {
  if (d.payment_method === "nylonpay") {
    if (d.preferred_method === "card") return "Card";
    if (d.preferred_method === "mobile_money") return "Mobile Money";
    return "Mobile Money";
  }
  if (d.payment_method === "pesapal") {
    return d.preferred_method === "card" ? "Card" : "Pesapal";
  }
  return d.payment_method || d.preferred_method || "—";
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filtered, setFiltered] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Donation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkWorking, setIsBulkWorking] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/donations");
      const json = await res.json();
      setDonations(json.data || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-donations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        (payload) => {
          setDonations((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Donation;
              if (prev.some((d) => d.id === row.id)) return prev;
              return [row, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as Donation;
              return prev.map((d) => (d.id === row.id ? row : d));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as Donation;
              return prev.filter((d) => d.id !== row.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let result = donations;

    if (statusFilter === "recurring") {
      result = result.filter((d) => d.frequency === "monthly");
    } else if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.reference.toLowerCase().includes(s) ||
          (d.parent_reference?.toLowerCase().includes(s) ?? false) ||
          (d.donor_name?.toLowerCase().includes(s) ?? false) ||
          (d.donor_email?.toLowerCase().includes(s) ?? false) ||
          (d.payment_reference?.toLowerCase().includes(s) ?? false)
      );
    }

    setFiltered(result);
  }, [search, statusFilter, donations]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [statusFilter, search]);

  const allVisibleSelected = useMemo(() => {
    if (filtered.length === 0) return false;
    return filtered.every((d) => selectedIds.has(d.id));
  }, [filtered, selectedIds]);

  const someVisibleSelected = useMemo(() => {
    if (filtered.length === 0) return false;
    const any = filtered.some((d) => selectedIds.has(d.id));
    return any && !allVisibleSelected;
  }, [filtered, selectedIds, allVisibleSelected]);

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filtered.forEach((d) => next.delete(d.id));
      } else {
        filtered.forEach((d) => next.add(d.id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function updateStatus(id: string, status: string) {
    if (status !== "refunded") {
      alert(
        "Only 'refunded' can be set manually. Payment statuses come from the gateway."
      );
      return;
    }

    // Client-side guard: only completed can be refunded
    const target = donations.find((d) => d.id === id);
    if (!target || target.status !== "completed") {
      alert(
        `Cannot refund a donation with status "${target?.status || "unknown"}". Only completed donations can be refunded.`
      );
      return;
    }

    setIsSaving(true);
    const res = await fetch(`/api/admin/donations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setIsSaving(false);

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error || "Failed to update status");
      return;
    }

    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this donation? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/donations/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error || "Failed to delete");
      return;
    }
    setDonations(donations.filter((d) => d.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function bulkDelete() {
    const count = selectedIds.size;
    if (count === 0) return;

    const verb = count === 1 ? "donation" : "donations";
    if (
      !confirm(
        `Delete ${count} ${verb}? This cannot be undone.\n\nWarning: Recurring pledges with active subscriptions should be cancelled, not deleted.`
      )
    ) {
      return;
    }

    setIsBulkWorking(true);
    const ids = Array.from(selectedIds);
    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/admin/donations/${id}`, { method: "DELETE" }).then((r) => {
            if (!r.ok) throw new Error(`Failed: ${id}`);
            return id;
          })
        )
      );

      const succeeded = results
        .filter((r) => r.status === "fulfilled")
        .map((r: any) => r.value);

      setDonations((prev) => prev.filter((d) => !succeeded.includes(d.id)));
      clearSelection();

      const failedCount = count - succeeded.length;
      if (failedCount > 0) {
        alert(
          `${succeeded.length} of ${count} deleted.\n${failedCount} failed — refresh and try again.`
        );
      }
    } finally {
      setIsBulkWorking(false);
    }
  }

  async function bulkMarkRefunded() {
    const selected = donations.filter((d) => selectedIds.has(d.id));
    const refundable = selected.filter((d) => d.status === "completed");
    const skipped = selected.length - refundable.length;

    if (refundable.length === 0) {
      alert(
        "None of the selected donations can be refunded. Only completed donations can be refunded."
      );
      return;
    }

    const verb = refundable.length === 1 ? "donation" : "donations";
    const skipMsg = skipped > 0 ? `\n\n${skipped} will be skipped (not completed).` : "";

    if (!confirm(`Mark ${refundable.length} ${verb} as refunded?${skipMsg}`)) {
      return;
    }

    setIsBulkWorking(true);
    try {
      const results = await Promise.allSettled(
        refundable.map((d) =>
          fetch(`/api/admin/donations/${d.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "refunded" }),
          }).then((r) => {
            if (!r.ok) throw new Error(`Failed: ${d.id}`);
            return d.id;
          })
        )
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      clearSelection();

      if (succeeded !== refundable.length) {
        alert(
          `${succeeded} of ${refundable.length} refunded. Some failed — refresh to see current state.`
        );
      }
      load();
    } finally {
      setIsBulkWorking(false);
    }
  }

  const totalCompleted = donations
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const activeRecurring = donations.filter(
    (d) => d.frequency === "monthly" && !d.parent_reference
  ).length;

  const recurringCharges = donations.filter((d) => !!d.parent_reference).length;

  // How many selected rows are refundable right now
  const refundableSelectedCount = useMemo(() => {
    return donations.filter(
      (d) => selectedIds.has(d.id) && d.status === "completed"
    ).length;
  }, [donations, selectedIds]);

  function exportCSV() {
    const headers = [
      "Reference",
      "Parent Reference",
      "Amount",
      "Currency",
      "Settle Amount",
      "Settle Currency",
      "Frequency",
      "Program",
      "Donor",
      "Email",
      "Phone",
      "Status",
      "Gateway",
      "Method",
      "Gateway Status",
      "Payment Reference",
      "Created At",
      "Completed At",
    ];
    const rows = filtered.map((d) => [
      d.reference,
      d.parent_reference || "",
      d.amount.toString(),
      d.currency,
      d.settle_amount?.toString() || "",
      d.settle_currency || "",
      d.frequency,
      d.program,
      d.donor_name || "",
      d.donor_email || "",
      d.donor_phone || "",
      d.status,
      gatewayLabel(d),
      methodLabel(d),
      d.gateway_status || "",
      d.payment_reference || "",
      new Date(d.created_at).toISOString(),
      d.completed_at ? new Date(d.completed_at).toISOString() : "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const selectionCount = selectedIds.size;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Donations</h1>
          <p className="text-dark/60 mt-1">
            {donations.filter((d) => d.status === "completed").length} completed · Total:{" "}
            <span className="font-semibold text-primary">
              ${totalCompleted.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            {activeRecurring > 0 && (
              <>
                {" "}· <span className="font-semibold">{activeRecurring}</span> recurring donors
                {recurringCharges > 0 && (
                  <span className="text-dark/40"> ({recurringCharges} charges)</span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input w-44"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="recurring">Recurring</option>
          </select>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 w-56"
            />
          </div>
          <button
            onClick={load}
            className="p-2.5 rounded-lg border-2 border-light bg-white hover:border-primary/40 hover:bg-primary/5 text-primary transition-colors"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={exportCSV} className="btn-primary text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {selectionCount > 0 && (
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap p-3 rounded-lg bg-primary/5 border-2 border-primary/20">
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              className="p-1.5 rounded hover:bg-primary/10 text-primary"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-dark">
              {selectionCount} selected
              {refundableSelectedCount > 0 && refundableSelectedCount < selectionCount && (
                <span className="text-dark/50 font-normal">
                  {" "}({refundableSelectedCount} refundable)
                </span>
              )}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={bulkMarkRefunded}
              disabled={isBulkWorking || refundableSelectedCount === 0}
              title={
                refundableSelectedCount === 0
                  ? "Only completed donations can be refunded"
                  : undefined
              }
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark refunded
              {refundableSelectedCount > 0 && (
                <span className="ml-1 text-gray-500">
                  ({refundableSelectedCount})
                </span>
              )}
            </button>
            <button
              onClick={bulkDelete}
              disabled={isBulkWorking}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete {selectionCount}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-dark/60">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <DollarSign className="w-12 h-12 text-dark/20 mx-auto mb-4" />
          <p className="text-dark/60">No donations found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="w-10 px-3 py-3">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 rounded hover:bg-primary/10 text-primary"
                    title={allVisibleSelected ? "Deselect all" : "Select all"}
                  >
                    {allVisibleSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : someVisibleSelected ? (
                      <div className="w-4 h-4 border-2 border-primary rounded-sm flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-primary" />
                      </div>
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Reference</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Donor</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Gateway</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Method</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Type</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Created</th>
                <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light">
              {filtered.map((d) => {
                const isRecurring = !!d.parent_reference;
                const isRecurringPledge =
                  d.frequency === "monthly" && !d.parent_reference;
                const isSelected = selectedIds.has(d.id);

                return (
                  <tr
                    key={d.id}
                    className={`hover:bg-light/50 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="w-10 px-3 py-4">
                      <button
                        onClick={() => toggleRow(d.id)}
                        className="p-1 rounded hover:bg-primary/10 text-primary"
                        aria-label={isSelected ? "Deselect" : "Select"}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-xs font-mono text-dark/70">
                      <div>{d.reference}</div>
                      {d.payment_reference && (
                        <div className="text-dark/40 mt-0.5">
                          {d.payment_reference.slice(0, 18)}…
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="text-dark font-medium">
                        {d.donor_name || "Anonymous"}
                      </div>
                      <div className="text-dark/50 text-xs">{d.donor_email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-primary">
                      <div>{formatCurrency(Number(d.amount), d.currency)}</div>
                      {d.settle_amount && d.settle_currency && (
                        <div className="text-xs text-dark/50 font-normal">
                          ≈ {d.settle_amount.toLocaleString()} {d.settle_currency}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-dark/80">
                      {gatewayLabel(d)}
                    </td>
                    <td className="px-4 py-4 text-sm text-dark/80">
                      {methodLabel(d)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {isRecurring ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          Recurring charge
                        </span>
                      ) : isRecurringPledge ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                          Recurring
                        </span>
                      ) : (
                        <span className="text-xs text-dark/50">One-time</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          statusColors[d.status] || ""
                        }`}
                      >
                        {d.status}
                      </span>
                      {d.gateway_status && d.gateway_status !== d.status && (
                        <div className="text-xs text-dark/40 mt-1">
                          {d.gateway_status}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-dark/60 whitespace-nowrap">
                      <div>{formatDateTime(d.created_at)}</div>
                      <div className="text-xs text-dark/40">
                        {timeAgo(d.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditing(d)}
                          className="p-2 rounded hover:bg-primary/10 text-primary"
                          title="Actions"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => remove(d.id)}
                          className="p-2 rounded hover:bg-red-50 text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Donation Actions</h2>
              <button
                onClick={() => setEditing(null)}
                className="p-2 hover:bg-light rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-dark/60 mb-1">
              Reference: <span className="font-mono">{editing.reference}</span>
            </p>
            {editing.parent_reference && (
              <p className="text-sm text-dark/60 mb-4">
                Parent:{" "}
                <span className="font-mono">{editing.parent_reference}</span>
              </p>
            )}

            <div className="mt-4 p-3 rounded-lg bg-light text-sm text-dark/70">
              <p className="font-semibold mb-2">Current status</p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    statusColors[editing.status] || ""
                  }`}
                >
                  {editing.status}
                </span>
                {editing.gateway_status && (
                  <span className="text-xs text-dark/50">
                    ({editing.gateway_status})
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-dark/50">
                Payment statuses come from the gateway. They cannot be edited
                manually.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {editing.status === "completed" ? (
                <button
                  disabled={isSaving}
                  onClick={() => updateStatus(editing.id, "refunded")}
                  className="w-full text-left px-4 py-3 rounded-lg border-2 border-light hover:border-primary/40 transition-colors disabled:opacity-50"
                >
                  <span className="font-medium">Mark as refunded</span>
                  <p className="text-xs text-dark/50 mt-0.5">
                    Use only after you've issued an actual refund via Nylon Pay
                  </p>
                </button>
              ) : editing.status === "refunded" ? (
                <div className="w-full text-left px-4 py-3 rounded-lg border-2 border-primary bg-primary/5 opacity-60">
                  <span className="font-medium">Already refunded</span>
                </div>
              ) : (
                <div className="w-full text-left px-4 py-3 rounded-lg border-2 border-light opacity-60">
                  <span className="font-medium text-dark/50">
                    No manual actions available
                  </span>
                  <p className="text-xs text-dark/40 mt-0.5">
                    Only completed donations can be refunded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}