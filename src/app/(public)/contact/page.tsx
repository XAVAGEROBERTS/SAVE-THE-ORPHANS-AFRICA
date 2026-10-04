import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm/ContactForm";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Contact Us" };

const contactInfo = [
  { icon: MapPin, title: "Visit Us", lines: ["123 Hope Street", "Nairobi, Kenya"] },
  { icon: Phone, title: "Call Us", lines: ["+254 700 000 000"], href: "tel:+254700000000" },
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
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255282.35853743783!2d36.68258345!3d-1.30286035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
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
                  WhatsApp: <a href="https://wa.me/254700000000" className="text-primary font-semibold" target="_blank" rel="noopener noreferrer">+254 700 000 000</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}