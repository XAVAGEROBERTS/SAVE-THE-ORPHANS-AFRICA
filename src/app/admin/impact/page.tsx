"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Save } from "lucide-react";

interface ImpactStat {
  id: string;
  stat_key: string;
  label: string;
  value: number;
  suffix: string;
  description: string;
  icon: string;
  display_order: number;
}

const empty: Partial<ImpactStat> = {
  stat_key: "", label: "", value: 0, suffix: "+",
  description: "", icon: "Star", display_order: 0,
};

export default function ImpactAdminPage() {
  const [stats, setStats] = useState<ImpactStat[]>([]);
  const [editing, setEditing] = useState<Partial<ImpactStat> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    const res = await fetch("/api/admin/impact");
    const json = await res.json();
    setStats(json.data || []);
    setIsLoading(false);
  }

  async function save() {
    if (!editing) return;
    setIsSaving(true); setError(null);
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/impact" : `/api/admin/impact/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const json = await res.json();
    setIsSaving(false);
    if (!res.ok) { setError(json.error || "Save failed"); return; }
    setEditing(null); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this stat?")) return;
    const res = await fetch(`/api/admin/impact/${id}`, { method: "DELETE" });
    if (res.ok) setStats(stats.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Impact Statistics</h1>
          <p className="text-dark/60 mt-1">{stats.length} stats</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Stat
        </button>
      </div>

      {isLoading ? <p className="text-dark/60">Loading...</p> : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold">Order</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Value</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Label</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Icon</th>
                <th className="text-right px-6 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light">
              {stats.map((s) => (
                <tr key={s.id} className="hover:bg-light/50">
                  <td className="px-6 py-4 text-sm text-dark/60">{s.display_order}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">{s.value}{s.suffix}</td>
                  <td className="px-6 py-4 text-sm text-dark">{s.label}</td>
                  <td className="px-6 py-4 text-sm text-dark/60">{s.icon}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(s)} className="p-2 rounded hover:bg-primary/10 text-primary"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => remove(s.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editing.id ? "Edit Stat" : "New Stat"}</h2>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-light rounded"><X className="w-5 h-5" /></button>
            </div>
            {error && <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded">{error}</p>}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Key (unique)</label>
                  <input className="form-input" value={editing.stat_key || ""} onChange={(e) => setEditing({ ...editing, stat_key: e.target.value })} placeholder="children" />
                </div>
                <div>
                  <label className="form-label">Icon</label>
                  <input className="form-input" value={editing.icon || ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="Users" />
                </div>
              </div>
              <div>
                <label className="form-label">Label</label>
                <input className="form-input" value={editing.label || ""} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Value</label>
                  <input className="form-input" type="number" value={editing.value || 0} onChange={(e) => setEditing({ ...editing, value: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="form-label">Suffix</label>
                  <input className="form-input" value={editing.suffix || ""} onChange={(e) => setEditing({ ...editing, suffix: e.target.value })} placeholder="+" />
                </div>
                <div>
                  <label className="form-label">Order</label>
                  <input className="form-input" type="number" value={editing.display_order || 0} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <input className="form-input" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-6 border-t border-light">
              <button onClick={save} disabled={isSaving} className="btn-primary flex-1">
                {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
              </button>
              <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}