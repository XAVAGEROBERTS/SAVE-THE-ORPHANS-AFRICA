import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Check, Heart, ArrowRight } from "lucide-react";
import { getPrograms, getProgramBySlug } from "@/lib/supabase/queries";
import * as Icons from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Program Not Found" };
  return {
    title: program.title,
    description: program.description,
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  const IconComponent = (Icons as any)[program.icon] || Icons.Star;
  const allPrograms = await getPrograms();
  const otherPrograms = allPrograms.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 text-white/70 hover:text-gold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Programs
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <IconComponent className="w-8 h-8" style={{ color: program.color }} />
            </div>
            <span className="text-gold font-semibold text-sm tracking-wider uppercase">
              Our Programs
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {program.title}
          </h1>
          <p className="text-lg text-white/70 max-w-3xl">{program.description}</p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {program.image && (
                <div className="rounded-2xl overflow-hidden aspect-[16/9] relative">
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    unoptimized
                  />
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-dark mb-4">About This Program</h2>
                <p className="text-dark/70 leading-relaxed">{program.longDescription}</p>
              </div>

              {program.objectives.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-dark mb-6">Our Objectives</h2>
                  <ul className="space-y-3">
                    {program.objectives.map((obj: string) => (
                      <li key={obj} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-dark/80 leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {program.impactStats.length > 0 && (
                <div className="bg-light rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-dark mb-6">Program Impact</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {program.impactStats.map((stat: any) => (
                      <div key={stat.label} className="text-center p-6 bg-white rounded-xl">
                        <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                          {stat.value}
                        </div>
                        <div className="text-sm text-dark/60">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="card p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Support This Program</h3>
                <p className="text-sm text-dark/70 mb-6">
                  Your donation directly supports our {program.title.toLowerCase()} program.
                </p>
                <Link href="/donate" className="btn-primary w-full">
                  <Heart className="w-5 h-5" fill="currentColor" />
                  Donate Now
                </Link>
                <Link href="/volunteer" className="btn-ghost w-full mt-3">
                  Volunteer Instead
                </Link>
              </div>

              {otherPrograms.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-4">Other Programs</h3>
                  <ul className="space-y-3">
                    {otherPrograms.map((p) => {
                      const OtherIcon = (Icons as any)[p.icon] || Icons.Star;
                      return (
                        <li key={p.id}>
                          <Link
                            href={`/programs/${p.slug}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-light transition-colors group"
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${p.color}20` }}
                            >
                              <OtherIcon className="w-5 h-5" style={{ color: p.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-dark group-hover:text-primary transition-colors">
                                {p.title}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-dark/40 group-hover:text-primary transition-colors" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Make a Difference Today
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">
            Your support helps us continue this vital work for vulnerable children.
          </p>
          <Link href="/donate" className="btn-secondary text-lg px-8 py-4">
            <Heart className="w-5 h-5" fill="currentColor" />
            Donate Now
          </Link>
        </div>
      </section>
    </>
  );
}