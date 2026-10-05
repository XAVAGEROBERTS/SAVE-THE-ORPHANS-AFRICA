import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { logActivity, summarizeRecord } from "@/lib/admin/activity-log";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("team_members")
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
    .from("team_members")
    .insert({
      name: body.name,
      role: body.role,
      bio: body.bio,
      image_url: body.image_url || "",
      email: body.email || null,
      linkedin_url: body.linkedin_url || null,
      display_order: body.display_order || 0,
      is_founder: body.is_founder ?? false,
      is_published: body.is_published ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.full_name,
    action: "create",
    tableName: "team_members",
    recordId: data.id,
    recordSummary: `Team member: ${data.name} (${data.role})`,
    changes: { created: data },
  });

  return NextResponse.json({ data });
}