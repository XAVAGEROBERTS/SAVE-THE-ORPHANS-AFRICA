"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Save, Quote } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { logClientActivity } from "@/lib/admin/client-activity";

interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_role: string;
  author_image_url: string | null;
  display_order: number;
  is_published: boolean;
}

const empty: Partial<Testimonial> = {
  quote: "",
  author_name: "",
  author_role: "",
  author_image_url: "",
  display_order: 0,
  is_published: true,
};

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setIsLoading(true);
    const res = await fetch("/api/admin/testimonials");
    const json = await res.json();
    setItems(json.data || []);
    setIsLoading(false);
  }

  async function save() {
    if (!editing) return;
    setIsSaving(true);
    setError(null);
    const isNew = !editing.id;
    const url = isNew
      ? "/api/admin/testimonials"
      : `/api/admin/testimonials/${editing.id}`;
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

    await logClientActivity({
      action: isNew ? "create" : "update",
      tableName: "testimonials",
      recordId: json.data?.id,
      recordSummary: `Testimonial by ${editing.author_name}`,
      changes: { author: editing.author_name },
    });

    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    const toDelete = items.find((i) => i.id === id);
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
      await logClientActivity({
        action: "delete",
        tableName: "testimonials",
        recordId: id,
        recordSummary: `Testimonial by ${toDelete?.author_name || id}`,
      });
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Testimonials</h1>
          <p className="text-dark/60 mt-1">{items.length} testimonials</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" /> New Testimonial
        </button>
      </div>

      {isLoading ? (
        <p className="text-dark/60">Loading...</p>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <Quote className="w-12 h-12 text-dark/20 mx-auto mb-4" />
          <p className="text-dark/60">No testimonials yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.id} className="card p-6 flex flex-col">
              <Quote className="w-6 h-6 text-gold mb-3" />
              <p className="text-dark/80 italic text-sm leading-relaxed flex-1 mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="pt-4 border-t border-light">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-dark text-sm">
                      {t.author_name}
                    </div>
                    {t.author_role && (
                      <div className="text-xs text-dark/60">
                        {t.author_role}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(t)}
                      className="p-2 rounded hover:bg-primary/10 text-primary"
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="p-2 rounded hover:bg-red-50 text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                      t.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {t.is_published ? "Published" : "Draft"}
                  </span>
                  <span className="text-[10px] text-dark/40">
                    Order: {t.display_order}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editing.id ? "Edit Testimonial" : "New Testimonial"}
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
              <div>
                <label className="form-label">Quote *</label>
                <textarea
                  className="form-input resize-none"
                  rows={4}
                  value={editing.quote || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, quote: e.target.value })
                  }
                  placeholder="What they said..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Author Name *</label>
                  <input
                    className="form-input"
                    value={editing.author_name || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, author_name: e.target.value })
                    }
                    placeholder="Grace Mwangi"
                  />
                </div>
                <div>
                  <label className="form-label">Author Role</label>
                  <input
                    className="form-input"
                    value={editing.author_role || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, author_role: e.target.value })
                    }
                    placeholder="Program Director"
                  />
                </div>
              </div>

              <ImageUpload
                value={editing.author_image_url || ""}
                onChange={(url) =>
                  setEditing({ ...editing, author_image_url: url })
                }
                folder="testimonials"
                label="Author Photo (optional)"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Display Order</label>
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
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.is_published ?? true}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          is_published: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Published</span>
                  </label>
                </div>
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