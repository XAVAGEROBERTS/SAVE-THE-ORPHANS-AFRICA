import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/utils/format";

interface StoryCardProps {
  story: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    date: string;
    category: string;
  };
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <article className="card group h-full flex flex-col">
      <div className="relative h-48 overflow-hidden bg-light">
        {story.image ? (
          <Image
            src={story.image}
            alt={story.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-primary/10" />
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-gold text-dark text-xs font-semibold px-3 py-1 rounded-full">
            {story.category}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs text-dark/50 mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <time dateTime={story.date}>{formatDate(story.date)}</time>
        </div>
        <h3 className="font-bold text-lg text-dark mb-3 line-clamp-2">{story.title}</h3>
        <p className="text-dark/70 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {story.excerpt}
        </p>
        <Link
          href={`/stories/${story.slug}`}
          className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all"
        >
          Read More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}