// src/app/(public)/stories/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Calendar, User, Share2, ArrowRight } from "lucide-react";
import { getStories, getStoryBySlug } from "@/lib/supabase/queries";
import { formatDate } from "@/utils/format";
import { StoryCard } from "@/components/StoryCard/StoryCard";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://save-the-orphans-africa.vercel.app";

const SITE_NAME = "Save the Orphans Africa";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return {
      title: "Story Not Found",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}/stories/${story.slug}`;
  const description =
    story.excerpt?.trim() ||
    `${story.title} — a story from ${SITE_NAME}.`;

  // Only pass through a valid image URL — otherwise OG previews break
  const ogImage = story.image
    ? story.image.startsWith("http")
      ? story.image
      : `${SITE_URL}${story.image}`
    : `${SITE_URL}/og-image.png`;

  return {
    title: story.title,
    description,
    alternates: { canonical: `/stories/${story.slug}` },
    authors: story.author ? [{ name: story.author }] : undefined,
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      title: story.title,
      description,
      publishedTime: story.date,
      authors: story.author ? [story.author] : undefined,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: story.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const allStories = await getStories();
  const related = allStories.filter((s) => s.slug !== slug).slice(0, 3);

  const storyUrl = `${SITE_URL}/stories/${story.slug}`;
  const storyImage = story.image
    ? story.image.startsWith("http")
      ? story.image
      : `${SITE_URL}${story.image}`
    : `${SITE_URL}/og-image.png`;

  // Structured data: Article + BreadcrumbList
  const storySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${storyUrl}/#article`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntityOfPage: { "@id": storyUrl },
        headline: story.title,
        description: story.excerpt,
        image: [storyImage],
        datePublished: story.date,
        dateModified: story.date,
        author: story.author
          ? { "@type": "Person", name: story.author }
          : { "@type": "Organization", name: SITE_NAME },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/logo.svg`,
          },
        },
        articleSection: story.category,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${storyUrl}/#breadcrumb`,
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
            name: "Stories",
            item: `${SITE_URL}/stories`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: story.title,
            item: storyUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      {/* JSON-LD for this story */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storySchema) }}
      />

      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-white/70 hover:text-gold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stories
          </Link>
          <span className="inline-block bg-gold text-dark text-xs font-semibold px-3 py-1 rounded-full mb-4">
            {story.category}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl">
            {story.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={story.date}>{formatDate(story.date)}</time>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{story.author}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {story.image && (
              <div className="rounded-2xl overflow-hidden aspect-[16/9] relative mb-10">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                  unoptimized
                />
              </div>
            )}

            <article>
              <p className="text-xl text-dark/80 leading-relaxed mb-6 font-medium">
                {story.excerpt}
              </p>
              <div className="text-dark/70 leading-relaxed whitespace-pre-line">
                {story.content}
              </div>
            </article>

            <div className="mt-10 pt-6 border-t border-light flex items-center justify-between">
              <p className="text-sm text-dark/60">Share this story</p>
              <div className="flex gap-2">
                <button
                  className="w-10 h-10 rounded-full bg-light flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-10">
              <Link href="/stories" className="btn-ghost">
                <ArrowLeft className="w-4 h-4" />
                Back to All Stories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-padding bg-light">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-dark">
                Related Stories
              </h2>
              <Link
                href="/stories"
                className="text-primary font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((s) => (
                <StoryCard key={s.id} story={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Help Us Write More Stories Like This
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">
            Your support makes transformation possible.
          </p>
          <Link href="/donate" className="btn-secondary text-lg px-8 py-4">
            Donate Now
          </Link>
        </div>
      </section>
    </>
  );
}