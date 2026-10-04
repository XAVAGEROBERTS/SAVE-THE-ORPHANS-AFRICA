import type { Metadata } from "next";
import { VolunteerForm } from "@/components/VolunteerForm/VolunteerForm";
import { Clock, Users, Globe, Heart } from "lucide-react";

export const metadata: Metadata = { title: "Volunteer" };

const benefits = [
  { icon: Heart, title: "Make a Direct Impact", description: "Work hands-on with children." },
  { icon: Users, title: "Join a Community", description: "Connect with like-minded people." },
  { icon: Globe, title: "Gain Experience", description: "Develop new skills internationally." },
  { icon: Clock, title: "Flexible Opportunities", description: "Short-term, long-term, and remote roles." },
];

export default function VolunteerPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">Get Involved</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">Become a Volunteer</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Give your time and skills to transform children's lives.
          </p>
        </div>
      </section>

      <section className="section-padding bg-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((b) => (
              <div key={b.title} className="card p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <b.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-dark/60 text-sm">{b.description}</p>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="section-title">Volunteer Application</h2>
            </div>
            <VolunteerForm />
          </div>
        </div>
      </section>
    </>
  );
}