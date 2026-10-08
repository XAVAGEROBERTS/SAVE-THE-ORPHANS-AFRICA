"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Mail,
  DollarSign,
  Wallet,
  LogOut,
  Menu,
  X,
  ExternalLink,
  BookOpen,
  FileText,
  TrendingUp,
  Image as ImageIcon,
  Shield,
  Quote,
  Send,
  Settings,
  Activity,
  UserCog,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logClientActivity } from "@/lib/admin/client-activity";
import { cn } from "@/utils/cn";

const LOGO_URL =
  process.env.NEXT_PUBLIC_SITE_LOGO_URL ||
  "https://mkzqskurodstcmzlevte.supabase.co/storage/v1/object/public/site-images/logo.png";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/volunteers", label: "Volunteers", icon: Users },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/newsletters", label: "Newsletters", icon: Send },
  { href: "/admin/donations", label: "Donations", icon: DollarSign },
  { href: "/admin/treasury", label: "Treasury", icon: Wallet },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/stories", label: "Stories", icon: FileText },
  { href: "/admin/impact", label: "Impact Stats", icon: TrendingUp },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/team", label: "Team", icon: UserCog },
  { href: "/admin/users", label: "Admin Users", icon: Shield },
  { href: "/admin/activity", label: "Activity Log", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    }
    loadUser();
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isMobileOpen]);

  const handleLogout = async () => {
    if (userEmail) {
      try {
        await logClientActivity({
          action: "logout",
          tableName: "admin_users",
          recordId: null,
          recordSummary: `Logged out: ${userEmail}`,
        });
      } catch (err) {
        console.error("Client logout log failed:", err);
      }

      try {
        await fetch("/api/admin/log-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            action: "logout",
          }),
        });
      } catch (err) {
        // Silent
      }
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0B3D2E] text-white h-14 flex items-center justify-between px-4 shadow-lg">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileOpen}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          {isMobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <span className="font-bold text-base">Admin</span>
        <div className="w-10" />
      </header>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "admin-no-scrollbar fixed inset-y-0 left-0 z-40 bg-[#0B3D2E] text-white transform transition-transform duration-300 ease-in-out overflow-y-auto",
          // On mobile: cap at 80vw so it never exceeds the viewport
          "w-64 max-w-[80vw]",
          // Desktop: always visible
          "lg:translate-x-0 lg:w-64 lg:max-w-none",
          // Mobile: slide in/out
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col min-h-full">
          {/* Logo / brand */}
          <div className="p-5 border-b border-white/10">
            <Link
              href="/admin"
              className="flex items-center gap-3 min-w-0"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="w-11 h-11 rounded-full overflow-hidden relative bg-gold flex items-center justify-center shrink-0">
                <Image
                  src={LOGO_URL}
                  alt="Save the Orphans Africa"
                  fill
                  className="object-cover"
                  sizes="44px"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm leading-tight block truncate">
                  Save the Orphans
                </span>
                <span className="text-[11px] text-gold font-semibold tracking-wider block">
                  ADMIN PANEL
                </span>
              </div>
            </Link>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gold text-[#0B3D2E]"
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div className="p-3 border-t border-white/10 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span className="truncate">View Website</span>
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="truncate">{userEmail || "Settings"}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-500/20 transition-colors w-full"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="truncate">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
