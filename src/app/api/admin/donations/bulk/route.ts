import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/admin/auth";
import { logActivity, getRequestInfo } from "@/lib/admin/activity-log";

// PATCH /api/admin/donations/bulk
// body: { ids: string[], action: "refund" | "delete" }
export async function PATCH(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { ids, action } = body as { ids?: string[]; action?: string };

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }
  if (action !== "refund" && action !== "delete") {
    return NextResponse.json(
      { error: "action must be 'refund' or 'delete'" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Fetch all target rows first (needed for logging + refund validation)
  const { data: rows, error: fetchErr } = await supabase
    .from("donations")
    .select("*")
    .in("id", ids);

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "No matching donations" }, { status: 404 });
  }

  let succeeded: string[] = [];
  let skipped: { id: string; reason: string }[] = [];

  if (action === "refund") {
    // Only refund rows that are currently completed
    const refundable = rows.filter((r) => r.status === "completed");
    skipped = rows
      .filter((r) => r.status !== "completed")
      .map((r) => ({ id: r.id, reason: `status=${r.status}` }));

    if (refundable.length > 0) {
      const { error: updateErr } = await supabase
        .from("donations")
        .update({ status: "refunded" })
        .in(
          "id",
          refundable.map((r) => r.id)
        );

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
      succeeded = refundable.map((r) => r.id);
    }
  } else {
    // delete
    const { error: deleteErr } = await supabase
      .from("donations")
      .delete()
      .in(
        "id",
        rows.map((r) => r.id)
      );

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }
    succeeded = rows.map((r) => r.id);
  }

  const { ipAddress, userAgent } = getRequestInfo(req);
  await logActivity({
    userId: admin.id,
    userEmail: admin.email,
    userName: admin.name || null,
    action: action === "refund" ? "update" : "delete",
    tableName: "donations",
    recordId: null,
    recordSummary: `Bulk ${action}: ${succeeded.length} donation${
      succeeded.length === 1 ? "" : "s"
    }${skipped.length > 0 ? ` (${skipped.length} skipped)` : ""}`,
    changes: {
      bulk: true,
      action,
      succeeded: rows
        .filter((r) => succeeded.includes(r.id))
        .map((r) => ({
          reference: r.reference,
          amount: r.amount,
          currency: r.currency,
          status: r.status,
        })),
      skipped,
    },
    ipAddress,
    userAgent,
  });

  return NextResponse.json({
    succeeded: succeeded.length,
    skipped: skipped.length,
    results: { succeeded, skipped },
  });
}