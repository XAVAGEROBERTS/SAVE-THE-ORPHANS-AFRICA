"use client";

import { useState } from "react";
import { Send, Check, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    // Basic validation
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const supabase = createClient();

      // Check if already subscribed
      const { data: existing, error: lookupError } = await supabase
        .from("subscribers")
        .select("id, is_active, unsubscribe_token")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (lookupError) {
        console.error("Lookup error:", lookupError);
      }

      if (existing) {
        if (existing.is_active) {
          setStatus("error");
          setMessage("This email is already subscribed.");
          return;
        }

        // Re-activate
        const { error: updateError } = await supabase
          .from("subscribers")
          .update({
            is_active: true,
            unsubscribed_at: null,
            subscribed_at: new Date().toISOString(),
            name: cleanName || null,
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Update error:", updateError);
          setStatus("error");
          setMessage(updateError.message || "Failed to re-subscribe.");
          return;
        }

        // Send welcome email — fire and forget, non-blocking
        try {
          fetch("/api/email/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: cleanEmail,
              name: cleanName || null,
            }),
          }).catch(() => {
            /* ignore */
          });
        } catch {
          /* ignore */
        }

        setStatus("success");
        setMessage("Welcome back! You've been re-subscribed.");
        setEmail("");
        setName("");
        return;
      }

      // New subscription
      const { error: insertError } = await supabase.from("subscribers").insert({
        email: cleanEmail,
        name: cleanName || null,
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        setStatus("error");
        setMessage(insertError.message || "Failed to subscribe.");
        return;
      }

      // Track analytics event
      if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible("Newsletter Subscribed");
      }

      // Send welcome email — fire and forget
      try {
        fetch("/api/email/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            name: cleanName || null,
          }),
        }).catch(() => {
          /* ignore */
        });
      } catch {
        /* ignore */
      }

      // Notify admin — fire and forget
      try {
        fetch("/api/email/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "subscriber",
            data: { email: cleanEmail, name: cleanName || "—" },
          }),
        }).catch(() => {
          /* ignore */
        });
      } catch {
        /* ignore */
      }

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
      setMessage(err?.message || "Something went wrong. Please try again.");
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