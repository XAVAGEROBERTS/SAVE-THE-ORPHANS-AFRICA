import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://savetheorphansafrica.org";
const SITE_NAME = "Save the Orphans Africa";
const DEFAULT_DESCRIPTION =
  "Providing vulnerable children with care, education, protection, healthcare, and opportunities for a brighter future.";

// Auto-generated OG image (from src/app/opengraph-image.tsx)
const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = "website",
}: {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}): Metadata {
  const ogImage = image || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: url || SITE_URL,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  };
}