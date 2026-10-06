import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { logActivity, summarizeRecord, getRequestInfo } from "@/lib/admin/activity-log";

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

  const { data: existing, error: fetchErr } = await supabase
    .from("donations")
    .select("status, reference, donor_email, amount, currency")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Donation not found" }, { status: 404 });
  }

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

  const { ipAddress, userAgent } = getRequestInfo(req);
  await logActivity({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.full_name || null,
    action: "update",
    tableName: "donations",
    recordId: id,
    recordSummary: summarizeRecord("donations", data),
    changes: {
      field: "status",
      from: existing.status,
      to: "refunded",
    },
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch the row BEFORE deleting so the log has meaningful info
  const { data: existing, error: fetchErr } = await supabase
    .from("donations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Donation not found" }, { status: 404 });
  }

  const { error } = await supabase.from("donations").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { ipAddress, userAgent } = getRequestInfo(req);
  await logActivity({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.full_name || null,
    action: "delete",
    tableName: "donations",
    recordId: id,
    recordSummary: summarizeRecord("donations", existing),
    changes: {
      reference: existing.reference,
      status: existing.status,
      amount: existing.amount,
      currency: existing.currency,
      donor_email: existing.donor_email,
    },
    ipAddress,
    userAgent,
  });

  return NextResponse.json({ success: true });
}