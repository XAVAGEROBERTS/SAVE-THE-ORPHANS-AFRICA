"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/utils/format";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [filtered, setFiltered] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(messages);
    } else {
      const s = search.toLowerCase();
      setFiltered(
        messages.filter(
          (m) =>
            m.full_name.toLowerCase().includes(s) ||
            m.email.toLowerCase().includes(s) ||
            m.subject.toLowerCase().includes(s) ||
            m.message.toLowerCase().includes(s)
        )
      );
    }
  }, [search, messages]);

  async function loadMessages() {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages((data as Message[]) || []);
    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message permanently?")) return;
    const supabase = createClient();
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages(messages.filter((m) => m.id !== id));
    if (selectedMessage?.id === id) setSelectedMessage(null);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Contact Messages</h1>
          <p className="text-dark/60 mt-1">
            {messages.length} total message{messages.length !== 1 ? "s" : ""}
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
            <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMessage(m)}
                  className={`w-full text-left p-4 hover:bg-light transition-colors ${
                    selectedMessage?.id === m.id ? "bg-primary/5 border-l-4 border-primary" : ""
                  }`}
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
              ))}
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
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4 text-sm text-dark/60">
                  <strong className="text-dark">From:</strong> {selectedMessage.full_name}
                </div>

                <div className="text-dark/80 leading-relaxed whitespace-pre-line">
                  {selectedMessage.message}
                </div>

                <div className="mt-8 flex gap-3">
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
    </div>
  );
}