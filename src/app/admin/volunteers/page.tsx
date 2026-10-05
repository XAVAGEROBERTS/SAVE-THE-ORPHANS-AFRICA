"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { formatDate } from "@/utils/format";

interface Volunteer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  area_of_interest: string;
  skills: string;
  availability: string;
  motivation: string;
  previous_experience: string | null;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  contacted: "bg-purple-100 text-purple-800",
};

export default function VolunteersPage() {
  const { data: volunteers, setData: setVolunteers, isLoading } = useRealtimeTable<Volunteer>({
    table: "volunteer_applications",
    orderBy: { column: "created_at", ascending: false },
  });

  const [filtered, setFiltered] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Volunteer | null>(null);

  useEffect(() => {
    if (!search) {
      setFiltered(volunteers);
    } else {
      const s = search.toLowerCase();
      setFiltered(
        volunteers.filter(
          (v) =>
            v.full_name?.toLowerCase().includes(s) ||
            v.email?.toLowerCase().includes(s) ||
            v.country?.toLowerCase().includes(s) ||
            v.area_of_interest?.toLowerCase().includes(s)
        )
      );
    }
  }, [search, volunteers]);

  // Keep selected in sync with realtime updates
  useEffect(() => {
    if (selected) {
      const updated = volunteers.find((v) => v.id === selected.id);
      if (updated) setSelected(updated);
      else setSelected(null);
    }
  }, [volunteers]);

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase
      .from("volunteer_applications")
      .update({ status })
      .eq("id", id);
    // Realtime updates the state automatically
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this application permanently?")) return;
    const supabase = createClient();
    await supabase.from("volunteer_applications").delete().eq("id", id);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Volunteer Applications</h1>
          <p className="text-dark/60 mt-1 flex items-center gap-2">
            {volunteers.length} total
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </p>
        </div>
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
      </div>

      {isLoading ? (
        <p className="text-dark/60">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-dark/60">No applications yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 card divide-y divide-light overflow-hidden">
            <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
              {filtered.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`w-full text-left p-4 hover:bg-light transition-colors ${
                    selected?.id === v.id
                      ? "bg-primary/5 border-l-4 border-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-dark text-sm truncate">
                      {v.full_name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        statusColors[v.status] || statusColors.pending
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <div className="text-xs text-primary font-medium truncate mb-1">
                    {v.area_of_interest}
                  </div>
                  <div className="text-xs text-dark/60 truncate">
                    {v.country} · {v.availability}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 card p-6">
            {selected ? (
              <div>
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-light">
                  <div>
                    <h2 className="text-xl font-bold text-dark mb-1">
                      {selected.full_name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-dark/60">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selected.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selected.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selected.country}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selected.created_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <strong className="text-dark block mb-1">Area of Interest</strong>
                    <p className="text-dark/70">{selected.area_of_interest}</p>
                  </div>
                  <div>
                    <strong className="text-dark block mb-1">Availability</strong>
                    <p className="text-dark/70">{selected.availability}</p>
                  </div>
                  <div>
                    <strong className="text-dark block mb-1">Skills & Qualifications</strong>
                    <p className="text-dark/70 whitespace-pre-line">{selected.skills}</p>
                  </div>
                  <div>
                    <strong className="text-dark block mb-1">Why They Want to Volunteer</strong>
                    <p className="text-dark/70 whitespace-pre-line">{selected.motivation}</p>
                  </div>
                  {selected.previous_experience && (
                    <div>
                      <strong className="text-dark block mb-1">Previous Experience</strong>
                      <p className="text-dark/70 whitespace-pre-line">
                        {selected.previous_experience}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-light">
                  <p className="text-sm font-semibold text-dark mb-3">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {["pending", "reviewed", "approved", "rejected", "contacted"].map(
                      (s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selected.id, s)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selected.status === s
                              ? "bg-primary text-white"
                              : "bg-light text-dark/70 hover:bg-primary/10"
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href={`mailto:${selected.email}?subject=Volunteer Application`}
                    className="btn-primary text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Reply by Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-dark/60">Select an application to view</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}