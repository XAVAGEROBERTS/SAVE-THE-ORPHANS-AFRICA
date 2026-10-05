import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://save-the-orphans-africa.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Save the Orphans Africa | Every Child Deserves a Safe Home",
    template: "%s | Save the Orphans Africa",
  },
  description:
    "Save the Orphans Africa provides vulnerable children with care, education, protection, healthcare, and opportunities for a brighter future.",
  keywords: [
    "orphanage",
    "nonprofit",
    "Africa",
    "children",
    "charity",
    "donate",
    "volunteer",
    "sponsor",
  ],
  authors: [{ name: "Save the Orphans Africa" }],
  creator: "Save the Orphans Africa",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Save the Orphans Africa",
    title: "Save the Orphans Africa | Every Child Deserves a Safe Home",
    description:
      "Providing vulnerable children with care, education, protection, healthcare, and opportunities for a brighter future.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Save the Orphans Africa",
    description:
      "Providing vulnerable children with care, education, protection, healthcare, and opportunities for a brighter future.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Plausible Analytics */}
        <Script
          defer
          data-domain="save-the-orphans-africa.vercel.app"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}