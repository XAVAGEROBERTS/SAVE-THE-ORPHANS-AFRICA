import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Inactivity window in seconds. 300 = 5 minutes.
const INACTIVITY_TIMEOUT_SECONDS = 300;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: any;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const safeValue = String(value || "")
              .replace(/[\r\n]/g, "")
              .trim();

            if (!safeValue) return;

            try {
              const safeOptions = options
                ? { ...options, path: options.path || "/" }
                : { path: "/" };

              request.cookies.set(name, safeValue);
              response.cookies.set(name, safeValue, safeOptions);
            } catch (err) {
              console.error("Failed to set cookie:", name, err);
            }
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // If user is on the login page, always allow them to stay and log in.
  // Clear any stale inactivity cookie so the next session starts fresh.
  if (pathname === "/admin/login") {
    response.cookies.delete("admin_last_active");
    return response;
  }

  // All other /admin routes: enforce auth + admin role + timeout
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminUser) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      const redirect = NextResponse.redirect(url);
      redirect.cookies.delete("admin_last_active");
      return redirect;
    }

    // Inactivity check
    const lastActive = request.cookies.get("admin_last_active")?.value;
    const now = Date.now();

    if (lastActive) {
      const lastActiveTime = parseInt(lastActive, 10);
      const timeSinceLastActive = (now - lastActiveTime) / 1000;

      if (
        !isNaN(lastActiveTime) &&
        timeSinceLastActive > INACTIVITY_TIMEOUT_SECONDS
      ) {
        await supabase.auth.signOut();

        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.search = "";

        const redirect = NextResponse.redirect(url);
        redirect.cookies.delete("admin_last_active");
        return redirect;
      }
    }

    response.cookies.set("admin_last_active", now.toString(), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
