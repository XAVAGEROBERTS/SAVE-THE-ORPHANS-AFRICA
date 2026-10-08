import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  GraduationCap,
  Utensils,
  Home,
  Stethoscope,
  BookOpen,
  Shield,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://savetheorphansafrica.org";

const SITE_NAME = "Save the Orphans Africa";

const PAGE_DESCRIPTION =
  "Sponsor a child in Africa from $15/month. Your monthly gift provides education, food, healthcare, and a safe home for a vulnerable child. Choose a cause and start today.";

export const metadata: Metadata = {
  title: "Sponsor a Child",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/sponsor" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/sponsor`,
    siteName: SITE_NAME,
    title: `Sponsor a Child | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `Sponsor a Child — ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Sponsor a Child | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const categories = [
  {
    icon: GraduationCap,
    title: "Education",
    amount: 30,
    programSlug: "education",
    description: "School fees, uniforms, books.",
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    amount: 25,
    programSlug: "healthcare",
    description: "Medical checkups and medication.",
  },
  {
    icon: Utensils,
    title: "Food & Nutrition",
    amount: 40,
    programSlug: "nutrition",
    description: "Three nutritious meals daily.",
  },
  {
    icon: Home,
    title: "Accommodation",
    amount: 50,
    programSlug: "child-protection",
    description: "Safe housing and utilities.",
  },
  {
    icon: BookOpen,
    title: "School Supplies",
    amount: 15,
    programSlug: "education",
    description: "Notebooks, pens, bags.",
  },
  {
    icon: Shield,
    title: "General Care",
    amount: 20,
    programSlug: "general",
    description: "Clothing and essentials.",
  },
];

// Structured data: ItemList of sponsorship offers + BreadcrumbList.
// Each offer points to /donate with preset params — that page has its own
// DonateAction schema, so we don't duplicate it here.
const sponsorSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/sponsor/#collection`,
      url: `${SITE_URL}/sponsor`,
      name: `Sponsor a Child | ${SITE_NAME}`,
      description: PAGE_DESCRIPTION,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/sponsor/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Sponsor a Child",
          item: `${SITE_URL}/sponsor`,
        },
      ],
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/sponsor/#offers`,
      name: "Sponsorship Options",
      itemListElement: categories.map((c, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Offer",
          name: `${c.title} Sponsorship`,
          description: c.description,
          price: c.amount,
          priceCurrency: "USD",
          url: `${SITE_URL}/donate?amount=${c.amount}&program=${c.programSlug}&frequency=monthly&source=sponsor&label=${encodeURIComponent(c.title)}`,
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: c.amount,
            priceCurrency: "USD",
            billingDuration: "P1M",
          },
        },
      })),
    },
  ],
};

export default function SponsorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sponsorSchema) }}
      />

      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">
            Change a Life
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">
            Sponsor a Child
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Your support can provide education, food, healthcare, and a safe
            environment for a vulnerable child.
          </p>
        </div>
      </section>

      <section className="section-padding bg-light">
        <div className="container-custom">
          <div className="bg-cream border border-gold/30 rounded-xl p-6 mb-12 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-gold-dark shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-dark mb-1">
                  Child Safeguarding Commitment
                </h3>
                <p className="text-sm text-dark/70 leading-relaxed">
                  We are deeply committed to protecting the children in our
                  care. Sponsorship funds are pooled to support all children in
                  our programs.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((c) => {
              const sponsorUrl = `/donate?amount=${c.amount}&program=${c.programSlug}&frequency=monthly&source=sponsor&label=${encodeURIComponent(c.title)}`;
              return (
                <div key={c.title} className="card p-6 flex flex-col">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <c.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{c.title}</h3>
                  <p className="text-dark/60 text-sm mb-4 flex-1">
                    {c.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-light">
                    <span className="font-bold text-primary">
                      ${c.amount}/month
                    </span>
                    <Link
                      href={sponsorUrl}
                      className="text-primary font-semibold text-sm hover:underline"
                    >
                      Sponsor →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/donate?frequency=monthly&source=sponsor"
              className="btn-primary text-lg px-8 py-4"
            >
              <Heart className="w-5 h-5" fill="currentColor" />
              Become a Sponsor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}