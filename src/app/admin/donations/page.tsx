"use client";

import { useEffect, useState } from "react";
import { Search, Download, DollarSign, Trash2, Edit, X, Save } from "lucide-react";
import { formatDate, formatCurrency } from "@/utils/format";

interface Donation {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  frequency: string;
  program: string;
  donor_name: string | null;
  donor_email: string | null;
  donor_phone: string | null;
  status: string;
  payment_method: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filtered, setFiltered] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Donation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    let result = donations;
    if (statusFilter !== "all") result = result.filter((d) => d.status === statusFilter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((d) =>
        d.reference.toLowerCase().includes(s) ||
        (d.donor_name?.toLowerCase().includes(s) ?? false) ||
        (d.donor_email?.toLowerCase().includes(s) ?? false)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, donations]);

  async function load() {
    setIsLoading(true);
    const res = await fetch("/api/admin/donations");
    const json = await res.json();
    setDonations(json.data || []);
    setIsLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setIsSaving(true);
    await fetch(`/api/admin/donations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setIsSaving(false);
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this donation?")) return;
    await fetch(`/api/admin/donations/${id}`, { method: "DELETE" });
    setDonations(donations.filter((d) => d.id !== id));
  }

  const totalCompleted = donations
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  function exportCSV() {
    const headers = ["Reference", "Amount", "Currency", "Frequency", "Program", "Donor", "Email", "Status", "Date"];
    const rows = filtered.map((d) => [
      d.reference, d.amount.toString(), d.currency, d.frequency, d.program,
      d.donor_name || "", d.donor_email || "", d.status,
      new Date(d.created_at).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-input w-40">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input pl-9 w-56" />
          </div>
          <button onClick={exportCSV} className="btn-primary text-sm"><Download className="w-4 h-4" /> Export</button>
        </div>
      </div>

      {isLoading ? <p className="text-dark/60">Loading...</p> : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <DollarSign className="w-12 h-12 text-dark/20 mx-auto mb-4" />
          <p className="text-dark/60">No donations yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold">Reference</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Donor</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Amount</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Status</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Date</th>
                <th className="text-right px-6 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-light/50">
                  <td className="px-6 py-4 text-xs font-mono text-dark/70">{d.reference}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-dark font-medium">{d.donor_name || "Anonymous"}</div>
                    <div className="text-dark/50 text-xs">{d.donor_email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary">
                    {formatCurrency(Number(d.amount), d.currency)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[d.status] || ""}`}>{d.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/60">{formatDate(d.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(d)} className="p-2 rounded hover:bg-primary/10 text-primary"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => remove(d.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Update Donation Status</h2>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-light rounded"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-dark/60 mb-4">
              Reference: <span className="font-mono">{editing.reference}</span>
            </p>
            <div className="space-y-2">
              {["pending", "completed", "failed", "refunded"].map((s) => (
                <button
                  key={s}
                  disabled={isSaving}
                  onClick={() => updateStatus(editing.id, s)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                    editing.status === s ? "border-primary bg-primary/5" : "border-light hover:border-primary/40"
                  }`}
                >
                  <span className="font-medium capitalize">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}