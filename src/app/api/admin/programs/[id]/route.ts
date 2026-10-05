import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { logActivity, summarizeRecord } from "@/lib/admin/activity-log";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  // Fetch before state
  const { data: before } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("programs")
    .update({
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.full_name,
    action: "update",
    tableName: "programs",
    recordId: id,
    recordSummary: summarizeRecord("programs", data),
    changes: { before, after: data },
    ...getRequestInfoFromHeaders(req),
  });

  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch before delete
  const { data: before } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.full_name,
    action: "delete",
    tableName: "programs",
    recordId: id,
    recordSummary: summarizeRecord("programs", before),
    changes: { deleted: before },
    ...getRequestInfoFromHeaders(req),
  });

  return NextResponse.json({ success: true });
}

function getRequestInfoFromHeaders(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : null;
  const ua = req.headers.get("user-agent");
  return { ipAddress: ip, userAgent: ua };
}