import { createClient } from "@/lib/supabase/server";

export async function getCurrentAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}

export async function requireSuperAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    throw new Error("Unauthorized");
  }
  return admin;
}