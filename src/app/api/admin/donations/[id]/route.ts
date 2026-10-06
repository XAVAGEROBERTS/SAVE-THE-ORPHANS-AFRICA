import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/admin/auth";

interface Props {
  params: Promise<{ id: string }>;
}

// Admins can only set these statuses manually. Gateway-driven statuses
// (completed, failed, pending) must come from Nylon Pay — webhook or cron.
const ALLOWED_MANUAL_STATUSES = new Set(["refunded"]);

export async function PATCH(req: NextRequest, { params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status } = body;

  if (!status || !ALLOWED_MANUAL_STATUSES.has(status)) {
    return NextResponse.json(
      {
        error:
          "Invalid status. Admins can only mark a donation as 'refunded'. " +
          "Payment statuses (completed, failed, pending) come from the gateway " +
          "and cannot be edited manually.",
      },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("donations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("donations").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}