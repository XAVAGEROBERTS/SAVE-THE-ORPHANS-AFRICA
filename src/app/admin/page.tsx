"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Mail,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  messages: number;
  volunteers: number;
  subscribers: number;
  donations: number;
  donationsTotal: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    messages: 0,
    volunteers: 0,
    subscribers: 0,
    donations: 0,
    donationsTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const [messages, volunteers, subscribers, donations] = await Promise.all([
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("volunteer_applications").select("id", { count: "exact", head: true }),
        supabase.from("subscribers").select("id", { count: "exact", head: true }),
        supabase.from("donations").select("amount, status"),
      ]);

      const completedDonations = (donations.data || []).filter(
        (d) => d.status === "completed"
      );
      const donationsTotal = completedDonations.reduce(
        (sum, d) => sum + (Number(d.amount) || 0),
        0
      );

      setStats({
        messages: messages.count || 0,
        volunteers: volunteers.count || 0,
        subscribers: subscribers.count || 0,
        donations: completedDonations.length,
        donationsTotal,
      });
      setIsLoading(false);
    }

    load();

    // Realtime subscriptions for each table
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "volunteer_applications" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscribers" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cards = [
    {
      label: "Contact Messages",
      value: stats.messages,
      icon: MessageSquare,
      href: "/admin/messages",
      color: "bg-blue-500",
    },
    {
      label: "Volunteer Applications",
      value: stats.volunteers,
      icon: Users,
      href: "/admin/volunteers",
      color: "bg-purple-500",
    },
    {
      label: "Newsletter Subscribers",
      value: stats.subscribers,
      icon: Mail,
      href: "/admin/subscribers",
      color: "bg-gold",
    },
    {
      label: "Completed Donations",
      value: stats.donations,
      icon: DollarSign,
      href: "/admin/donations",
      color: "bg-primary",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
          Dashboard
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
        </h1>
        <p className="text-dark/60 mt-1">
          Overview of everything happening on your website
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="card p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-dark/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-3xl font-bold text-dark mb-1">
              {isLoading ? "—" : card.value}
            </div>
            <div className="text-sm text-dark/60">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="card p-6 mb-8 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-gold" />
              <span className="text-sm text-white/70">Total Donations Received</span>
            </div>
            <div className="text-4xl font-bold">
              {isLoading
                ? "—"
                : `$${stats.donationsTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}`}
            </div>
          </div>
          <DollarSign className="w-16 h-16 text-white/20" />
        </div>
      </div>
    </div>
  );
}