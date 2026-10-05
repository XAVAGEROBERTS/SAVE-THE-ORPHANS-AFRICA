"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, X, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { logClientActivity } from "@/lib/admin/client-activity";

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  category: string;
  display_order: number;
  is_published: boolean;
}

const empty: Partial<GalleryImage> = {
  image_url: "",
  alt_text: "",
  category: "Community",
  display_order: 0,
  is_published: true,
};

export default function GalleryAdminPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [editing, setEditing] = useState<Partial<GalleryImage> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setIsLoading(true);
    const res = await fetch("/api/admin/gallery");
    const json = await res.json();
    setImages(json.data || []);
    setIsLoading(false);
  }

  async function save() {
    if (!editing) return;
    setIsSaving(true);
    setError(null);
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/gallery" : `/api/admin/gallery/${editing.id}`;
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
      tableName: "gallery_images",
      recordId: json.data?.id,
      recordSummary: `Image: ${editing.alt_text}`,
      changes: { alt: editing.alt_text, category: editing.category },
    });

    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    const toDelete = images.find((i) => i.id === id);
    const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages(images.filter((i) => i.id !== id));
      await logClientActivity({
        action: "delete",
        tableName: "gallery_images",
        recordId: id,
        recordSummary: `Image: ${toDelete?.alt_text || id}`,
      });
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Gallery</h1>
          <p className="text-dark/60 mt-1">{images.length} images</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      {isLoading ? (
        <p className="text-dark/60">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="card overflow-hidden">
              <div className="relative aspect-[4/3] bg-light">
                {img.image_url && (
                  <Image
                    src={img.image_url}
                    alt={img.alt_text}
                    fill
                    className="object-cover"
                    sizes="25vw"
                    unoptimized
                  />
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-dark/60 truncate">{img.alt_text}</p>
                <p className="text-xs text-primary font-medium mt-1">
                  {img.category}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditing(img)}
                    className="p-1.5 rounded hover:bg-primary/10 text-primary"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => remove(img.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editing.id ? "Edit Image" : "Add Image"}
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
              <ImageUpload
                value={editing.image_url || ""}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="gallery"
                label="Gallery Image"
              />

              <div>
                <label className="form-label">Alt Text (description)</label>
                <input
                  className="form-input"
                  value={editing.alt_text || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, alt_text: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={editing.category || "Community"}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                  >
                    {[
                      "Children & Education",
                      "Community",
                      "Events",
                      "Volunteers",
                      "Facilities",
                      "Projects",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
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
                  id="gal_pub"
                  checked={editing.is_published ?? true}
                  onChange={(e) =>
                    setEditing({ ...editing, is_published: e.target.checked })
                  }
                />
                <label htmlFor="gal_pub" className="text-sm">
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