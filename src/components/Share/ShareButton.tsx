"use client";

import { useEffect, useRef, useState } from "react";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Link2,
  Check,
  MessageCircle,
  Send,
} from "lucide-react";

interface ShareButtonProps {
  title: string;
  url?: string;
  description?: string;
}

export function ShareButton({ title, url, description }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    // Close on Escape
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
      return () => {
        document.removeEventListener("mousedown", handleClick);
        document.removeEventListener("keydown", handleKey);
      };
    }
  }, [open]);

  function resolveUrl() {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }

  function openShare(platform: string) {
    const shareUrl = resolveUrl();
    const text = description ? `${title} — ${description}` : title;

    const links: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
    };

    const href = links[platform];
    if (!href) return;

    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
    setOpen(false);
  }

  async function copyLink(kind: "instagram" | "generic") {
    try {
      await navigator.clipboard.writeText(resolveUrl());
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
      if (kind === "instagram") {
        // Keep the menu open a moment so the user sees the confirmation
        setTimeout(() => setOpen(false), 800);
      } else {
        setOpen(false);
      }
    } catch {
      window.prompt("Copy this link:", resolveUrl());
    }
  }

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Share this story"
        aria-expanded={open}
        aria-haspopup="menu"
        className="w-10 h-10 rounded-full bg-light flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-full mb-2 z-50 w-56 bg-white rounded-xl shadow-2xl border border-light overflow-hidden"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => openShare("facebook")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark hover:bg-light transition-colors"
          >
            <Facebook className="w-4 h-4 text-[#1877F2]" />
            Facebook
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => openShare("twitter")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark hover:bg-light transition-colors"
          >
            <Twitter className="w-4 h-4 text-black" />
            Twitter / X
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => openShare("whatsapp")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark hover:bg-light transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            WhatsApp
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => openShare("telegram")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark hover:bg-light transition-colors"
          >
            <Send className="w-4 h-4 text-[#229ED9]" />
            Telegram
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => openShare("linkedin")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark hover:bg-light transition-colors"
          >
            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
            LinkedIn
          </button>

          <div className="h-px bg-light" />

          <button
            type="button"
            role="menuitem"
            onClick={() => copyLink("instagram")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark hover:bg-light transition-colors"
          >
            <Instagram className="w-4 h-4 text-[#DD2A7B]" />
            {copied === "instagram" ? "Copied for Instagram ✓" : "Copy for Instagram"}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => copyLink("generic")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark hover:bg-light transition-colors"
          >
            {copied === "generic" ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 text-primary" />
                Copy link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
