// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

// Fail loudly in production if the env var is missing — you don't want
// canonical URLs pointing at *.vercel.app forever.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://save-the-orphans-africa.vercel.app";

const SITE_NAME = "Save the Orphans Africa";

const DEFAULT_DESCRIPTION =
  "Save the Orphans Africa provides vulnerable children with care, education, protection, healthcare, and opportunities for a brighter future. Donate today and change a life.";

// Viewport / theme-color — separate export in Next.js 15+
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#176B45" },
    { media: "(prefers-color-scheme: dark)", color: "#0F4A30" },
  ],
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Every Child Deserves a Safe Home`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "nonprofit",
  keywords: [
    "orphanage Africa",
    "donate orphans",
    "sponsor a child Africa",
    "charity Uganda",
    "save orphans",
    "child sponsorship Africa",
    "orphan care",
    "nonprofit Africa",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Every Child Deserves a Safe Home`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Give a child a home`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Every Child Deserves a Safe Home`,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo.svg",
    apple: [{ url: "/logo.svg" }],
  },
  manifest: "/manifest.webmanifest", // optional — see note below
};

// JSON-LD Organization/NGO schema — powers Google's rich results for nonprofits
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: DEFAULT_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressCountry: "UG",
  },
  // Only include donationUrl once it's stable
  donationUrl: `${SITE_URL}/donate`,
  // Add these once you have real social profiles:
  // sameAs: [
  //   "https://facebook.com/yourpage",
  //   "https://twitter.com/yourhandle",
  //   "https://instagram.com/yourhandle",
  // ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/stories?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {/* JSON-LD — placed in body is fine and avoids head injection quirks */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {children}

        {/* Plausible — domain pulled from env so it never goes stale */}
        <Script
          defer
          data-domain={new URL(SITE_URL).hostname}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}