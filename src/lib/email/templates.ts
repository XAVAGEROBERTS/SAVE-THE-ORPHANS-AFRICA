const LOGO_URL =
  process.env.NEXT_PUBLIC_SITE_LOGO_URL ||
  "https://mkzqskurodstcmzlevte.supabase.co/storage/v1/object/public/site-images/logo.png";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://save-the-orphans-africa.vercel.app";

// =====================================================================
// BASE WRAPPER
// =====================================================================
export function wrapEmail({
  title,
  body,
  ctaText,
  ctaUrl,
  footerNote,
  unsubscribeUrl,
}: {
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
  unsubscribeUrl?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F5F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7F4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

          <tr>
            <td style="background:#0B3D2E;padding:36px 32px;text-align:center;">
              <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
                <img
                  src="${LOGO_URL}"
                  alt="Save the Orphans Africa"
                  width="80"
                  height="80"
                  style="display:block;margin:0 auto 16px;border-radius:50%;"
                />
              </a>
              <h1 style="color:#FFFFFF;margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">
                Save the Orphans Africa
              </h1>
              <p style="color:#F4B942;margin:6px 0 0;font-size:11px;font-weight:600;letter-spacing:2.5px;">
                EVERY CHILD DESERVES A HOME
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 32px;">
              <h2 style="color:#1F2933;margin:0 0 16px;font-size:22px;font-weight:700;">
                ${title}
              </h2>
              <div style="color:#4B5563;font-size:16px;line-height:1.6;">
                ${body}
              </div>

              ${
                ctaText && ctaUrl
                  ? `
              <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td style="background:#176B45;border-radius:8px;">
                    <a href="${ctaUrl}" style="display:inline-block;color:#FFFFFF;text-decoration:none;padding:14px 28px;font-weight:600;font-size:15px;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
            </td>
          </tr>

          <tr>
            <td style="background:#FFF9EF;padding:24px 32px;text-align:center;border-top:1px solid #F5F7F4;">
              <p style="color:#6B7280;font-size:13px;margin:0 0 8px;">
                ${footerNote || "Thank you for supporting vulnerable children."}
              </p>
              <p style="color:#9CA3AF;font-size:12px;margin:0 0 8px;">
                Save the Orphans Africa · 123 Hope Street, Kampala, Uganda
              </p>
              <p style="color:#9CA3AF;font-size:12px;margin:0;">
                <a href="${SITE_URL}" style="color:#176B45;text-decoration:underline;">Visit our website</a>
                · <a href="${SITE_URL}/donate" style="color:#176B45;text-decoration:underline;">Donate</a>
                · <a href="${SITE_URL}/contact" style="color:#176B45;text-decoration:underline;">Contact</a>
              </p>
              ${
                unsubscribeUrl
                  ? `<p style="color:#9CA3AF;font-size:11px;margin:10px 0 0;">
                      <a href="${unsubscribeUrl}" style="color:#9CA3AF;text-decoration:underline;">
                        Unsubscribe from this list
                      </a>
                    </p>`
                  : ""
              }
            </td>
          </tr>

        </table>

        <p style="color:#9CA3AF;font-size:11px;text-align:center;margin:16px 0 0;max-width:600px;">
          You received this email because you subscribed or interacted with Save the Orphans Africa.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// =====================================================================
// ADMIN NOTIFICATION
// =====================================================================
export function adminNotificationEmail({
  type,
  data,
}: {
  type: "contact" | "volunteer" | "subscriber" | "donation";
  data: Record<string, any>;
}) {
  const titles: Record<string, string> = {
    contact: "New Contact Message",
    volunteer: "New Volunteer Application",
    subscriber: "New Newsletter Subscriber",
    donation: "New Donation Received",
  };

  const rows = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([key, value]) => `
      <tr>
        <td style="padding:8px 0;color:#6B7280;font-size:13px;width:140px;vertical-align:top;border-bottom:1px solid #F5F7F4;">
          ${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </td>
        <td style="padding:8px 0;color:#1F2933;font-size:14px;border-bottom:1px solid #F5F7F4;">
          ${String(value).substring(0, 500)}
        </td>
      </tr>`
    )
    .join("");

  return wrapEmail({
    title: titles[type],
    body: `
      <p>A new <strong>${type}</strong> submission just came in on your website:</p>
      <table cellpadding="0" cellspacing="0" style="margin-top:16px;width:100%;">
        ${rows}
      </table>
    `,
    ctaText: "Open Admin Dashboard",
    ctaUrl: `${SITE_URL}/admin`,
    footerNote: "Automated notification from Save the Orphans Africa website.",
  });
}

// =====================================================================
// DONATION RECEIPT
// =====================================================================
export function donationReceiptEmail({
  donorName,
  amount,
  currency,
  reference,
  program,
  frequency,
  date,
}: {
  donorName: string;
  amount: number;
  currency: string;
  reference: string;
  program: string;
  frequency: string;
  date: string;
}) {
  const greeting = donorName ? `Dear ${donorName}` : "Dear Donor";
  const amountStr = `${currency} ${amount.toLocaleString()}`;
  const frequencyStr = frequency === "monthly" ? " (monthly)" : "";

  return wrapEmail({
    title: "Thank You for Your Donation",
    body: `
      <p>${greeting},</p>
      <p>Thank you for your generous donation to Save the Orphans Africa. Your support will directly help provide care, education, and hope to vulnerable children.</p>

      <table cellpadding="0" cellspacing="0" style="margin-top:24px;width:100%;background:#FFF9EF;border-radius:8px;padding:20px;">
        <tr>
          <td style="padding:8px 0;color:#6B7280;font-size:13px;">Amount</td>
          <td style="padding:8px 0;color:#1F2933;font-size:15px;font-weight:600;text-align:right;">${amountStr}${frequencyStr}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6B7280;font-size:13px;">Reference</td>
          <td style="padding:8px 0;color:#1F2933;font-size:14px;font-family:monospace;text-align:right;">${reference}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6B7280;font-size:13px;">Program</td>
          <td style="padding:8px 0;color:#1F2933;font-size:14px;text-align:right;text-transform:capitalize;">${program.replace(/-/g, " ")}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6B7280;font-size:13px;">Date</td>
          <td style="padding:8px 0;color:#1F2933;font-size:14px;text-align:right;">${date}</td>
        </tr>
      </table>

      <p style="margin-top:24px;">This email serves as your donation receipt. Please keep it for your records.</p>
      <p>With gratitude,<br/>The Save the Orphans Africa Team</p>
    `,
    footerNote: "Questions? Contact donations@savetheorphansafrica.org",
  });
}