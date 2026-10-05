import { NextRequest, NextResponse } from "next/server";
import { notifyAdmin } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: "Type and data required" },
        { status: 400 }
      );
    }

    await notifyAdmin(type, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Notify admin error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to notify" },
      { status: 500 }
    );
  }
}