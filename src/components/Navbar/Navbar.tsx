"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";
import { cn } from "@/utils/cn";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
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
      {/* Announcement bar — deep green, always at top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0B3D2E] text-white text-center text-sm sm:text-[15px] py-2.5 px-4">
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

      {/* Floating Pill Navbar — cream/green tinted, not stark white */}
      <header
        className={cn(
          "fixed top-8 sm:top-9 left-0 right-0 z-50 px-3 sm:px-4 flex justify-center pointer-events-none",
          "transition-all duration-300 ease-out",
          shouldHide
            ? "-translate-y-24 opacity-0"
            : "translate-y-0 opacity-100"
        )}
      >
        <nav
          className={cn(
            "pointer-events-auto rounded-full transition-shadow duration-300",
            "flex items-center gap-1 pl-3 pr-2 py-2",
            "max-w-full",
            // Cream background with green border tint — blends with brand
            "bg-[#FFF9EF]/95 backdrop-blur-lg",
            "border border-primary/15",
            "shadow-[0_8px_24px_-8px_rgba(11,61,46,0.25)]"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 px-2 py-1">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
              <Heart className="w-4.5 h-4.5 md:w-5 md:h-5 text-white" fill="currentColor" />
            </div>
            <div className="hidden md:block">
              <span className="font-bold text-[15px] md:text-base leading-tight block whitespace-nowrap text-primary-dark">
                Save the Orphans
              </span>
              <span className="text-[11px] text-gold-dark font-semibold tracking-wider leading-none">
                AFRICA
              </span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden lg:block w-px h-6 mx-1.5 bg-primary/15" />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
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
                    "px-3.5 py-2 rounded-full text-[14px] font-medium transition-colors whitespace-nowrap",
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

          {/* Divider */}
          <div className="hidden lg:block w-px h-6 mx-1.5 bg-primary/15" />

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2 pl-1 pr-1">
            <Link
              href="/volunteer"
              className="px-3.5 py-2 rounded-full text-[14px] font-semibold text-primary-dark hover:bg-primary/10 transition-colors whitespace-nowrap"
            >
              Volunteer
            </Link>
            <Link
              href="/donate"
              className="px-4 py-2 rounded-full text-[14px] font-semibold bg-primary text-white hover:bg-primary-dark transition-colors whitespace-nowrap shadow-sm"
            >
              Donate
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-full transition-colors ml-1 text-primary-dark hover:bg-primary/10"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
      </header>

      {/* Mobile Drawer — slides in from right */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 right-0 w-full sm:w-96 bg-[#FFF9EF] z-40 transition-transform duration-300 overflow-y-auto shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-8" />

        <div className="flex flex-col h-full p-6">
          {/* Logo in drawer */}
          <div className="flex items-center gap-2.5 mb-6 pb-6 border-b border-primary/15">
            <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center">
              <Heart className="w-5.5 h-5.5 text-white" fill="currentColor" />
            </div>
            <div>
              <span className="font-bold text-primary-dark text-lg leading-tight block">
                Save the Orphans
              </span>
              <span className="text-xs text-gold-dark font-semibold tracking-wider">
                AFRICA
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-1 flex-1">
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
                    "px-4 py-3 rounded-2xl text-[16px] font-medium transition-colors",
                    isActive
                      ? "text-white bg-primary"
                      : "text-primary-dark/80 hover:bg-primary/10"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="mt-6 pt-6 border-t border-primary/15 flex flex-col gap-3">
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

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}