"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://picsum.photos/1920/1080?random=100"
          alt="Children at Save the Orphans Africa"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B3D2E]/95 via-[#0B3D2E]/75 to-[#0B3D2E]/40" />
      </div>

      <div className="container-custom relative z-10 pt-32 pb-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Heart className="w-4 h-4" fill="currentColor" />
            Making a difference since 2015
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Every Child Deserves a Safe Place to Call Home
          </h1>

          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl">
            Save the Orphans Africa is committed to providing vulnerable children
            with care, education, protection, healthcare, and opportunities for
            a brighter future.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/donate" className="btn-secondary text-lg px-8 py-4">
              <Heart className="w-5 h-5" fill="currentColor" />
              Donate Now
            </Link>
            <Link href="/volunteer" className="btn-outline text-lg px-8 py-4">
              Become a Volunteer
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-6 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span>150+ Children Supported</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span>100% Transparency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span>Registered Nonprofit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}