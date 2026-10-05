import Link from "next/link";
import { Heart, Mail, Phone, MapPin, Globe, MessageCircle, Share2, Send, Video } from "lucide-react";
import { NewsletterForm } from "@/components/Newsletter/NewsletterForm";

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/programs", label: "Programs" },
  { href: "/impact", label: "Impact" },
  { href: "/stories", label: "Stories & News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const getInvolvedLinks = [
  { href: "/donate", label: "Donate" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/sponsor", label: "Sponsor a Child" },
  { href: "/get-involved", label: "Partner With Us" },
  { href: "/get-involved", label: "Fundraise" },
];

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: Globe },
  { href: "https://twitter.com", label: "Twitter", icon: MessageCircle },
  { href: "https://instagram.com", label: "Instagram", icon: Share2 },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Send },
  { href: "https://youtube.com", label: "YouTube", icon: Video },
];

export function Footer() {
  return (
    <footer className="bg-[#0B3D2E] text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#0B3D2E]" fill="currentColor" />
              </div>
              <div>
                <span className="font-bold text-white text-lg leading-tight block">
                  Save the Orphans
                </span>
                <span className="text-xs text-gold font-semibold tracking-wider">
                  AFRICA
                </span>
              </div>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Providing vulnerable and orphaned children with a safe, loving
              environment where they can grow, learn, and build a better future.
            </p>

            <div className="mb-6">
              <h4 className="text-gold font-semibold mb-3 text-sm">
                Subscribe to Our Newsletter
              </h4>
              <NewsletterForm />
            </div>

            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-[#0B3D2E] transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/70 hover:text-gold text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="font-semibold text-gold mb-4">Get Involved</h3>
            <ul className="space-y-2.5">
              {getInvolvedLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/70 hover:text-gold text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span className="text-white/70 text-sm">
                  123 Hope Street, Kampala, Uganda
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <a href="tel:+256700000000" className="text-white/70 hover:text-gold text-sm">
                  +256 700 000 000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <a
                  href="mailto:info@savetheorphansafrica.org"
                  className="text-white/70 hover:text-gold text-sm"
                >
                  info@savetheorphansafrica.org
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <Link href="/donate" className="btn-secondary w-full text-sm">
                Donate Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} Save the Orphans Africa. All Rights Reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/privacy-policy" className="text-white/50 hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/50 hover:text-gold transition-colors">
                Terms of Use
              </Link>
              <Link href="/child-safeguarding" className="text-white/50 hover:text-gold transition-colors">
                Child Safeguarding
              </Link>
              <Link href="/donation-policy" className="text-white/50 hover:text-gold transition-colors">
                Donation Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}