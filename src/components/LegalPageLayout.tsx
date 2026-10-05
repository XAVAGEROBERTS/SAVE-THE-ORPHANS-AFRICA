import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <>
      <section className="relative pt-32 pb-16 bg-[#0B3D2E]">
        <div className="container-custom relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-gold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-white/60 text-sm">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <article className="prose prose-lg max-w-3xl mx-auto">
            {children}
          </article>
        </div>
      </section>
    </>
  );
}