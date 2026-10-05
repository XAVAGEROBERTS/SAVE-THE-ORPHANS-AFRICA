"use client";

import { useState } from "react";
import { Send, Check, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function sanitize(input: string): string {
  return input.replace(/[\r\n\t]/g, "").trim().slice(0, 100);
}

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const cleanEmail = sanitize(email).toLowerCase();
    const cleanName = sanitize(name);

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const supabase = createClient();

      // Try to insert. If email already exists, unique constraint throws error.
      const { error } = await supabase.from("subscribers").insert({
        email: cleanEmail,
        name: cleanName || null,
      });

      if (error) {
        console.error("Subscribe error:", error);

        // Duplicate email
        if (error.code === "23505" || error.message.toLowerCase().includes("duplicate")) {
          setStatus("error");
          setMessage("This email is already subscribed.");
          return;
        }

        setStatus("error");
        setMessage("Failed to subscribe. Please try again.");
        return;
      }

      // Analytics
      if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible("Newsletter Subscribed");
      }

      // Fire-and-forget welcome email
      fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, name: cleanName || null }),
      }).catch(() => {});

      // Fire-and-forget admin notification
      fetch("/api/email/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subscriber",
          data: { email: cleanEmail, name: cleanName || "—" },
        }),
      }).catch(() => {});

      setStatus("success");
      setMessage("Thank you for subscribing!");
      setEmail("");
      setName("");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 4000);
    } catch (err: any) {
      console.error("Newsletter error:", err);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-gold focus:outline-none transition-colors text-sm"
          disabled={status === "loading"}
          maxLength={100}
        />
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-gold focus:outline-none transition-colors text-sm"
          disabled={status === "loading"}
          maxLength={100}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2.5 rounded-lg bg-gold text-[#0B3D2E] font-semibold hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          aria-label="Subscribe to newsletter"
        >
          {status === "loading" ? (
            <div className="w-4 h-4 border-2 border-[#0B3D2E]/30 border-t-[#0B3D2E] rounded-full animate-spin" />
          ) : status === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-start gap-2 text-xs ${
            status === "success" ? "text-gold" : "text-red-300"
          }`}
        >
          {status === "success" ? (
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          )}
          <span>{message}</span>
        </div>
      )}
    </form>
  );
}