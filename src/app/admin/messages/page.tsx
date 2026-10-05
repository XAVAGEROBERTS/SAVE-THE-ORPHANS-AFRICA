"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { formatDate } from "@/utils/format";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";

interface Message {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function MessagesPage() {
  const { data: messages, isLoading } = useRealtimeTable<Message>({
    table: "contact_messages",
    orderBy: { column: "created_at", ascending: false },
  });

  const [filtered, setFiltered] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!search) {
      setFiltered(messages);
    } else {
      const s = search.toLowerCase();
      setFiltered(
        messages.filter(
          (m) =>
            m.full_name?.toLowerCase().includes(s) ||
            m.email?.toLowerCase().includes(s) ||
            m.subject?.toLowerCase().includes(s) ||
            m.message?.toLowerCase().includes(s)
        )
      );
    }
  }, [search, messages]);

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((m) => m.id)));
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function handleDeleteSingle(id: string) {
    if (!confirm("Delete this message permanently?")) return;
    const supabase = createClient();
    await supabase.from("contact_messages").delete().eq("id", id);
    if (selectedMessage?.id === id) setSelectedMessage(null);
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;
    if (!confirm(`Delete ${count} message${count > 1 ? "s" : ""} permanently?`))
      return;

    const supabase = createClient();
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .in("id", Array.from(selectedIds));

    if (error) {
      alert("Failed to delete: " + error.message);
      return;
    }

    setSelectedIds(new Set());
    if (selectedMessage && selectedIds.has(selectedMessage.id)) {
      setSelectedMessage(null);
    }
  }

  function handleBulkExport() {
    const selected = messages.filter((m) => selectedIds.has(m.id));
    const headers = ["Name", "Email", "Phone", "Subject", "Message", "Status", "Date"];
    const rows = selected.map((m) => [
      m.full_name,
      m.email,
      m.phone || "",
      m.subject,
      m.message.replace(/"/g, '""'),
      m.status,
      new Date(m.created_at).toISOString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `messages-selected-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Contact Messages</h1>
          <p className="text-dark/60 mt-1 flex items-center gap-2">
            {messages.length} total
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
          <Mail className="w-12 h-12 text-dark/20 mx-auto mb-4" />
          <p className="text-dark/60">No messages yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 card divide-y divide-light overflow-hidden">
            {/* Select All header */}
            <div className="p-3 bg-light border-b border-light flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  filtered.length > 0 && selectedIds.size === filtered.length
                }
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-dark/60 font-medium">
                {selectedIds.size > 0
                  ? `${selectedIds.size} selected`
                  : "Select all"}
              </span>
            </div>

            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              {filtered.map((m) => {
                const isSelected = selectedIds.has(m.id);
                const isOpen = selectedMessage?.id === m.id;

                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2 p-3 hover:bg-light transition-colors ${
                      isOpen ? "bg-primary/5 border-l-4 border-primary" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(m.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={() => setSelectedMessage(m)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-dark text-sm truncate">
                          {m.full_name}
                        </span>
                        <span className="text-xs text-dark/40 shrink-0">
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-primary font-medium truncate mb-1">
                        {m.subject}
                      </div>
                      <div className="text-xs text-dark/60 line-clamp-2">
                        {m.message}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail */}
          <div className="lg:col-span-2 card p-6">
            {selectedMessage ? (
              <div>
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-light">
                  <div>
                    <h2 className="text-xl font-bold text-dark mb-1">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-dark/60">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedMessage.email}
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {selectedMessage.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(selectedMessage.created_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSingle(selectedMessage.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4 text-sm text-dark/60">
                  <strong className="text-dark">From:</strong>{" "}
                  {selectedMessage.full_name}
                </div>

                <div className="text-dark/80 leading-relaxed whitespace-pre-line">
                  {selectedMessage.message}
                </div>

                <div className="mt-8">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="btn-primary text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Reply by Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-dark/20 mx-auto mb-4" />
                <p className="text-dark/60">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}

      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClear={clearSelection}
        onExport={handleBulkExport}
        onDelete={handleBulkDelete}
      />
    </div>
  );
}