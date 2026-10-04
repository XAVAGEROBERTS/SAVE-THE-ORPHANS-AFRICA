import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Save the Orphans Africa | Every Child Deserves a Safe Home",
    template: "%s | Save the Orphans Africa",
  },
  description:
    "Save the Orphans Africa provides vulnerable children with care, education, protection, healthcare, and opportunities for a brighter future.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
