"use client";

import { createClient } from "@/lib/supabase/client";

interface LogParams {
  action: "create" | "update" | "delete" | "login" | "logout";
  tableName: string;
  recordId?: string | null;
  recordSummary?: string | null;
  changes?: Record<string, any> | null;
}

export async function logClientActivity(params: LogParams) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Get admin info
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    const { error } = await supabase.from("admin_activity").insert({
      user_id: user.id,
      user_email: adminUser?.email || user.email || "unknown",
      user_name: adminUser?.full_name || null,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId || null,
      record_summary: params.recordSummary || null,
      changes: params.changes || null,
    });

    if (error) console.error("Activity log error:", error);
  } catch (err) {
    console.error("Activity log failed:", err);
  }
}