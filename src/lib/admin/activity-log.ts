import { createAdminClient } from "@/lib/supabase/admin";

interface LogParams {
  userId: string;
  userEmail: string;
  userName?: string | null;
  action: "create" | "update" | "delete" | "login" | "logout";
  tableName: string;
  recordId?: string | null;
  recordSummary?: string | null;
  changes?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logActivity(params: LogParams) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("admin_activity").insert({
      user_id: params.userId,
      user_email: params.userEmail,
      user_name: params.userName || null,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId || null,
      record_summary: params.recordSummary || null,
      changes: params.changes || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    });

    if (error) {
      console.error("Failed to log activity:", error);
    }
  } catch (err) {
    // Silent — never crash the main action because logging failed
    console.error("Activity log error:", err);
  }
}

/**
 * Extract summary info from a record for the log.
 */
export function summarizeRecord(table: string, record: any): string {
  if (!record) return "";

  switch (table) {
    case "contact_messages":
      return `Message from ${record.full_name}: ${record.subject}`;
    case "volunteer_applications":
      return `Application from ${record.full_name} (${record.area_of_interest})`;
    case "subscribers":
      return `Subscriber: ${record.email}`;
    case "donations":
      return `Donation ${record.reference}: ${record.currency} ${record.amount}`;
    case "programs":
      return `Program: ${record.title}`;
    case "stories":
      return `Story: ${record.title}`;
    case "testimonials":
      return `Testimonial by ${record.author_name}`;
    case "gallery_images":
      return `Image: ${record.alt_text}`;
    case "impact_stats":
      return `Stat: ${record.label}`;
    case "admin_users":
      return `Admin: ${record.email}`;
    case "newsletters":
      return `Newsletter: ${record.subject}`;
    default:
      return `${table}: ${record.id}`;
  }
}

/**
 * Get client info from a Next.js request (optional).
 */
export function getRequestInfo(req?: Request): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  if (!req) return { ipAddress: null, userAgent: null };
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : null;
  const ua = headers.get("user-agent");
  return { ipAddress: ip, userAgent: ua };
}