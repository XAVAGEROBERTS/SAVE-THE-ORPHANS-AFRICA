import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { logActivity, summarizeRecord } from "@/lib/admin/activity-log";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("programs")
    .insert({
      slug: body.slug,
      title: body.title,
      description: body.description,
      long_description: body.long_description || "",
      image_url: body.image_url || "",
      icon: body.icon || "Star",
      color: body.color || "#176B45",
      objectives: body.objectives || [],
      impact_stats: body.impact_stats || [],
      display_order: body.display_order || 0,
      is_published: body.is_published ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log the action
  await logActivity({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.full_name,
    action: "create",
    tableName: "programs",
    recordId: data.id,
    recordSummary: summarizeRecord("programs", data),
    changes: { created: data },
    ...getRequestInfoFromHeaders(req),
  });

  return NextResponse.json({ data });
}

function getRequestInfoFromHeaders(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : null;
  const ua = req.headers.get("user-agent");
  return { ipAddress: ip, userAgent: ua };
}