import type { Metadata } from "next";
import Link from "next/link";
import { ImpactStats } from "@/components/ImpactStats/ImpactStats";
import { Heart, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Our Impact" };

export default function ImpactPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">Measuring Change</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">Our Impact</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            We believe in transparency and accountability. Here's the measurable difference your support makes.
          </p>
        </div>
      </section>

      <ImpactStats />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">What Your Donation Accomplishes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { amount: "$25", impact: "Provides school supplies for a child" },
              { amount: "$50", impact: "Covers healthcare for a month" },
              { amount: "$100", impact: "Feeds a child for three months" },
            ].map((item) => (
              <div key={item.amount} className="card p-8 text-center">
                <div className="text-4xl font-bold text-primary mb-3">{item.amount}</div>
                <h3 className="font-semibold text-lg">{item.impact}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Help Us Reach More Children</h2>
          <Link href="/donate" className="btn-secondary text-lg px-8 py-4 mt-6 inline-flex">
            Donate Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}