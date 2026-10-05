"use client";

import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { StoryCard } from "./StoryCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StoryRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  author: string;
  published_at: string;
  is_published: boolean;
}

interface StoryCardShape {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
}

export function RealtimeStoriesGrid({
  initialStories,
  limit,
  showCTA = false,
}: {
  initialStories: StoryCardShape[];
  limit?: number;
  showCTA?: boolean;
}) {
  const initialRows: StoryRow[] = initialStories.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    content: "",
    image_url: s.image,
    category: s.category,
    author: "",
    published_at: s.date,
    is_published: true,
  }));

  const { data: rows } = useRealtimeTable<StoryRow>({
    table: "stories",
    initialData: initialRows,
    orderBy: { column: "published_at", ascending: false },
  });

  const stories: StoryCardShape[] = rows
    .filter((r) => r.is_published !== false)
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      image: r.image_url || "",
      date: r.published_at,
      category: r.category,
    }));

  const displayed = limit ? stories.slice(0, limit) : stories;

  if (displayed.length === 0) {
    return <p className="text-center text-dark/60">No stories yet.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayed.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
      {showCTA && (
        <div className="text-center mt-10">
          <Link href="/stories" className="btn-ghost">
            Read All Stories
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </>
  );
}