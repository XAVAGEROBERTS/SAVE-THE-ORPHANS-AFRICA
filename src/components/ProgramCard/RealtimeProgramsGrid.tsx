"use client";

import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { ProgramCard } from "./ProgramCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProgramRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description: string;
  image_url: string;
  icon: string;
  color: string;
  objectives: string[];
  impact_stats: { label: string; value: string }[];
  display_order: number;
  is_published: boolean;
}

interface ProgramCardShape {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  color: string;
  impactStats: { label: string; value: string }[];
}

export function RealtimeProgramsGrid({
  initialPrograms,
  limit,
  showCTA = false,
}: {
  initialPrograms: ProgramCardShape[];
  limit?: number;
  showCTA?: boolean;
}) {
  // Map to the DB row shape for realtime
  const initialRows: ProgramRow[] = initialPrograms.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    long_description: "",
    image_url: p.image,
    icon: p.icon,
    color: p.color,
    objectives: [],
    impact_stats: p.impactStats || [],
    display_order: 0,
    is_published: true,
  }));

  const { data: rows } = useRealtimeTable<ProgramRow>({
    table: "programs",
    initialData: initialRows,
    orderBy: { column: "display_order", ascending: true },
  });

  // Filter only published, then map to card shape
  const programs: ProgramCardShape[] = rows
    .filter((r) => r.is_published !== false)
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      image: r.image_url || "",
      icon: r.icon || "Star",
      color: r.color || "#176B45",
      impactStats: r.impact_stats || [],
    }));

  const displayed = limit ? programs.slice(0, limit) : programs;

  if (displayed.length === 0) {
    return <p className="text-center text-dark/60">No programs yet.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayed.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
      {showCTA && (
        <div className="text-center mt-10">
          <Link href="/programs" className="btn-primary">
            View All Programs
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </>
  );
}