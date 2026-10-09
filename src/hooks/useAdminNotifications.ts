"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Counts {
  messages: number;
  volunteers: number;
  donations: number;
  testimonials: number;
}

type Section = keyof Counts;

const STORAGE_PREFIX = "admin_seen_";

function getLastSeen(section: Section): string {
  if (typeof window === "undefined") return "1970-01-01T00:00:00Z";
  try {
    const v = window.localStorage.getItem(STORAGE_PREFIX + section);
    return v || "1970-01-01T00:00:00Z";
  } catch {
    return "1970-01-01T00:00:00Z";
  }
}

function setLastSeen(section: Section, iso: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + section, iso);
  } catch {
    // localStorage disabled — ignore
  }
}

export function useAdminNotifications() {
  const [counts, setCounts] = useState<Counts>({
    messages: 0,
    volunteers: 0,
    donations: 0,
    testimonials: 0,
  });

  const load = useCallback(async () => {
    try {
      const supabase = createClient();

      const [
        { count: messagesCount },
        { count: volunteersCount },
        { count: donationsCount },
        { count: testimonialsCount },
      ] = await Promise.all([
        supabase
          .from("contact_messages")
          .select("id", { count: "exact", head: true })
          .gt("created_at", getLastSeen("messages")),

        supabase
          .from("volunteer_applications")
          .select("id", { count: "exact", head: true })
          .gt("created_at", getLastSeen("volunteers")),

        supabase
          .from("donations")
          .select("id", { count: "exact", head: true })
          .gt("created_at", getLastSeen("donations"))
          .eq("status", "pending"),

        supabase
          .from("testimonials")
          .select("id", { count: "exact", head: true })
          .gt("created_at", getLastSeen("testimonials"))
          .eq("is_published", false),
      ]);

      setCounts({
        messages: messagesCount || 0,
        volunteers: volunteersCount || 0,
        donations: donationsCount || 0,
        testimonials: testimonialsCount || 0,
      });
    } catch (err) {
      console.error("Failed to load notification counts:", err);
    }
  }, []);

  const markSeen = useCallback((section: Section) => {
    setLastSeen(section, new Date().toISOString());
    setCounts((prev) => ({ ...prev, [section]: 0 }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "volunteer_applications" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "testimonials" }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { counts, markSeen, load };
}
