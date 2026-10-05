import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "Save the Orphans Africa <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html, text });
  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function notifyAdmin(
  type: "contact" | "volunteer" | "subscriber" | "donation",
  data: Record<string, any>
) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) return;
  const { adminNotificationEmail } = await import("./templates");
  const html = adminNotificationEmail({ type, data });
  const subjectMap: Record<string, string> = {
    contact: `[SOA] New Contact: ${data.subject || "No subject"}`,
    volunteer: `[SOA] New Volunteer: ${data.name || "Unknown"}`,
    subscriber: `[SOA] New Subscriber: ${data.email || "Unknown"}`,
    donation: `[SOA] New Donation: ${data.amount || "Unknown"}`,
  };
  return sendEmail({ to: adminEmail, subject: subjectMap[type], html });
}
