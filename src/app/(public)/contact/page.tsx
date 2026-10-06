import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm/ContactForm";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Contact Us" };

const contactInfo = [
  { icon: MapPin, title: "Visit Us", lines: ["Kampala", "Uganda"] },
  { icon: Phone, title: "Call Us", lines: ["+256 765 673 373"], href: "tel:+256765673373" },
  { icon: Mail, title: "Email Us", lines: ["info@savetheorphansafrica.org"], href: "mailto:info@savetheorphansafrica.org" },
  { icon: Clock, title: "Office Hours", lines: ["Mon - Fri: 8AM - 5PM"] },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative pt-32 pb-20 bg-[#0B3D2E]">
        <div className="container-custom relative z-10 text-center">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase">Get in Touch</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-2 mb-4">Contact Us</h1>
        </div>
      </section>

      <section className="section-padding bg-light">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info) => (
              <div key={info.title} className="card p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <info.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{info.title}</h3>
                {info.lines.map((line, i) => (
                  <p key={i} className="text-dark/60 text-sm">
                    {info.href ? <a href={info.href} className="hover:text-primary">{line}</a> : line}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="section-title mb-6">Send Us a Message</h2>
              <ContactForm />
            </div>
            <div>
              <h2 className="section-title mb-6">Find Us</h2>
              <div className="card overflow-hidden h-[400px] min-h-[400px]">
                <iframe
                  src="https://www.google.com/maps?q=Kampala,Uganda&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Location"
                />
              </div>
              <div className="mt-6 flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <p className="text-sm text-dark/70">
                  WhatsApp: <a href="https://wa.me/256765673373" className="text-primary font-semibold" target="_blank" rel="noopener noreferrer">+256 765 673 373</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}