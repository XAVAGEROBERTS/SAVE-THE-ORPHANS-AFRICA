// src/app/(public)/stories/page.tsx
import type { Metadata } from "next";
import { RealtimeStoriesGrid } from "@/components/StoryCard/RealtimeStoriesGrid";
import { getStories } from "@/lib/supabase/queries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://savetheorphansafrica.org";

const SITE_NAME = "Save the Orphans Africa";

const PAGE_DESCRIPTION =
  "Read real stories of transformation from the children and communities we serve. Success stories, education updates, community news, and volunteer experiences from Save the Orphans Africa.";

export const metadata: Metadata = {
  title: "Stories & News",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/stories" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/stories`,
    siteName: SITE_NAME,
    title: `Stories & News | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `Stories & News — ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Stories & News | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export const revalidate = 60;

const categories = [
  "All",
  "Success Stories",
  "Education",
  "Community",
  "Events",
  "News",
  "Volunteer Stories",
  "Fundraising",
];

export default async function StoriesPage() {
  const stories = await getStories();

  // Structured data: CollectionPage listing all stories as an ItemList.
  // Google uses this to understand the page is a hub of articles.
  const storiesSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/stories/#collection`,
        url: `${SITE_URL}/stories`,
        name: `Stories & News | ${SITE_NAME}`,
        description: PAGE_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/stories/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Stories & News",
            item: `${SITE_URL}/stories`,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/stories/#itemlist`,
        name: "Stories & News",
        itemListElement: stories.slice(0, 20).map((story, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE_URL}/stories/${story.slug}`,
          name: story.title,
        })),
      },
    ],
  };

  return (
    <>
      {/* JSON-LD for the stories listing page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storiesSchema) }}
      />

      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">
            Stay Informed
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">
            Stories & News
          </h1>
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
          <RealtimeStoriesGrid initialStories={stories} />
        </div>
      </section>
    </>
  );
}