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

// Donation receipts, refund notices
export const DONATIONS_FROM_EMAIL =
  process.env.RESEND_DONATIONS_FROM_EMAIL ||
  "Save the Orphans Africa <donations@savetheorphansafrica.org>";

// Newsletter blasts to subscribers
export const NEWSLETTER_FROM_EMAIL =
  process.env.RESEND_NEWSLETTER_FROM_EMAIL ||
  "Save The Orphans Africa <news@savetheorphansafrica.org>";

// Default — admin notifications, welcome emails, contact confirmations
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "Save the Orphans Africa <info@savetheorphansafrica.org>";

function clean(value: string | string[]): string | string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).replace(/[\r\n\t]/g, "").trim());
  }
  return String(value).replace(/[\r\n\t]/g, "").trim();
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}) {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from: from || FROM_EMAIL,
    to: clean(to),
    subject: clean(subject) as string,
    html,
    text,
  });

  if (error) {
    console.error("Resend error:", error);
    const safeMessage = String(error.message || "Resend failed")
      .replace(/[\r\n\t]/g, " ")
      .slice(0, 200);
    throw new Error(safeMessage);
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

  return sendEmail({
    to: adminEmail,
    subject: subjectMap[type],
    html,
  });
}
