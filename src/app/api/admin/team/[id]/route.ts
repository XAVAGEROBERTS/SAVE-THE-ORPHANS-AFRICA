import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity-log";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { data: before } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("team_members")
    .update({
      name: body.name,
      role: body.role,
      bio: body.bio,
      image_url: body.image_url || "",
      email: body.email || null,
      linkedin_url: body.linkedin_url || null,
      display_order: body.display_order || 0,
      is_founder: body.is_founder ?? false,
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
    tableName: "team_members",
    recordId: id,
    recordSummary: `Team member: ${data.name}`,
    changes: { before, after: data },
  });

  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: before } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.full_name,
    action: "delete",
    tableName: "team_members",
    recordId: id,
    recordSummary: `Deleted team member: ${before?.name}`,
    changes: { deleted: before },
  });

  return NextResponse.json({ success: true });
}