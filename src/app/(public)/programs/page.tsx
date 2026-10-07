import type { Metadata } from "next";
import Link from "next/link";
import { RealtimeProgramsGrid } from "@/components/ProgramCard/RealtimeProgramsGrid";
import { getPrograms } from "@/lib/supabase/queries";

export const metadata: Metadata = { title: "Our Programs" };
export const revalidate = 60;

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <>
      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">
            What We Do
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">
            Our Programs
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Comprehensive support that addresses every aspect of a child&apos;s
            development.
          </p>
        </div>
      </section>

      <section className="section-padding bg-light">
        <div className="container-custom">
          <RealtimeProgramsGrid initialPrograms={programs} />
        </div>
      </section>

      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Support a Program Today
          </h2>
          <Link
            href="/donate"
            className="btn-secondary text-lg px-8 py-4 mt-6 inline-flex"
          >
            Donate Now
          </Link>
        </div>
      </section>
    </>
  );
}