"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { createClient } from "@/lib/supabase/client";

interface TestimonialItem {
  id: string;
  quote: string;
  author_name: string;
  author_role: string;
  author_image_url: string | null;
}

export function Testimonial() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Failed to load testimonials:", error.message);
      }
      if (data) setItems(data as TestimonialItem[]);
      setIsLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (isLoading || items.length === 0) return null;

  const next = () => setCurrent((p) => (p + 1) % items.length);
  const prev = () => setCurrent((p) => (p - 1 + items.length) % items.length);

  return (
    <section className="py-14 md:py-20 bg-[#0B3D2E]">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <Quote className="w-10 h-10 text-gold mx-auto mb-4" />

          <div className="relative min-h-[200px]">
            {items.map((t, i) => (
              <div
                key={t.id}
                className={cn(
                  "transition-opacity duration-500 absolute inset-0 flex flex-col items-center justify-center",
                  i === current ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              >
                {t.author_image_url && (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden relative bg-white/10 ring-4 ring-gold/40 shadow-xl mb-4">
                    <Image
                      src={t.author_image_url}
                      alt={t.author_name}
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                  </div>
                )}

                <p className="text-lg md:text-xl text-white/90 leading-relaxed italic mb-4 max-w-2xl">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div>
                  <p className="font-bold text-gold text-base">
                    {t.author_name}
                  </p>
                  {t.author_role && (
                    <p className="text-white/60 text-xs">
                      {t.author_role}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === current ? "bg-gold" : "bg-white/30"
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}