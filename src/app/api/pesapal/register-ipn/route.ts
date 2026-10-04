import { NextResponse } from "next/server";
import { getPesapalToken, registerIPN } from "@/lib/pesapal";

export async function GET() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const ipnUrl = `${siteUrl}/api/webhooks/pesapal`;

    const token = await getPesapalToken();
    const ipnId = await registerIPN(token, ipnUrl);

    return NextResponse.json({
      success: true,
      ipn_id: ipnId,
      registered_url: ipnUrl,
      message: "Save this ipn_id into .env.local as PESAPAL_IPN_ID",
    });
  } catch (error: any) {
    console.error("IPN registration error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}