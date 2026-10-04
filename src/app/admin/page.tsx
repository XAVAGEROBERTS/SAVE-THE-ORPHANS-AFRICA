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
    async function load() {
      const supabase = createClient();

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
        <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
        <p className="text-dark/60 mt-1">
          Overview of everything happening on your website
        </p>
      </div>

      {/* Stats Grid */}
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

      {/* Donations Total */}
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

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-dark mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/messages"
            className="p-4 rounded-lg border border-light hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-primary mb-2" />
            <div className="font-semibold text-dark text-sm">View Messages</div>
            <div className="text-xs text-dark/60">Contact form submissions</div>
          </Link>
          <Link
            href="/admin/volunteers"
            className="p-4 rounded-lg border border-light hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Users className="w-6 h-6 text-primary mb-2" />
            <div className="font-semibold text-dark text-sm">Review Volunteers</div>
            <div className="text-xs text-dark/60">Applications waiting</div>
          </Link>
          <Link
            href="/admin/donations"
            className="p-4 rounded-lg border border-light hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <DollarSign className="w-6 h-6 text-primary mb-2" />
            <div className="font-semibold text-dark text-sm">View Donations</div>
            <div className="text-xs text-dark/60">All transactions</div>
          </Link>
        </div>
      </div>
    </div>
  );
}