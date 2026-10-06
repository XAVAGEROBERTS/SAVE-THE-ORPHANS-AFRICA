// src/app/(public)/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  Users,
  HandHeart,
  Building,
} from "lucide-react";
import { Hero } from "@/components/Hero/Hero";
import { RealtimeImpactStats } from "@/components/ImpactStats/RealtimeImpactStats";
import { RealtimeProgramsGrid } from "@/components/ProgramCard/RealtimeProgramsGrid";
import { RealtimeStoriesGrid } from "@/components/StoryCard/RealtimeStoriesGrid";
import { Testimonial } from "@/components/Testimonial/Testimonial";
import { RealtimeTeamGrid } from "@/components/Team/RealtimeTeamGrid";
import {
  getPrograms,
  getStories,
  getTeamMembers,
  getImpactStats,
} from "@/lib/supabase/queries";

export const revalidate = 60;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://save-the-orphans-africa.vercel.app";

const SITE_NAME = "Save the Orphans Africa";

const HOME_DESCRIPTION =
  "Save the Orphans Africa provides vulnerable children with a safe home, education, healthcare, and the opportunity to build a brighter future. Donate or sponsor a child today.";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} | Every Child Deserves a Safe Home`,
  },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Every Child Deserves a Safe Home`,
    description: HOME_DESCRIPTION,
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
    description: HOME_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

// Structured data for the homepage — Organization + FAQ.
// FAQ schema can win you the "People also ask" box in Google.
const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NGO",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      description: HOME_DESCRIPTION,
      address: { "@type": "PostalAddress", addressCountry: "UG" },
      donationUrl: `${SITE_URL}/donate`,
      founder: [
        // Fill in real founders once you have their names + URLs
        // {
        //   "@type": "Person",
        //   "name": "Robert ...",
        //   "url": `${SITE_URL}/team/robert`,
        // },
      ],
      // sameAs: [
      //   "https://facebook.com/yourpage",
      //   "https://twitter.com/yourhandle",
      //   "https://instagram.com/yourhandle",
      // ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What does Save the Orphans Africa do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We provide vulnerable children in Africa with a safe home, education, healthcare, nutrition, and long-term support so they can grow into independent adults.",
          },
        },
        {
          "@type": "Question",
          name: "How much of my donation goes to programs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "85% of every donation goes directly to programs for the children. The remaining 15% covers essential operational costs.",
          },
        },
        {
          "@type": "Question",
          name: "Can I sponsor a specific child?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Through our sponsorship program you can support a specific cause on a monthly basis. Visit our donate page and choose the sponsor option.",
          },
        },
        {
          "@type": "Question",
          name: "Is my donation tax-deductible?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Tax deductibility depends on your country. Contact us with your details and we will provide the appropriate documentation.",
          },
        },
      ],
    },
  ],
};

export default async function HomePage() {
  const programs = await getPrograms();
  const stories = await getStories();
  const team = await getTeamMembers();
  const impactStats = await getImpactStats();

  return (
    <>
      {/* JSON-LD structured data for homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />

      <Hero />
      <RealtimeImpactStats initialStats={impactStats} />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-gold font-semibold text-sm tracking-wider uppercase">
                Our Mission
              </span>
              <h2 className="section-title mt-2">
                Together, We Can Create Brighter Futures
              </h2>
              <p className="text-lg text-dark/70 leading-relaxed mb-6">
                Save the Orphans Africa is committed to providing vulnerable
                children with a safe, loving, and supportive environment where
                they can grow, learn, and build a better future.
              </p>
              <p className="text-dark/70 leading-relaxed mb-8">
                We believe that every child deserves access to love, protection,
                education, healthcare, and the opportunity to reach their full
                potential. Our holistic approach addresses the physical,
                emotional, and educational needs of each child in our care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/about" className="btn-primary">
                  Learn More About Us
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/programs" className="btn-ghost">
                  Our Programs
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] relative">
                  <Image
                    src="https://placehold.co/400x533/176B45/FFFFFF/png?text=Learning"
                    alt="Children learning together"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    unoptimized
                  />
                </div>
                <div className="bg-primary rounded-2xl p-6 text-white">
                  <Heart
                    className="w-8 h-8 text-gold mb-3"
                    fill="currentColor"
                  />
                  <p className="font-bold text-2xl">10+ Years</p>
                  <p className="text-white/70 text-sm">of dedicated service</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-gold rounded-2xl p-6 text-dark">
                  <Users className="w-8 h-8 mb-3" />
                  <p className="font-bold text-2xl">150+</p>
                  <p className="text-dark/70 text-sm">Children supported</p>
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[3/4] relative">
                  <Image
                    src="https://placehold.co/400x533/F4B942/1F2933/png?text=Community"
                    alt="Community outreach"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-gold font-semibold text-sm tracking-wider uppercase">
              What We Do
            </span>
            <h2 className="section-title mt-2">Our Programs</h2>
            <p className="section-subtitle">
              Comprehensive support that addresses every aspect of a
              child&apos;s development.
            </p>
          </div>
          <RealtimeProgramsGrid
            initialPrograms={programs}
            limit={3}
            showCTA={true}
          />
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-gold font-semibold text-sm tracking-wider uppercase">
              Stories of Hope
            </span>
            <h2 className="section-title mt-2">Latest News & Stories</h2>
            <p className="section-subtitle">
              Real stories of transformation from the children and communities
              we serve.
            </p>
          </div>
          <RealtimeStoriesGrid
            initialStories={stories}
            limit={4}
            showCTA={true}
          />
        </div>
      </section>

      {team.length > 0 && (
        <section className="section-padding bg-light">
          <div className="container-custom">
            <div className="text-center mb-12">
              <span className="text-gold font-semibold text-sm tracking-wider uppercase">
                Our People
              </span>
              <h2 className="section-title mt-2">Meet the Founders</h2>
              <p className="section-subtitle">
                Real people committed to real change for vulnerable children.
              </p>
            </div>
            <RealtimeTeamGrid initialMembers={team} limit={3} showCTA={true} />
          </div>
        </section>
      )}

      <Testimonial />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-gold font-semibold text-sm tracking-wider uppercase">
              Get Involved
            </span>
            <h2 className="section-title mt-2">How You Can Help</h2>
            <p className="section-subtitle">
              There are many ways to make a difference in the lives of
              vulnerable children.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Donate",
                description:
                  "Your gift provides essential support—food, education, healthcare, and shelter.",
                href: "/donate",
                cta: "Donate Now",
              },
              {
                icon: HandHeart,
                title: "Volunteer",
                description:
                  "Give your time and skills to make a direct impact in children's lives.",
                href: "/volunteer",
                cta: "Become a Volunteer",
              },
              {
                icon: Building,
                title: "Partner With Us",
                description:
                  "Work with us to create lasting change in communities across Africa.",
                href: "/get-involved",
                cta: "Partner With Us",
              },
            ].map((item) => (
              <div key={item.title} className="card p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-dark/70 text-sm mb-6 leading-relaxed">
                  {item.description}
                </p>
                <Link href={item.href} className="btn-primary w-full">
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Your generosity can transform a child&apos;s life. Every donation,
            no matter the size, creates ripples of hope and opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donate" className="btn-secondary text-lg px-8 py-4">
              <Heart className="w-5 h-5" fill="currentColor" />
              Donate Now
            </Link>
            <Link
              href="/get-involved"
              className="btn-outline text-lg px-8 py-4"
            >
              Other Ways to Help
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}