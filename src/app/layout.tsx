import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://savetheorphansafrica.org";

const SITE_NAME = "Save the Orphans Africa";

const LOGO_URL =
  process.env.NEXT_PUBLIC_SITE_LOGO_URL ||
  "https://mkzqskurodstcmzlevte.supabase.co/storage/v1/object/public/site-images/logo.png";

const DEFAULT_DESCRIPTION =
  "Save the Orphans Africa provides vulnerable children with care, education, protection, healthcare, and opportunities for a brighter future. Donate today and change a life.";

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
  manifest: "/manifest.webmanifest",
  verification: {
    google: "ZmHDUHfTBDnHCS4Rx1gobPaqVfR7-QD9_vxYJuzF7Ag",
  },
};

// ---------------------------------------------------------------------------
// Single authoritative NGO + WebSite schema.
// Do not duplicate this in other layouts or pages — reference it via @id.
// ---------------------------------------------------------------------------
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "SOA",
  url: SITE_URL,
  logo: LOGO_URL,
  image: LOGO_URL,
  description: DEFAULT_DESCRIPTION,
  foundingDate: "2015",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kampala",
    addressCountry: "UG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+256-765-673-373",
    contactType: "Donor Support",
    email: "info@savetheorphansafrica.org",
    availableLanguage: ["English"],
  },
  sameAs: [
    "https://facebook.com/savetheorphansafrica",
    "https://twitter.com/savetheorphansafrica",
    "https://instagram.com/savetheorphansafrica",
    "https://linkedin.com/company/savetheorphansafrica",
    "https://youtube.com/@savetheorphansafrica",
  ],
  potentialAction: {
    "@type": "DonateAction",
    target: `${SITE_URL}/donate`,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {children}

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
