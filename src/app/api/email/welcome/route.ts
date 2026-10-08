import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { wrapEmail } from "@/lib/email/templates";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://savetheorphansafrica.org";

function stripHeaderChars(input: string): string {
  return String(input).replace(/[\r\n\t]/g, " ").slice(0, 200);
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const cleanEmail = String(email).replace(/[\r\n\t]/g, "").trim().toLowerCase();
    const cleanName = name
      ? String(name).replace(/[\r\n\t]/g, "").trim().slice(0, 100)
      : "";

    // Look up unsubscribe token
    let unsubscribeUrl: string | undefined;
    try {
      const supabase = createAdminClient();
      const { data: subscriber } = await supabase
        .from("subscribers")
        .select("unsubscribe_token")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (subscriber?.unsubscribe_token) {
        unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`;
      }
    } catch (lookupErr) {
      console.error("Unsubscribe lookup failed:", lookupErr);
    }

    const greeting = cleanName ? `Hi ${cleanName}` : "Hello";

    const html = wrapEmail({
      title: "Welcome to Save the Orphans Africa!",
      body: `
        <p>${greeting},</p>
        <p>Thank you for subscribing to our newsletter. You'll now receive:</p>
        <ul style="padding-left:20px;color:#4B5563;">
          <li>Stories of the children your support helps</li>
          <li>Updates on our programs and impact</li>
          <li>Invitations to events and fundraising campaigns</li>
        </ul>
        <p>We're grateful for your support.</p>
      `,
      ctaText: "Learn More About Us",
      ctaUrl: `${SITE_URL}/about`,
      footerNote: "You're receiving this because you subscribed on our website.",
      unsubscribeUrl,
    });

    await sendEmail({
      to: cleanEmail,
      subject: "Welcome to Save the Orphans Africa!",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Welcome email error:", error);

    // Sanitize error message — no newlines allowed in headers
    const safeMessage = stripHeaderChars(error?.message || "Failed to send email");

    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}