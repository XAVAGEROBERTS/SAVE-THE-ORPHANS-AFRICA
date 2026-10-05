import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://save-the-orphans-africa.vercel.app";

const LOGO_URL =
  process.env.NEXT_PUBLIC_SITE_LOGO_URL ||
  "https://mkzqskurodstcmzlevte.supabase.co/storage/v1/object/public/site-images/logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Save the Orphans Africa | Every Child Deserves a Safe Home",
    template: "%s | Save the Orphans Africa",
  },
  description:
    "Save the Orphans Africa provides vulnerable children with care, education, protection, healthcare, and opportunities for a brighter future.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Save the Orphans Africa",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: LOGO_URL, type: "image/png" },
      { url: LOGO_URL, sizes: "32x32", type: "image/png" },
      { url: LOGO_URL, sizes: "16x16", type: "image/png" },
    ],
    shortcut: LOGO_URL,
    apple: [{ url: LOGO_URL, sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: LOGO_URL,
      },
    ],
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