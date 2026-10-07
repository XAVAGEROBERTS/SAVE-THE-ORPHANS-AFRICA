import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";

interface ProgramCardProps {
  program: {
    id: string;
    slug: string;
    title: string;
    description: string;
    image: string;
    icon: string;
    color: string;
    impactStats: { label: string; value: string }[];
  };
}

export function ProgramCard({ program }: ProgramCardProps) {
  const IconComponent = (Icons as any)[program.icon] || Icons.Star;
  const firstStat = program.impactStats?.[0];

  return (
    <article className="card group h-full flex flex-col">
      <div className="relative h-48 overflow-hidden bg-light">
        {program.image ? (
          <Image
            src={program.image}
            alt={program.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `${program.color}20` }}
          >
            <IconComponent className="w-16 h-16" style={{ color: program.color }} />
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-xl text-dark mb-3">{program.title}</h3>
        <p className="text-dark/70 text-sm leading-relaxed mb-4 flex-1">
          {program.description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-light">
          {firstStat && (
            <div className="text-sm">
              <span className="font-bold text-primary">{firstStat.value}</span>{" "}
              <span className="text-dark/60">{firstStat.label}</span>
            </div>
          )}
          <Link
            href={`/programs/${program.slug}`}
            className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all ml-auto"
          >
            Learn More
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}