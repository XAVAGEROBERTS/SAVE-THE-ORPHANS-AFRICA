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

export default async function HomePage() {
  const programs = await getPrograms();
  const stories = await getStories();
  const team = await getTeamMembers();
  const impactStats = await getImpactStats();

  return (
    <>
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