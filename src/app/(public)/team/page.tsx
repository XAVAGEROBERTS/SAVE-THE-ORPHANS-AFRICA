import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Users } from "lucide-react";
import { createStaticClient } from "@/lib/supabase/static";
import { RealtimeTeamGrid } from "@/components/Team/RealtimeTeamGrid";

export const metadata: Metadata = {
  title: "Meet Our Team",
  description:
    "Meet the founders and team members behind Save the Orphans Africa. Real people, real commitment to vulnerable children.",
};

export const revalidate = 300;

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  is_founder: boolean;
  display_order: number;
}

async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_published", true)
    .order("is_founder", { ascending: false })
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Failed to load team:", error.message);
    return [];
  }
  return data || [];
}

export default async function TeamPage() {
  const members = await getTeamMembers();
  const founders = members.filter((m) => m.is_founder);
  const others = members.filter((m) => !m.is_founder);

  return (
    <>
      <section className="relative pt-32 pb-16 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">
            The People Behind Our Mission
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">
            Meet Our Team
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Real people. Real commitment. Every member of our team is dedicated
            to protecting and empowering vulnerable children.
          </p>
        </div>
      </section>

      <section className="py-12 bg-cream">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <Heart
              className="w-10 h-10 text-primary mx-auto mb-4"
              fill="currentColor"
            />
            <p className="text-lg text-dark/80 leading-relaxed">
              We believe transparency is the foundation of trust. Our team is
              accountable to our donors, our community, and most importantly,
              to the children we serve.
            </p>
          </div>
        </div>
      </section>

      {founders.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Founders</h2>
              <p className="section-subtitle">
                The visionaries who started Save the Orphans Africa.
              </p>
            </div>
            <RealtimeTeamGrid initialMembers={founders} />
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="section-padding bg-light">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-title">Our Team</h2>
              <p className="section-subtitle">
                Dedicated staff and volunteers who make our work possible.
              </p>
            </div>
            <RealtimeTeamGrid initialMembers={others} />
          </div>
        </section>
      )}

      {members.length === 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom text-center py-12">
            <Users className="w-16 h-16 text-dark/20 mx-auto mb-4" />
            <p className="text-dark/60">Team information coming soon.</p>
          </div>
        </section>
      )}

      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Donors Worldwide
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Every donation is handled with integrity. Every child is protected.
            Every action is transparent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donate" className="btn-secondary text-lg px-8 py-4">
              <Heart className="w-5 h-5" fill="currentColor" />
              Donate Now
            </Link>
            <Link href="/contact" className="btn-outline text-lg px-8 py-4">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}