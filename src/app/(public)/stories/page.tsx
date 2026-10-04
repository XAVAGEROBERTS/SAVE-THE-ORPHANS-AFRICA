import type { Metadata } from "next";
import { StoryCard } from "@/components/StoryCard/StoryCard";
import { getStories } from "@/lib/supabase/queries";

export const metadata: Metadata = { title: "Stories & News" };
export const revalidate = 60;

const categories = ["All", "Success Stories", "Education", "Community", "Events", "News", "Volunteer Stories", "Fundraising"];

export default async function StoriesPage() {
  const stories = await getStories();

  return (
    <>
      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">Stay Informed</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">Stories & News</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Success stories, updates, and news from our community.
          </p>
        </div>
      </section>

      <section className="section-padding bg-light">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((c) => (
              <button
                key={c}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-dark/70 hover:bg-primary hover:text-white transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
          {stories.length === 0 ? (
            <p className="text-center text-dark/60">No stories yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}