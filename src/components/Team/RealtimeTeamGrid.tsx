"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Linkedin, Users, ArrowRight } from "lucide-react";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  is_founder: boolean;
  display_order: number;
}

export function RealtimeTeamGrid({
  initialMembers,
  limit,
  showCTA = false,
}: {
  initialMembers: TeamMember[];
  limit?: number;
  showCTA?: boolean;
}) {
  const { data: members } = useRealtimeTable<TeamMember>({
    table: "team_members",
    initialData: initialMembers,
    orderBy: { column: "display_order", ascending: true },
  });

  const displayed = limit ? members.slice(0, limit) : members;

  if (displayed.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {displayed.map((member) => (
          <div
            key={member.id}
            className="card overflow-hidden text-center group"
          >
            <div className="relative aspect-square bg-light">
              {member.image_url ? (
                <Image
                  src={member.image_url}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <Users className="w-16 h-16 text-primary/40" />
                </div>
              )}
              {member.is_founder && (
                <div className="absolute top-3 right-3 bg-gold text-dark text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Founder
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-dark mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-primary font-semibold mb-3">
                {member.role}
              </p>
              <p className="text-sm text-dark/70 leading-relaxed line-clamp-3">
                {member.bio}
              </p>

              {(member.email || member.linkedin_url) && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-light justify-center">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="w-9 h-9 rounded-full bg-light flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-light flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCTA && (
        <div className="text-center mt-10">
          <Link href="/team" className="btn-primary">
            Meet the Full Team
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}