import type { Metadata } from "next";
import Link from "next/link";
import { Heart, HandHeart, Building, Megaphone, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Get Involved" };

const options = [
  { icon: Heart, title: "Donate", description: "Your financial support provides essential resources.", href: "/donate", cta: "Donate Now", color: "bg-primary" },
  { icon: HandHeart, title: "Volunteer", description: "Give your time and skills.", href: "/volunteer", cta: "Become a Volunteer", color: "bg-gold" },
  { icon: Users, title: "Sponsor a Child", description: "Provide ongoing support for a child.", href: "/sponsor", cta: "Sponsor a Child", color: "bg-[#2A8B5E]" },
  { icon: Building, title: "Partner With Us", description: "Create lasting change together.", href: "/contact", cta: "Partner With Us", color: "bg-[#0B3D2E]" },
  { icon: Megaphone, title: "Fundraise", description: "Start a campaign and rally your community.", href: "/contact", cta: "Start a Campaign", color: "bg-[#D99E2B]" },
];

export default function GetInvolvedPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">Make a Difference</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">Get Involved</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            There are many ways to support our mission. Find the one that's right for you.
          </p>
        </div>
      </section>

      <section className="section-padding bg-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.map((o) => (
              <div key={o.title} className="card p-8 flex flex-col">
                <div className={`w-16 h-16 rounded-full ${o.color} flex items-center justify-center mb-6`}>
                  <o.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3">{o.title}</h3>
                <p className="text-dark/70 text-sm leading-relaxed mb-6 flex-1">{o.description}</p>
                <Link href={o.href} className="btn-primary w-full">
                  {o.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}