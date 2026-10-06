"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Shield,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";

const presetAmounts = [25, 50, 100, 250];

const donationDestinations = [
  { id: "general", title: "General Fund (Where it's needed most)" },
  { id: "education", title: "Education — School fees, uniforms, books" },
  { id: "healthcare", title: "Healthcare — Medical checkups, medication" },
  { id: "nutrition", title: "Food & Nutrition — Daily nutritious meals" },
  { id: "child-protection", title: "Accommodation — Safe housing & utilities" },
  { id: "school-supplies", title: "School Supplies — Notebooks, pens, bags" },
  { id: "general-care", title: "General Care — Clothing & essentials" },
  { id: "skills-development", title: "Skills Development — Vocational training" },
];

interface Props {
  defaultAmount?: number;
  defaultProgram?: string;
  defaultFrequency?: "one-time" | "monthly";
  isSponsor?: boolean;
}

export function DonationForm({
  defaultAmount,
  defaultProgram,
  defaultFrequency,
  isSponsor,
}: Props) {
  const initialAmount = defaultAmount && defaultAmount > 0 ? defaultAmount : 50;

  const [amount, setAmount] = useState<number>(initialAmount);
  const [customAmount, setCustomAmount] = useState<string>(
    !presetAmounts.includes(initialAmount) ? String(initialAmount) : ""
  );
  const [frequency, setFrequency] = useState<"one-time" | "monthly">(
    defaultFrequency || "one-time"
  );
  const [program, setProgram] = useState(defaultProgram || "general");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultAmount && defaultAmount > 0) {
      setAmount(defaultAmount);
      if (!presetAmounts.includes(defaultAmount)) {
        setCustomAmount(String(defaultAmount));
      } else {
        setCustomAmount("");
      }
    }
  }, [defaultAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || amount < 1) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!donorEmail || !donorEmail.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          frequency,
          program,
          donorName: donorName || "Anonymous",
          donorEmail,
        }),
      });

      let data: any;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          error: text.slice(0, 300) || `Server error (${res.status})`,
        };
      }

      if (!res.ok) {
        const errMsg =
          typeof data.error === "string"
            ? data.error
            : data.error?.message ||
              JSON.stringify(data.error) ||
              `Payment failed (${res.status})`;
        throw new Error(errMsg);
      }

      if (data.mode === "link" && data.paymentLink) {
        window.location.href = data.paymentLink;
        return;
      }

      throw new Error("Unexpected response from payment server");
    } catch (err: any) {
      console.error("Donation error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8">
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm break-words">{error}</p>
        </div>
      )}

      {isSponsor && (
        <div className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-lg">
          <p className="text-sm text-dark/80">
            <strong>Sponsorship mode:</strong> Your amount and frequency are
            pre-set. You can still adjust them below.
          </p>
        </div>
      )}

      {/* Frequency */}
      <div className="mb-6">
        <label className="form-label">Donation Frequency</label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-light rounded-lg">
          <button
            type="button"
            onClick={() => setFrequency("one-time")}
            className={cn(
              "py-2.5 rounded-md text-sm font-semibold transition-all",
              frequency === "one-time"
                ? "bg-white shadow-sm text-primary"
                : "text-dark/60"
            )}
          >
            One-Time
          </button>
          <button
            type="button"
            onClick={() => setFrequency("monthly")}
            className={cn(
              "py-2.5 rounded-md text-sm font-semibold transition-all",
              frequency === "monthly"
                ? "bg-white shadow-sm text-primary"
                : "text-dark/60"
            )}
          >
            Monthly
          </button>
        </div>
        {frequency === "monthly" && (
          <p className="text-xs text-dark/50 mt-2">
            You will receive a Mobile Money prompt each month to renew your
            gift.
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="mb-6">
        <label className="form-label">How much would you like to give?</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {presetAmounts.map((preset) => {
            const isSelected = amount === preset && customAmount === "";
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAmount(preset);
                  setCustomAmount("");
                }}
                className={cn(
                  "py-3 rounded-lg font-semibold transition-all border-2",
                  isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-light bg-white text-dark hover:border-primary/50"
                )}
              >
                ${preset}
              </button>
            );
          })}
        </div>
        <label htmlFor="custom-amount" className="form-label">
          Enter custom amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/60 font-semibold">
            $
          </span>
          <input
            id="custom-amount"
            type="number"
            min="1"
            step="1"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setAmount(Number(e.target.value) || 0);
            }}
            placeholder="0"
            className="form-input pl-8 border-2 border-dark/25 focus:border-primary rounded-lg"
          />
        </div>
        <p className="text-xs text-dark/50 mt-2">
          Shown in USD. Charged in Ugandan Shillings (UGX) at our current rate.
        </p>
      </div>

      {/* Program */}
      <div className="mb-6">
        <label htmlFor="program" className="form-label">
          Direct my donation to
        </label>
        <select
          id="program"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="form-input"
        >
          {donationDestinations.map((dest) => (
            <option key={dest.id} value={dest.id}>
              {dest.title}
            </option>
          ))}
        </select>
      </div>

      {/* Donor Details — no phone field */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="donor-name" className="form-label">
            Your Name
          </label>
          <input
            id="donor-name"
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="form-input"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="donor-email" className="form-label">
            Email Address *
          </label>
          <input
            id="donor-email"
            type="email"
            required
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            className="form-input"
            placeholder="you@example.com"
          />
          <p className="text-xs text-dark/50 mt-1">
            We'll send your receipt and payment details here.
          </p>
        </div>
      </div>

      {/* Impact Preview */}
      <div className="bg-cream rounded-lg p-4 mb-6">
        <p className="text-sm text-dark/80">
          <span className="font-bold text-primary">
            Your {formatCurrency(amount || 0)}
          </span>{" "}
          can help provide{" "}
          {amount >= 250
            ? "school supplies for 5 children"
            : amount >= 100
              ? "healthcare and essential needs for a child"
              : amount >= 50
                ? "school supplies for a child"
                : "nutritious meals for a child"}
          .
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !amount}
        className="btn-primary w-full text-lg py-4"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Redirecting to secure payment…
          </>
        ) : (
          <>
            <Heart className="w-5 h-5" fill="currentColor" />
            {isSponsor ? "Sponsor" : "Donate"} {formatCurrency(amount || 0)}
            {frequency === "monthly" ? "/month" : ""}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-dark/50">
        <Shield className="w-3.5 h-3.5" />
        Secure payment by Nylon Pay
      </div>

      {/* Accepted Methods */}
      <div className="mt-6 pt-6 border-t border-light">
        <p className="text-sm font-semibold text-dark mb-4 text-center">
          Accepted payment methods
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-light">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-dark" />
            </div>
            <span className="text-[11px] font-semibold text-dark text-center leading-tight">
              MTN Mobile
              <br />
              Money
            </span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-light">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-semibold text-dark text-center leading-tight">
              Airtel
              <br />
              Money
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}