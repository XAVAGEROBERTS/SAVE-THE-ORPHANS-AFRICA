import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/admin/auth";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status } = body;

  // Only one manual status transition is allowed.
  if (status !== "refunded") {
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

  // Fetch the current row to check its status
  const { data: existing, error: fetchErr } = await supabase
    .from("donations")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Donation not found" }, { status: 404 });
  }

  // Only completed donations can be refunded.
  if (existing.status !== "completed") {
    return NextResponse.json(
      {
        error: `Cannot refund a donation with status "${existing.status}". Only completed donations can be refunded.`,
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("donations")
    .update({ status: "refunded" })
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