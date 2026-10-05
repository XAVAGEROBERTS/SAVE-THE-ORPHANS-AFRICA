"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Bell,
  LogOut,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile state
  const [fullName, setFullName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    contact: true,
    volunteer: true,
    subscriber: false,
    donation: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationsMessage, setNotificationsMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("id, email, full_name, role")
          .eq("id", authUser.id)
          .maybeSingle();

        if (adminUser) {
          setUser(adminUser);
          setFullName(adminUser.full_name || "");
        }
      }

      // Load notification preferences from localStorage
      try {
        const saved = localStorage.getItem("admin_notification_prefs");
        if (saved) setNotifications(JSON.parse(saved));
      } catch {}

      setIsLoading(false);
    }
    load();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords don't match." });
      return;
    }

    if (!currentPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please enter your current password.",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const supabase = createClient();

      // Verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordMessage({
          type: "error",
          text: "Current password is incorrect.",
        });
        setIsChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordMessage({ type: "error", text: updateError.message });
        setIsChangingPassword(false);
        return;
      }

      setPasswordMessage({
        type: "success",
        text: "Password updated successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err?.message || "Failed to update password.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("admin_users")
        .update({ full_name: fullName.trim() })
        .eq("id", user!.id);

      if (error) {
        setProfileMessage({ type: "error", text: error.message });
        setIsSavingProfile(false);
        return;
      }

      setProfileMessage({ type: "success", text: "Profile updated." });
    } catch (err: any) {
      setProfileMessage({
        type: "error",
        text: err?.message || "Failed to update profile.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSaveNotifications() {
    setNotificationsMessage(null);
    setIsSavingNotifications(true);

    try {
      localStorage.setItem(
        "admin_notification_prefs",
        JSON.stringify(notifications)
      );
      setNotificationsMessage({
        type: "success",
        text: "Notification preferences saved.",
      });
    } catch {
      setNotificationsMessage({
        type: "error",
        text: "Failed to save preferences.",
      });
    } finally {
      setIsSavingNotifications(false);
    }
  }

  async function handleSignOutAllDevices() {
    if (
      !confirm(
        "Sign out of all devices? You'll need to log in again on every device."
      )
    )
      return;

    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    router.push("/admin/login");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-dark/70">Could not load account information.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">Account Settings</h1>
        <p className="text-dark/60 mt-1">
          Manage your account, password, and notification preferences
        </p>
      </div>

      {/* Account Info */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-dark">Account Information</h2>
            <p className="text-dark/60 text-sm">Logged in as {user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {profileMessage && (
            <div
              className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                profileMessage.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {profileMessage.type === "success" ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              {profileMessage.text}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input"
              placeholder="Your full name"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="form-input bg-light cursor-not-allowed"
            />
            <p className="text-xs text-dark/50 mt-1">
              Email can&apos;t be changed. Contact your super admin.
            </p>
          </div>

          <div>
            <label className="form-label">Role</label>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <Shield className="w-3.5 h-3.5" />
              {user.role.replace("_", " ")}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="btn-primary"
          >
            {isSavingProfile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-dark">Change Password</h2>
            <p className="text-dark/60 text-sm">
              Update your password regularly for security
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordMessage && (
            <div
              className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                passwordMessage.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {passwordMessage.type === "success" ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              {passwordMessage.text}
            </div>
          )}

          <div>
            <label htmlFor="currentPassword" className="form-label">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input pr-12"
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-dark/40 hover:text-primary hover:bg-primary/5"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="form-label">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input pr-12"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-dark/40 hover:text-primary hover:bg-primary/5"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input pr-12"
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-dark/40 hover:text-primary hover:bg-primary/5"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="btn-primary"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-dark">Email Notifications</h2>
            <p className="text-dark/60 text-sm">
              Choose which events trigger admin alert emails
            </p>
          </div>
        </div>

        {notificationsMessage && (
          <div
            className={`p-3 rounded-lg text-sm flex items-start gap-2 mb-4 ${
              notificationsMessage.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {notificationsMessage.type === "success" ? (
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            {notificationsMessage.text}
          </div>
        )}

        <div className="space-y-4">
          {(
            [
              {
                key: "contact",
                label: "Contact Messages",
                description: "When someone submits the contact form",
              },
              {
                key: "volunteer",
                label: "Volunteer Applications",
                description: "When someone applies to volunteer",
              },
              {
                key: "subscriber",
                label: "Newsletter Subscribers",
                description: "When someone subscribes to the newsletter",
              },
              {
                key: "donation",
                label: "Donations",
                description: "When a donation is completed",
              },
            ] as const
          ).map((item) => (
            <label
              key={item.key}
              className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-light transition-colors cursor-pointer"
            >
              <div>
                <div className="font-semibold text-dark text-sm">
                  {item.label}
                </div>
                <div className="text-dark/60 text-xs mt-0.5">
                  {item.description}
                </div>
              </div>
              <div className="relative shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      [item.key]: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleSaveNotifications}
          disabled={isSavingNotifications}
          className="btn-primary mt-6"
        >
          {isSavingNotifications ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-2 border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-red-600">Danger Zone</h2>
            <p className="text-dark/60 text-sm">
              Irreversible actions — be careful
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOutAllDevices}
          className="px-4 py-2.5 rounded-lg border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors"
        >
          Sign Out of All Devices
        </button>
        <p className="text-xs text-dark/50 mt-2">
          Ends your session on every device you&apos;re currently logged in on.
        </p>
      </div>
    </div>
  );
}