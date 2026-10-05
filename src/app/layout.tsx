import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://save-the-orphans-africa.vercel.app";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Hardcoded local favicon — bypasses all Next.js metadata quirks */}
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="shortcut icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="mask-icon" href="/logo.svg" color="#176B45" />

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