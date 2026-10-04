"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Save } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const empty: Partial<AdminUser & { password?: string }> = {
  email: "", full_name: "", role: "content_manager",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editing, setEditing] = useState<Partial<AdminUser & { password?: string }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setIsLoading(true);
    const res = await fetch("/api/admin/users");
    const json = await res.json();
    setUsers(json.data || []);
    setIsLoading(false);
  }

  async function save() {
    if (!editing) return;
    setIsSaving(true); setError(null);
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/users" : `/api/admin/users/${editing.id}`;
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
    if (!confirm("Delete this admin user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (res.ok) setUsers(users.filter((u) => u.id !== id));
    else alert(json.error || "Delete failed");
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Admin Users</h1>
          <p className="text-dark/60 mt-1">{users.length} users</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {isLoading ? <p className="text-dark/60">Loading...</p> : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Email</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Role</th>
                <th className="text-right px-6 py-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-light/50">
                  <td className="px-6 py-4 text-sm font-medium">{u.full_name || "—"}</td>
                  <td className="px-6 py-4 text-sm text-dark/70">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(u)} className="p-2 rounded hover:bg-primary/10 text-primary"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => remove(u.id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="text-xl font-bold">{editing.id ? "Edit User" : "New Admin User"}</h2>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-light rounded"><X className="w-5 h-5" /></button>
            </div>
            {error && <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editing.full_name || ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" disabled={!!editing.id} value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              {!editing.id && (
                <div>
                  <label className="form-label">Password (min 6 chars)</label>
                  <input className="form-input" type="password" value={(editing as any).password || ""} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
                </div>
              )}
              <div>
                <label className="form-label">Role</label>
                <select className="form-input" value={editing.role || "content_manager"} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                  <option value="content_manager">Content Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
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