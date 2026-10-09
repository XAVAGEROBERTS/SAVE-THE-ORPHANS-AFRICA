"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, AlertCircle, LogIn, Eye, EyeOff, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logClientActivity } from "@/lib/admin/client-activity";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("error") === "session_expired";
  const notAdmin = searchParams.get("error") === "not_admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionExpired) {
      setNotice("Your session expired due to inactivity. Please log in again.");
    } else if (notAdmin) {
      setNotice("Your account is not authorized for admin access.");
    }
  }, [sessionExpired, notAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError("Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!adminUser) {
        await supabase.auth.signOut();
        setError("Your account is not authorized for admin access.");
        setIsLoading(false);
        return;
      }

      await logClientActivity({
        action: "login",
        tableName: "admin_users",
        recordId: data.user.id,
        recordSummary: `Logged in: ${data.user.email}`,
      });

      try {
        await fetch("/api/admin/log-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.user.email,
            action: "login",
          }),
        });
      } catch (err) {
        // Silent — client-side already logged it
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-dark">Admin Login</h1>
          <p className="text-dark/60 text-sm mt-1">Save the Orphans Africa</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {notice && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg">
              <Clock className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{notice}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pr-12"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-dark/40 hover:text-primary hover:bg-primary/5 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-dark/50 mt-6">
          Only authorized staff can access this area.
        </p>
      </div>
    </div>
  );
}
