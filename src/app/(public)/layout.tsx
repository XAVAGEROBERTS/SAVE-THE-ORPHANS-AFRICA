import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://save-the-orphans-africa.vercel.app";

const LOGO_URL =
  process.env.NEXT_PUBLIC_SITE_LOGO_URL ||
  "https://mkzqskurodstcmzlevte.supabase.co/storage/v1/object/public/site-images/logo.png";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NGO",
            name: "Save the Orphans Africa",
            alternateName: "SOA",
            url: SITE_URL,
            logo: LOGO_URL,
            image: LOGO_URL,
            description:
              "Save the Orphans Africa provides vulnerable children with care, education, protection, healthcare, and opportunities for a brighter future.",
            foundingDate: "2015",
            address: {
              "@type": "PostalAddress",
              streetAddress: "123 Hope Street",
              addressLocality: "Nairobi",
              addressCountry: "KE",
            },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+254-700-000-000",
              contactType: "Donor Support",
              email: "info@savetheorphansafrica.org",
              availableLanguage: ["English", "Swahili"],
            },
            sameAs: [
              "https://facebook.com/savetheorphansafrica",
              "https://twitter.com/savetheorphansafrica",
              "https://instagram.com/savetheorphansafrica",
              "https://linkedin.com/company/savetheorphansafrica",
              "https://youtube.com/@savetheorphansafrica",
            ],
          }),
        }}
      />

      {/* Skip to main content link — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}