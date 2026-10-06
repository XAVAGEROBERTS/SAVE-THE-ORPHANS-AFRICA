// src/app/(public)/donate/page.tsx
import type { Metadata } from "next";
import { DonationForm } from "@/components/DonationForm/DonationForm";
import { Shield, Heart, Users } from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://save-the-orphans-africa.vercel.app";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Donate to Save the Orphans Africa. Your gift provides food, education, healthcare, and a safe home for vulnerable children. 85% of every donation goes directly to programs.",
  alternates: { canonical: "/donate" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/donate`,
    title: "Donate | Save the Orphans Africa",
    description:
      "Every donation feeds, shelters, and educates an orphaned child. Give once or monthly — 85% goes directly to programs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Donate to Save the Orphans Africa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Donate | Save the Orphans Africa",
    description:
      "Every donation feeds, shelters, and educates an orphaned child.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

interface Props {
  searchParams: Promise<{
    amount?: string;
    program?: string;
    frequency?: string;
    source?: string;
    label?: string;
  }>;
}

export default async function DonatePage({ searchParams }: Props) {
  const params = await searchParams;

  // Parse URL params
  const amount = params.amount ? Number(params.amount) : undefined;
  const program = params.program || undefined;
  const frequency: "one-time" | "monthly" =
    params.frequency === "monthly" ? "monthly" : "one-time";
  const isSponsor = params.source === "sponsor";
  const label = params.label || (program ? program.replace(/-/g, " ") : "");

  return (
    <>
      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">
            {isSponsor ? "Sponsor a Child" : "Make a Difference"}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">
            {isSponsor ? "Become a Sponsor" : "Donate Today"}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {isSponsor
              ? "Your monthly sponsorship provides ongoing support for a child's care and development."
              : "Your generosity provides vulnerable children with food, education, healthcare, and a safe place to call home."}
          </p>
        </div>
      </section>

      <section className="section-padding bg-light">
        <div className="container-custom">
          {/* Sponsor banner */}
          {isSponsor && amount && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-gold/20 border-2 border-gold rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Heart
                    className="w-6 h-6 text-gold-dark shrink-0 mt-0.5"
                    fill="currentColor"
                  />
                  <div>
                    <h3 className="font-bold text-dark mb-1">
                      Sponsoring: <span className="capitalize">{label}</span>
                    </h3>
                    <p className="text-sm text-dark/70">
                      Monthly sponsorship of{" "}
                      <span className="font-bold text-primary">${amount}</span> —
                      your commitment provides ongoing support for this cause.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DonationForm
                defaultAmount={amount}
                defaultProgram={program}
                defaultFrequency={frequency}
                isSponsor={isSponsor}
              />
            </div>
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-lg mb-4">
                  Why Your Donation Matters
                </h3>
                <ul className="space-y-4">
                  {[
                    {
                      icon: Heart,
                      text: "85% of funds go directly to programs",
                    },
                    {
                      icon: Shield,
                      text: "Secure, encrypted payment processing",
                    },
                    {
                      icon: Users,
                      text: "Your gift transforms children's lives",
                    },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-3">
                      <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-dark/70">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-6 bg-cream">
                <h3 className="font-bold text-lg mb-4">Other Ways to Give</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <strong>Mobile Money:</strong>
                    <br />
                    <span className="text-dark/60">+256 765 673 373</span>
                  </li>
                  <li>
                    <strong>Bank Transfer:</strong>
                    <br />
                    <span className="text-dark/60">Details on request</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}