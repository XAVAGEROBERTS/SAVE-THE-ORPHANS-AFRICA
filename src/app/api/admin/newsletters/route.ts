import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { sendEmail } from "@/lib/email/resend";
import { wrapEmail } from "@/lib/email/templates";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("newsletters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { subject, content, sendNow } = body;

  if (!subject || !content) {
    return NextResponse.json({ error: "Subject and content required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Create the newsletter record
  const { data: newsletter, error: createError } = await supabase
    .from("newsletters")
    .insert({
      subject,
      body: content,
      status: sendNow ? "sending" : "draft",
    })
    .select()
    .single();

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  if (!sendNow) {
    return NextResponse.json({ data: newsletter });
  }

  // Fetch active subscribers
  const { data: subscribers, error: subError } = await supabase
    .from("subscribers")
    .select("email, name, unsubscribe_token")
    .eq("is_active", true);

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  if (!subscribers || subscribers.length === 0) {
    await supabase.from("newsletters").update({ status: "failed" }).eq("id", newsletter.id);
    return NextResponse.json({ error: "No active subscribers" }, { status: 400 });
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://savetheorphansafrica.org";

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    try {
      const unsubscribeUrl = sub.unsubscribe_token
        ? `${SITE_URL}/unsubscribe?token=${sub.unsubscribe_token}`
        : undefined;

      const html = wrapEmail({
        title: subject,
        body: content.replace(/\n/g, "<br />"),
        ctaText: "Visit Our Website",
        ctaUrl: SITE_URL,
        footerNote: "You received this because you subscribed to Save the Orphans Africa.",
        unsubscribeUrl,
      });

      await sendEmail({ to: sub.email, subject, html });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${sub.email}:`, err);
      failed++;
    }

    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 100));
  }

  // Update newsletter status
  await supabase
    .from("newsletters")
    .update({
      status: failed === subscribers.length ? "failed" : "sent",
      recipient_count: sent,
      sent_at: new Date().toISOString(),
    })
    .eq("id", newsletter.id);

  return NextResponse.json({
    data: { sent, failed, total: subscribers.length },
  });
}