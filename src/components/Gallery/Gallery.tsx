"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

interface GalleryRow {
  id: string;
  image_url: string;
  alt_text: string | null;
  category: string | null;
  is_published: boolean;
  display_order: number | null;
}

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
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: rows, isLoading } = useRealtimeTable<GalleryRow>({
    table: "gallery_images",
    orderBy: { column: "display_order", ascending: true },
    filter: { column: "is_published", value: true },
  });

  // Client-side filter for realtime inserts/updates that ignore our filter
  const images: GalleryImage[] = (rows || [])
    .filter((row) => row.is_published !== false)
    .map((row) => ({
      id: row.id,
      src: row.image_url,
      alt: row.alt_text || "",
      category: row.category || "Uncategorized",
    }));

  const categories = [
    "All",
    ...Array.from(new Set(images.map((i) => i.category))),
  ];

  const filtered =
    activeCategory === "All"
      ? images
      : images.filter((img) => img.category === activeCategory);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-light animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dark/60">No gallery images yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeCategory === cat
                ? "bg-primary text-white"
                : "bg-light text-dark hover:bg-primary/10"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(img.src)}
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage}
              alt=""
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
