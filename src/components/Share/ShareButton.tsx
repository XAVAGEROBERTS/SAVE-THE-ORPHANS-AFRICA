"use client";

import { useState } from "react";
import {
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
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string>("");

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
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolveUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", resolveUrl());
    }
  }

  async function copyForInstagram() {
    try {
      await navigator.clipboard.writeText(resolveUrl());
      setHint("Link copied — paste it into your Instagram story or bio");
      setTimeout(() => setHint(""), 3500);
    } catch {
      window.prompt("Copy this link for Instagram:", resolveUrl());
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => openShare("facebook")}
          aria-label="Share on Facebook"
          className="w-10 h-10 rounded-full bg-light flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors"
        >
          <Facebook className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => openShare("twitter")}
          aria-label="Share on Twitter"
          className="w-10 h-10 rounded-full bg-light flex items-center justify-center hover:bg-black hover:text-white transition-colors"
        >
          <Twitter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => openShare("whatsapp")}
          aria-label="Share on WhatsApp"
          className="w-10 h-10 rounded-full bg-light flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => openShare("telegram")}
          aria-label="Share on Telegram"
          className="w-10 h-10 rounded-full bg-light flex items-center justify-center hover:bg-[#229ED9] hover:text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => openShare("linkedin")}
          aria-label="Share on LinkedIn"
          className="w-10 h-10 rounded-full bg-light flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors"
        >
          <Linkedin className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={copyForInstagram}
          aria-label="Copy link for Instagram"
          className="w-10 h-10 rounded-full bg-light flex items-center justify-center hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white transition-colors"
        >
          <Instagram className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy link"
          className="w-10 h-10 rounded-full bg-light flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          title={copied ? "Copied!" : "Copy link"}
        >
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        </button>
      </div>

      {hint && <p className="text-xs text-dark/60 mt-2">{hint}</p>}
    </div>
  );
}
