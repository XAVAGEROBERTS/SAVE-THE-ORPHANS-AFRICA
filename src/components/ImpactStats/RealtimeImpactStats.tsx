"use client";

import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import * as Icons from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useCountUp } from "@/hooks/useCountUp";

interface ImpactStat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
  icon: string;
  display_order: number;
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

export function RealtimeImpactStats({
  initialStats,
}: {
  initialStats: ImpactStat[];
}) {
  const { data: stats } = useRealtimeTable<ImpactStat>({
    table: "impact_stats",
    initialData: initialStats,
    orderBy: { column: "display_order", ascending: true },
  });

  return (
    <section className="section-padding bg-light">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title flex items-center justify-center gap-3">
            Our Impact
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </h2>
          <p className="section-subtitle">
            Real numbers. Real change. Every statistic represents a child whose
            life has been transformed.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}