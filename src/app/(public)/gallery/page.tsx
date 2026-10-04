import type { Metadata } from "next";
import { Gallery } from "@/components/Gallery/Gallery";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">Our Community</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">Gallery</h1>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <Gallery />
        </div>
      </section>
    </>
  );
}