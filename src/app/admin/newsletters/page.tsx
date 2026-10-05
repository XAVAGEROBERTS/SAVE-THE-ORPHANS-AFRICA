"use client";

import { useEffect, useState } from "react";
import { Mail, Send, Loader2, CheckCircle, XCircle } from "lucide-react";
import { logClientActivity } from "@/lib/admin/client-activity";

interface Newsletter {
  id: string;
  subject: string;
  body: string;
  status: string;
  recipient_count: number;
  sent_at: string | null;
  created_at: string;
}

export default function NewslettersAdminPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setIsLoading(true);
    const res = await fetch("/api/admin/newsletters");
    const json = await res.json();
    setNewsletters(json.data || []);
    setIsLoading(false);
  }

  async function handleSend(sendNow: boolean) {
    if (!subject.trim() || !content.trim()) {
      setMessage({
        type: "error",
        text: "Please fill in subject and content.",
      });
      return;
    }

    setIsSending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, sendNow }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed");

      await logClientActivity({
        action: "create",
        tableName: "newsletters",
        recordId: json.data?.id,
        recordSummary: sendNow
          ? `Sent newsletter: ${subject} (${json.data?.sent || 0} recipients)`
          : `Draft saved: ${subject}`,
      });

      if (sendNow) {
        setMessage({
          type: "success",
          text: `Sent to ${json.data.sent} subscribers (${json.data.failed} failed)`,
        });
        setSubject("");
        setContent("");
      } else {
        setMessage({ type: "success", text: "Draft saved." });
      }

      load();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">Newsletters</h1>
        <p className="text-dark/60 mt-1">
          Compose and send emails to all subscribers.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="card p-6 mb-8">
        <h2 className="font-bold text-lg mb-4">New Newsletter</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="form-label">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="form-input"
              placeholder="A new update from Save the Orphans Africa"
            />
          </div>
          <div>
            <label className="form-label">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="form-input resize-none"
              placeholder="Write your newsletter here..."
            />
            <p className="text-xs text-dark/50 mt-2">
              Tip: Basic HTML tags like &lt;strong&gt; &lt;em&gt; &lt;a&gt; work
              too.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleSend(true)}
            disabled={isSending}
            className="btn-primary"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send to All Subscribers
              </>
            )}
          </button>
          <button
            onClick={() => handleSend(false)}
            disabled={isSending}
            className="btn-ghost"
          >
            Save as Draft
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-bold text-lg mb-4">Sent Newsletters</h2>
        {isLoading ? (
          <p className="text-dark/60">Loading...</p>
        ) : newsletters.length === 0 ? (
          <div className="card p-8 text-center text-dark/60">
            <Mail className="w-8 h-8 mx-auto mb-3 text-dark/30" />
            No newsletters yet.
          </div>
        ) : (
          <div className="space-y-3">
            {newsletters.map((n) => (
              <div
                key={n.id}
                className="card p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark truncate">
                    {n.subject}
                  </p>
                  <p className="text-xs text-dark/60 mt-1">
                    {n.sent_at
                      ? `Sent ${new Date(n.sent_at).toLocaleDateString()} to ${n.recipient_count} subscribers`
                      : `Created ${new Date(n.created_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div>
                  {n.status === "sent" && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {n.status === "failed" && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  {n.status === "draft" && (
                    <span className="text-xs text-dark/50">Draft</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}