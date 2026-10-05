import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { wrapEmail } from "@/lib/email/templates";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://save-the-orphans-africa.vercel.app";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Look up unsubscribe token for this subscriber
    const supabase = createAdminClient();
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("unsubscribe_token")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    const unsubscribeUrl = subscriber?.unsubscribe_token
      ? `${SITE_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`
      : undefined;

    const greeting = name ? `Hi ${name}` : "Hello";

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
      footerNote:
        "You're receiving this because you subscribed on our website.",
      unsubscribeUrl,
    });

    await sendEmail({
      to: email,
      subject: "Welcome to Save the Orphans Africa!",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Welcome email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}