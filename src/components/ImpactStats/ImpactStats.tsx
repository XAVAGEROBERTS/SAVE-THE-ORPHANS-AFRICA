"use client";

import { useEffect, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";
import { createClient } from "@/lib/supabase/client";
import * as Icons from "lucide-react";

interface ImpactStat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
  icon: string;
}

function StatCard({ stat }: { stat: ImpactStat }) {
  const { ref, isVisible } = useScrollAnimation();
  const count = useCountUp(stat.value, 2000, isVisible);
  const IconComponent = (Icons as any)[stat.icon] || Icons.Star;

  return (
    <div ref={ref} className="text-center p-6">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <IconComponent className="w-7 h-7 text-primary" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
        {count}
        {stat.suffix}
      </div>
      <div className="font-semibold text-dark mb-1">{stat.label}</div>
      <p className="text-sm text-dark/60">{stat.description}</p>
    </div>
  );
}

export function ImpactStats() {
  const [stats, setStats] = useState<ImpactStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("impact_stats")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data) {
        setStats(
          data.map((row) => ({
            id: row.id,
            value: row.value,
            suffix: row.suffix || "",
            label: row.label,
            description: row.description || "",
            icon: row.icon || "Star",
          }))
        );
      }
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <section className="section-padding bg-light">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Our Impact</h2>
          <p className="section-subtitle">
            Real numbers. Real change. Every statistic represents a child whose
            life has been transformed.
          </p>
        </div>
        {isLoading ? (
          <p className="text-center text-dark/60">Loading...</p>
        ) : stats.length === 0 ? (
          <p className="text-center text-dark/60">No statistics available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}