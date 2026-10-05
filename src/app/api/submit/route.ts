import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp, type RateLimitAction } from "@/lib/rate-limit";

interface SubmitBody {
  table: string;
  data: Record<string, any>;
}

const ALLOWED_TABLES: Record<string, RateLimitAction> = {
  contact_messages: "contact",
  volunteer_applications: "volunteer",
  subscribers: "newsletter",
  donations: "donation",
};

export async function POST(req: NextRequest) {
  try {
    const body: SubmitBody = await req.json();
    const { table, data } = body;

    if (!table || !(table in ALLOWED_TABLES)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const limit = await checkRateLimit(ALLOWED_TABLES[table], ip);

    if (!limit.success) {
      const retryAfterSeconds = limit.reset
        ? Math.ceil((limit.reset - Date.now()) / 1000)
        : 3600;

      return NextResponse.json(
        {
          error: "Too many submissions from your IP address. Please try again later.",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(limit.limit || 0),
            "X-RateLimit-Remaining": String(limit.remaining || 0),
          },
        }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from(table).insert(data);

    if (error) {
      console.error("Supabase insert error:", error);

      if (
        table === "subscribers" &&
        (error.code === "23505" || error.message.toLowerCase().includes("duplicate"))
      ) {
        return NextResponse.json(
          { error: "This email is already subscribed." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, remaining: limit.remaining },
      {
        headers: {
          "X-RateLimit-Limit": String(limit.limit || 0),
          "X-RateLimit-Remaining": String(limit.remaining || 0),
        },
      }
    );
  } catch (err: any) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}