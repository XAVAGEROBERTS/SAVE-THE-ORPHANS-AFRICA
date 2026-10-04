"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, X, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  author: string;
  published_at: string;
  is_published: boolean;
}

const empty: Partial<Story> = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  image_url: "",
  category: "News",
  author: "",
  is_published: true,
};

export default function StoriesAdminPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [filtered, setFiltered] = useState<Story[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Story> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!search) return setFiltered(stories);
    const s = search.toLowerCase();
    setFiltered(
      stories.filter(
        (x) => x.title.toLowerCase().includes(s) || x.slug.includes(s)
      )
    );
  }, [search, stories]);

  async function load() {
    setIsLoading(true);
    const res = await fetch("/api/admin/stories");
    const json = await res.json();
    setStories(json.data || []);
    setIsLoading(false);
  }

  async function save() {
    if (!editing) return;
    setIsSaving(true);
    setError(null);
    const isNew = !editing.id;
    const url = isNew
      ? "/api/admin/stories"
      : `/api/admin/stories/${editing.id}`;
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
    if (!confirm("Delete this story?")) return;
    const res = await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
    if (res.ok) setStories(stories.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Stories</h1>
          <p className="text-dark/60 mt-1">{stories.length} stories</p>
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
            onClick={() => setEditing({ ...empty })}
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
                <th className="text-left px-6 py-3 text-sm font-semibold">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold">
                  Category
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold">
                  Author
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
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-light/50">
                  <td className="px-6 py-4 text-sm font-medium text-dark">
                    {s.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/60">
                    {s.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark/60">{s.author}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        s.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {s.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditing(s)}
                        className="p-2 rounded hover:bg-primary/10 text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(s.id)}
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
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editing.id ? "Edit Story" : "New Story"}
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
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={editing.category || "News"}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                  >
                    {[
                      "Success Stories",
                      "Education",
                      "Community",
                      "Events",
                      "News",
                      "Volunteer Stories",
                      "Fundraising",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Author</label>
                  <input
                    className="form-input"
                    value={editing.author || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, author: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Excerpt</label>
                <textarea
                  className="form-input resize-none"
                  rows={2}
                  value={editing.excerpt || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, excerpt: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="form-label">Content</label>
                <textarea
                  className="form-input resize-none"
                  rows={10}
                  value={editing.content || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, content: e.target.value })
                  }
                />
              </div>

              <ImageUpload
                value={editing.image_url || ""}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="stories"
                label="Story Image"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_pub_story"
                  checked={editing.is_published ?? true}
                  onChange={(e) =>
                    setEditing({ ...editing, is_published: e.target.checked })
                  }
                />
                <label htmlFor="is_pub_story" className="text-sm">
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