"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";

const LOGO_URL =
  process.env.NEXT_PUBLIC_SITE_LOGO_URL ||
  "https://mkzqskurodstcmzlevte.supabase.co/storage/v1/object/public/site-images/logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Our Team" },
  { href: "/programs", label: "Programs" },
  { href: "/impact", label: "Impact" },
  { href: "/stories", label: "Stories" },
  { href: "/gallery", label: "Gallery" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const pathname = usePathname();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const shouldHide = isHidden && !isOpen;

  return (
    <>
      {/* Announcement bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0B3D2E] text-white text-center text-xs sm:text-sm py-2.5 px-4">
        <p>
          🌟 Every child deserves a safe place to call home.{" "}
          <Link
            href="/donate"
            className="underline font-semibold hover:text-gold transition-colors"
          >
            Donate today
          </Link>
        </p>
      </div>

      {/* MOBILE — full-width top bar */}
      <header
        className={cn(
          "lg:hidden fixed top-[42px] left-0 right-0 z-50 bg-white border-b border-black/5 shadow-sm transition-transform duration-300",
          shouldHide ? "-translate-y-[60px]" : "translate-y-0"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden relative bg-primary shrink-0">
              <Image
                src={LOGO_URL}
                alt="Save the Orphans Africa"
                fill
                className="object-cover"
                sizes="32px"
                unoptimized
              />
            </div>
            <div>
              <span className="font-bold text-primary text-sm leading-tight block">
                Save the Orphans
              </span>
              <span className="text-[10px] text-gold font-semibold tracking-wider leading-none">
                AFRICA
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-dark hover:bg-primary/10 transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* DESKTOP — floating pill */}
      <header
        className={cn(
          "hidden lg:flex fixed top-8 left-0 right-0 z-50 px-4 justify-center pointer-events-none",
          "transition-all duration-300 ease-out",
          shouldHide
            ? "-translate-y-24 opacity-0"
            : "translate-y-0 opacity-100"
        )}
      >
        <nav
          className={cn(
            "pointer-events-auto rounded-full",
            "flex items-center gap-1 pl-3 pr-2 py-2",
            "max-w-full",
            "bg-[#FFF9EF]/95 backdrop-blur-lg border border-primary/15",
            "shadow-[0_8px_24px_-8px_rgba(11,61,46,0.25)]"
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 px-2 py-1"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden relative bg-primary shrink-0">
              <Image
                src={LOGO_URL}
                alt="Save the Orphans Africa"
                fill
                className="object-cover"
                sizes="36px"
                unoptimized
              />
            </div>
            <div>
              <span className="font-bold text-[15px] leading-tight block whitespace-nowrap text-primary-dark">
                Save the Orphans
              </span>
              <span className="text-[11px] text-gold-dark font-semibold tracking-wider leading-none">
                AFRICA
              </span>
            </div>
          </Link>

          <div className="w-px h-6 mx-1.5 bg-primary/15" />

          <div className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "text-white bg-primary"
                      : "text-primary-dark/75 hover:text-primary-dark hover:bg-primary/8"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="w-px h-6 mx-1.5 bg-primary/15" />

          <div className="flex items-center gap-1.5 pl-1 pr-1">
            <Link
              href="/volunteer"
              className="px-3 py-2 rounded-full text-[13px] font-semibold text-primary-dark hover:bg-primary/10 transition-colors whitespace-nowrap"
            >
              Volunteer
            </Link>
            <Link
              href="/donate"
              className="px-4 py-2 rounded-full text-[13px] font-semibold bg-primary text-white hover:bg-primary-dark transition-colors whitespace-nowrap shadow-sm"
            >
              Donate
            </Link>
          </div>
        </nav>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-all duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsOpen(false)}
        />

        <div
          className={cn(
            "absolute top-[98px] bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl overflow-y-auto transition-transform duration-300",
            isOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div className="p-5">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-3.5 rounded-2xl text-[16px] font-medium transition-colors",
                      isActive
                        ? "text-white bg-primary"
                        : "text-dark/80 hover:bg-primary/10"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 pt-5 border-t border-light flex flex-col gap-3">
              <Link
                href="/volunteer"
                className="text-center px-4 py-3 rounded-2xl text-[15px] font-semibold text-primary border-2 border-primary hover:bg-primary hover:text-white transition-colors"
              >
                Become a Volunteer
              </Link>
              <Link
                href="/donate"
                className="text-center px-4 py-3 rounded-2xl text-[15px] font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                Donate Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}