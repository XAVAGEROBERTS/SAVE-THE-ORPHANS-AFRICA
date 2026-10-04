import { createClient } from "@/lib/supabase/server";

// =====================================================================
// PROGRAMS
// =====================================================================
export async function getPrograms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching programs:", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    longDescription: row.long_description || "",
    image: row.image_url || "",
    icon: row.icon || "Star",
    color: row.color || "#176B45",
    objectives: row.objectives || [],
    impactStats: row.impact_stats || [],
  }));
}

export async function getProgramBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    longDescription: data.long_description || "",
    image: data.image_url || "",
    icon: data.icon || "Star",
    color: data.color || "#176B45",
    objectives: data.objectives || [],
    impactStats: data.impact_stats || [],
  };
}

// =====================================================================
// STORIES
// =====================================================================
export async function getStories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image_url || "",
    date: row.published_at,
    category: row.category,
    author: row.author,
  }));
}

export async function getStoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    image: data.image_url || "",
    date: data.published_at,
    category: data.category,
    author: data.author,
  };
}

// =====================================================================
// IMPACT STATS
// =====================================================================
export async function getImpactStats() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("impact_stats")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching impact stats:", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    value: row.value,
    suffix: row.suffix || "",
    label: row.label,
    description: row.description || "",
    icon: row.icon || "Star",
  }));
}

// =====================================================================
// GALLERY
// =====================================================================
export async function getGalleryImages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching gallery:", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    src: row.image_url,
    alt: row.alt_text,
    category: row.category,
  }));
}