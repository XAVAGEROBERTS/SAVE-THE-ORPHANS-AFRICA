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
  X,
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

  // Close on outside click (desktop)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
      // Prevent body scroll on mobile while menu is open
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("mousedown", handleClick);
        document.removeEventListener("keydown", handleKey);
        document.body.style.overflow = "";
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
        setTimeout(() => setOpen(false), 800);
      } else {
        setOpen(false);
      }
    } catch {
      window.prompt("Copy this link:", resolveUrl());
    }
  }

  const ITEMS = [
    {
      key: "facebook",
      label: "Facebook",
      icon: <Facebook className="w-5 h-5 text-[#1877F2]" />,
      action: () => openShare("facebook"),
    },
    {
      key: "twitter",
      label: "Twitter / X",
      icon: <Twitter className="w-5 h-5 text-black" />,
      action: () => openShare("twitter"),
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5 text-[#25D366]" />,
      action: () => openShare("whatsapp"),
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: <Send className="w-5 h-5 text-[#229ED9]" />,
      action: () => openShare("telegram"),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: <Linkedin className="w-5 h-5 text-[#0A66C2]" />,
      action: () => openShare("linkedin"),
    },
    {
      key: "instagram",
      label: copied === "instagram" ? "Copied for Instagram ✓" : "Copy for Instagram",
      icon: <Instagram className="w-5 h-5 text-[#DD2A7B]" />,
      action: () => copyLink("instagram"),
    },
    {
      key: "copy",
      label: copied === "generic" ? "Copied!" : "Copy link",
      icon:
        copied === "generic" ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Link2 className="w-5 h-5 text-primary" />
        ),
      action: () => copyLink("generic"),
    },
  ];

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

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menu — bottom sheet on mobile, dropdown on desktop */}
      {open && (
        <div
          role="menu"
          className="
            fixed sm:absolute
            inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-auto sm:top-full sm:right-0 sm:mt-2
            z-50
            w-full sm:w-64
            max-w-full sm:max-w-[calc(100vw-2rem)]
            bg-white
            rounded-t-2xl sm:rounded-xl
            shadow-2xl border-t sm:border border-light
            overflow-hidden
            animate-in slide-in-from-top-2
            duration-200
          "
        >
          {/* Header (mobile sheet) */}
          <div className="sm:hidden flex items-center justify-between px-5 py-4 border-b border-light">
            <span className="font-semibold text-dark text-sm">Share this story</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close share menu"
              className="w-8 h-8 rounded-full flex items-center justify-center text-dark/60 hover:bg-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sheet handle (mobile only, small touch) */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-dark/15" />
          </div>

          <div className="py-2 sm:py-1">
            {ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={item.action}
                className="w-full flex items-center gap-4 px-5 sm:px-4 py-4 sm:py-3 text-base sm:text-sm text-dark hover:bg-light active:bg-light transition-colors"
              >
                {item.icon}
                <span className="font-medium sm:font-normal">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Safe area padding (mobile) */}
          <div className="sm:hidden h-4" />
        </div>
      )}
    </div>
  );
}
