import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Target,
  Eye,
  Shield,
  Users,
  Scale,
  Globe,
  Sparkles,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://savetheorphansafrica.org";

const SITE_NAME = "Save the Orphans Africa";

const PAGE_DESCRIPTION =
  "Founded in 2015, Save the Orphans Africa provides vulnerable children with a safe home, education, healthcare, and vocational training. Learn about our mission, values, and journey of serving 150+ children annually.";

export const metadata: Metadata = {
  title: "About Us",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    siteName: SITE_NAME,
    title: `About Us | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `About ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const values = [
  { icon: Heart, title: "Compassion", description: "We lead with empathy and kindness." },
  { icon: Shield, title: "Integrity", description: "We act with honesty and transparency." },
  { icon: Scale, title: "Accountability", description: "We take responsibility for our actions." },
  { icon: Users, title: "Dignity", description: "We treat every child with respect." },
  { icon: Globe, title: "Equality", description: "Every child deserves equal opportunities." },
  { icon: Sparkles, title: "Community", description: "We work together to create change." },
  { icon: Target, title: "Hope", description: "We inspire hope and belief in a better future." },
];

const milestones = [
  { year: "2015", event: "Founded with 12 children in a rented facility." },
  { year: "2017", event: "Opened our first permanent children's home." },
  { year: "2019", event: "Launched education program." },
  { year: "2021", event: "Established healthcare partnership." },
  { year: "2023", event: "Opened vocational training center." },
  { year: "2025", event: "Reached 150+ children supported annually." },
];

// Structured data: AboutPage + BreadcrumbList.
// The AboutPage type helps Google connect your org's page hierarchy.
const aboutSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about/#aboutpage`,
      url: `${SITE_URL}/about`,
      name: `About ${SITE_NAME}`,
      description: PAGE_DESCRIPTION,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/about/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "About Us",
          item: `${SITE_URL}/about`,
        },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">
            About Us
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">
            Our Story
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Learn about our journey, our mission, and the values that guide
            everything we do.
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="section-title">How It All Began</h2>
            <div className="space-y-4 text-dark/70 leading-relaxed">
              <p>
                Save the Orphans Africa was founded in 2015 by a group of
                community members who were deeply moved by the growing number of
                vulnerable and orphaned children in their community.
              </p>
              <p>
                What started as a small initiative to provide meals and shelter
                to 12 children has grown into a comprehensive organization
                serving over 150 children annually.
              </p>
              <p>
                Today, Save the Orphans Africa operates a children&apos;s home,
                an education center, a healthcare program, and vocational
                training facilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8 md:p-10">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-2xl mb-4">Our Mission</h3>
              <p className="text-dark/70 leading-relaxed">
                To provide vulnerable and orphaned children with a safe, loving
                and supportive environment where they can grow, learn and build
                a better future.
              </p>
            </div>
            <div className="card p-8 md:p-10">
              <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-gold-dark" />
              </div>
              <h3 className="font-bold text-2xl mb-4">Our Vision</h3>
              <p className="text-dark/70 leading-relaxed">
                A future where every vulnerable child has access to love,
                protection, education, healthcare and the opportunity to reach
                their full potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="text-center p-6 rounded-2xl hover:bg-light transition-colors"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <v.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-dark/60 text-sm leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Journey</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-6 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {m.year}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary/20 mt-2" />
                  )}
                </div>
                <div className="pt-2.5">
                  <p className="text-dark/80 leading-relaxed">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Us in Making a Difference
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link href="/donate" className="btn-secondary">
              Donate Now
            </Link>
            <Link href="/volunteer" className="btn-outline">
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}