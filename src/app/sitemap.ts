import type { MetadataRoute } from "next";
import { getStories, getPrograms } from "@/lib/supabase/queries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://save-the-orphans-africa.vercel.app";

// Static routes — keep in sync with your actual /(public) pages
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/donate", priority: 0.9, changeFrequency: "weekly" },
  { path: "/sponsor", priority: 0.9, changeFrequency: "monthly" },
  { path: "/stories", priority: 0.8, changeFrequency: "weekly" },
  { path: "/programs", priority: 0.8, changeFrequency: "monthly" },
  { path: "/team", priority: 0.6, changeFrequency: "monthly" },
  { path: "/volunteer", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/donation-policy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/child-safeguarding", priority: 0.4, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Fetch dynamic content in parallel
  const [stories, programs] = await Promise.all([
    getStories().catch(() => []),
    getPrograms().catch(() => []),
  ]);

  const storyEntries: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${SITE_URL}/stories/${story.slug}`,
    lastModified: story.date ? new Date(story.date) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const programEntries: MetadataRoute.Sitemap = programs.map((program) => ({
    url: `${SITE_URL}/programs/${program.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...storyEntries, ...programEntries];
}