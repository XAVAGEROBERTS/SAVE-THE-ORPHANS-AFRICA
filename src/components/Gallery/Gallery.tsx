"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { createClient } from "@/lib/supabase/client";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

const defaultCategories = [
  "All",
  "Children & Education",
  "Community",
  "Events",
  "Volunteers",
  "Facilities",
  "Projects",
];

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setImages(
          data.map((row) => ({
            id: row.id,
            src: row.image_url,
            alt: row.alt_text,
            category: row.category,
          }))
        );
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const categories = ["All", ...Array.from(new Set(images.map((i) => i.category)))];

  const filtered =
    activeCategory === "All"
      ? images
      : images.filter((img) => img.category === activeCategory);

  const selectedImageData = images.find((i) => i.id === selectedImage);

  return (
    <div>
      {isLoading ? (
        <p className="text-center text-dark/60 py-12">Loading gallery...</p>
      ) : images.length === 0 ? (
        <p className="text-center text-dark/60 py-12">
          No images in the gallery yet. Check back soon!
        </p>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                  activeCategory === c
                    ? "bg-primary text-white"
                    : "bg-light text-dark/70 hover:bg-primary/10 hover:text-primary"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image.id)}
                className="relative aspect-[4/3] rounded-xl overflow-hidden group"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </>
      )}

      {selectedImageData && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full text-2xl"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="relative max-w-5xl w-full aspect-[4/3]">
            <Image
              src={selectedImageData.src}
              alt={selectedImageData.alt}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}