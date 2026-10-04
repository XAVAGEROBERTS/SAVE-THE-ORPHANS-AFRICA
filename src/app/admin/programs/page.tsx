"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Eye, EyeOff } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Program {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description: string;
  image_url: string;
  icon: string;
  color: string;
  objectives: string[];
  impact_stats: { label: string; value: string }[];
  display_order: number;
  is_published: boolean;
}

const emptyProgram: Partial<Program> = {
  slug: "",
  title: "",
  description: "",
  long_description: "",
  image_url: "",
  icon: "Star",
  color: "#176B45",
  objectives: [],
  impact_stats: [],
  display_order: 0,
  is_published: true,
};

export default function ProgramsAdminPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filtered, setFiltered] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Program> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!search) return setFiltered(programs);
    const s = search.toLowerCase();
    setFiltered(
      programs.filter(
        (p) => p.title.toLowerCase().includes(s) || p.slug.includes(s)
      )
    );
  }, [search, programs]);

  async function load() {
    setIsLoading(true);
    const res = await fetch("/api/admin/programs");
    const json = await res.json();
    setPrograms(json.data || []);
    setIsLoading(false);
  }

  async function save() {
    if (!editing) return;
    setIsSaving(true);
    setError(null);
    const isNew = !editing.id;
    const url = isNew
      ? "/api/admin/programs"
      : `/api/admin/programs/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const json = await res.json();
    setIsSaving(false);
    if (!res.ok) {
      setError(json.error || "Save failed");
      return;
    }
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this program?")) return;
    const res = await fetch(`/api/admin/programs/${id}`, { method: "DELETE" });
    if (res.ok) setPrograms(programs.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Programs</h1>
          <p className="text-dark/60 mt-1">{programs.length} programs</p>
        </div>
        <div className="flex gap-3">
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
            onClick={() => setEditing({ ...emptyProgram })}
            className="btn-primary text-sm"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-dark/60">Loading...</p>
      ) : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold">#</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold">
                  Slug
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-light/50">
                  <td className="px-6 py-4 text-sm text-dark/60">
                    {p.display_order}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-dark">
                    {p.title}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-dark/60">
                    {p.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                        p.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.is_published ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {p.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditing(p)}
                        className="p-2 rounded hover:bg-primary/10 text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="p-2 rounded hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editing.id ? "Edit Program" : "New Program"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="p-2 hover:bg-light rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Title</label>
                  <input
                    className="form-input"
                    value={editing.title || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Slug</label>
                  <input
                    className="form-input"
                    value={editing.slug || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Short Description</label>
                <textarea
                  className="form-input resize-none"
                  rows={2}
                  value={editing.description || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="form-label">Long Description</label>
                <textarea
                  className="form-input resize-none"
                  rows={4}
                  value={editing.long_description || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      long_description: e.target.value,
                    })
                  }
                />
              </div>

              <ImageUpload
                value={editing.image_url || ""}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="programs"
                label="Program Image"
              />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Icon</label>
                  <input
                    className="form-input"
                    value={editing.icon || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, icon: e.target.value })
                    }
                    placeholder="GraduationCap"
                  />
                </div>
                <div>
                  <label className="form-label">Color</label>
                  <input
                    className="form-input h-12"
                    type="color"
                    value={editing.color || "#176B45"}
                    onChange={(e) =>
                      setEditing({ ...editing, color: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Order</label>
                  <input
                    className="form-input"
                    type="number"
                    value={editing.display_order || 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_pub"
                  checked={editing.is_published ?? true}
                  onChange={(e) =>
                    setEditing({ ...editing, is_published: e.target.checked })
                  }
                />
                <label htmlFor="is_pub" className="text-sm">
                  Published
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-light">
              <button
                onClick={save}
                disabled={isSaving}
                className="btn-primary flex-1"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save
                  </>
                )}
              </button>
              <button onClick={() => setEditing(null)} className="btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}