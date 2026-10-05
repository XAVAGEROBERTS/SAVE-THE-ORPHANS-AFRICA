"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Save, Users } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { logClientActivity } from "@/lib/admin/client-activity";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  email: string | null;
  linkedin_url: string | null;
  display_order: number;
  is_founder: boolean;
  is_published: boolean;
}

const empty: Partial<TeamMember> = {
  name: "",
  role: "",
  bio: "",
  image_url: "",
  email: "",
  linkedin_url: "",
  display_order: 0,
  is_founder: false,
  is_published: true,
};

export default function TeamAdminPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [editing, setEditing] = useState<Partial<TeamMember> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setIsLoading(true);
    const res = await fetch("/api/admin/team");
    const json = await res.json();
    setMembers(json.data || []);
    setIsLoading(false);
  }

  async function save() {
    if (!editing) return;
    setIsSaving(true);
    setError(null);
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/team" : `/api/admin/team/${editing.id}`;
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
      tableName: "team_members",
      recordId: json.data?.id,
      recordSummary: `Team: ${editing.name} (${editing.role})`,
    });

    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this team member?")) return;
    const toDelete = members.find((m) => m.id === id);
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMembers(members.filter((m) => m.id !== id));
      await logClientActivity({
        action: "delete",
        tableName: "team_members",
        recordId: id,
        recordSummary: `Deleted team member: ${toDelete?.name || id}`,
      });
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Team Members</h1>
          <p className="text-dark/60 mt-1">{members.length} people</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {isLoading ? (
        <p className="text-dark/60">Loading...</p>
      ) : members.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-dark/20 mx-auto mb-4" />
          <p className="text-dark/60">No team members yet.</p>
          <p className="text-dark/40 text-sm mt-2">
            Add founders and staff to build trust with donors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <div key={m.id} className="card p-6 flex flex-col">
              {m.image_url && (
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-light">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.image_url}
                    alt={m.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-dark">{m.name}</h3>
                  <p className="text-sm text-primary font-medium">{m.role}</p>
                </div>
                {m.is_founder && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gold text-dark px-2 py-0.5 rounded-full">
                    Founder
                  </span>
                )}
              </div>
              <p className="text-sm text-dark/70 line-clamp-3 flex-1 mb-4">
                {m.bio}
              </p>
              <div className="flex gap-2 justify-end pt-4 border-t border-light">
                <button
                  onClick={() => setEditing(m)}
                  className="p-2 rounded hover:bg-primary/10 text-primary"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(m.id)}
                  className="p-2 rounded hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="admin-no-scrollbar bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editing.id ? "Edit Team Member" : "Add Team Member"}
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
                  <label className="form-label">Name *</label>
                  <input
                    className="form-input"
                    value={editing.name || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    placeholder="Kenyi Robert"
                  />
                </div>
                <div>
                  <label className="form-label">Role / Title *</label>
                  <input
                    className="form-input"
                    value={editing.role || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, role: e.target.value })
                    }
                    placeholder="Co-Founder & Director"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Bio *</label>
                <textarea
                  className="form-input resize-none"
                  rows={4}
                  value={editing.bio || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, bio: e.target.value })
                  }
                  placeholder="Short description of this person's background and role..."
                />
              </div>

              <ImageUpload
                value={editing.image_url || ""}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                folder="team"
                label="Profile Photo"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Email (optional)</label>
                  <input
                    className="form-input"
                    type="email"
                    value={editing.email || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, email: e.target.value })
                    }
                    placeholder="kenyi@savetheorphansafrica.org"
                  />
                </div>
                <div>
                  <label className="form-label">LinkedIn URL (optional)</label>
                  <input
                    className="form-input"
                    value={editing.linkedin_url || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, linkedin_url: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

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
                <div className="space-y-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.is_founder ?? false}
                      onChange={(e) =>
                        setEditing({ ...editing, is_founder: e.target.checked })
                      }
                    />
                    <span className="text-sm font-medium">
                      Co-Founder / Founder
                    </span>
                  </label>
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
                    <span className="text-sm font-medium">
                      Show on website
                    </span>
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