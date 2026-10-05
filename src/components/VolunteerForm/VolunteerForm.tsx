"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Send, AlertCircle } from "lucide-react";

const volunteerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  areaOfInterest: z.string().min(1, "Please select an area of interest"),
  skills: z.string().min(10, "Please describe your skills"),
  availability: z.string().min(1, "Please select your availability"),
  motivation: z.string().min(20, "Please tell us why you want to volunteer"),
  previousExperience: z.string().optional(),
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

const areasOfInterest = [
  "Education & Tutoring",
  "Healthcare & Medical",
  "Child Care & Mentoring",
  "Administration & Office",
  "Fundraising & Events",
  "Communications & Media",
  "Construction & Maintenance",
  "Other",
];

const availabilityOptions = ["Weekdays", "Weekends", "Evenings", "Full-time", "Flexible"];

export function VolunteerForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VolunteerFormData>({ resolver: zodResolver(volunteerSchema) });

  const onSubmit = async (data: VolunteerFormData) => {
    setSubmitError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "volunteer_applications",
          data: {
            full_name: data.fullName,
            email: data.email.trim().toLowerCase(),
            phone: data.phone,
            country: data.country,
            area_of_interest: data.areaOfInterest,
            skills: data.skills,
            availability: data.availability,
            motivation: data.motivation,
            previous_experience: data.previousExperience || null,
          },
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setSubmitError(
            json.error || "Too many submissions. Please try again later."
          );
          return;
        }
        setSubmitError(json.error || "Failed to submit. Please try again.");
        return;
      }

      if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible("Volunteer Application Submitted");
      }

      fetch("/api/email/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "volunteer",
          data: {
            name: data.fullName,
            email: data.email,
            phone: data.phone,
            country: data.country,
            area_of_interest: data.areaOfInterest,
            availability: data.availability,
          },
        }),
      }).catch(() => {});

      setIsSubmitted(true);
      reset();
    } catch (err: any) {
      console.error("Volunteer error:", err);
      setSubmitError(err?.message || "Something went wrong. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="card p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-bold text-2xl text-dark mb-3">Application Received!</h3>
        <p className="text-dark/70 mb-6">
          Thank you for your interest in volunteering with Save the Orphans
          Africa. Our volunteer coordinator will review your application and
          contact you within 5 business days.
        </p>
        <button onClick={() => setIsSubmitted(false)} className="btn-primary">
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 md:p-8 space-y-5">
      {submitError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm break-all">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="fullName" className="form-label">Full Name *</label>
          <input id="fullName" type="text" {...register("fullName")} className="form-input" placeholder="Jane Doe" />
          {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="form-label">Email Address *</label>
          <input id="email" type="email" {...register("email")} className="form-input" placeholder="jane@example.com" />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="form-label">Phone Number *</label>
          <input id="phone" type="tel" {...register("phone")} className="form-input" placeholder="+256 700 000 000" />
          {errors.phone && <p className="form-error">{errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="country" className="form-label">Country *</label>
          <input id="country" type="text" {...register("country")} className="form-input" placeholder="Uganda" />
          {errors.country && <p className="form-error">{errors.country.message}</p>}
        </div>
        <div>
          <label htmlFor="areaOfInterest" className="form-label">Area of Interest *</label>
          <select id="areaOfInterest" {...register("areaOfInterest")} className="form-input">
            <option value="">Select an area...</option>
            {areasOfInterest.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          {errors.areaOfInterest && <p className="form-error">{errors.areaOfInterest.message}</p>}
        </div>
        <div>
          <label htmlFor="availability" className="form-label">Availability *</label>
          <select id="availability" {...register("availability")} className="form-input">
            <option value="">Select availability...</option>
            {availabilityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          {errors.availability && <p className="form-error">{errors.availability.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="skills" className="form-label">Skills & Qualifications *</label>
        <textarea id="skills" {...register("skills")} rows={3} className="form-input resize-none" placeholder="Tell us about your relevant skills..." />
        {errors.skills && <p className="form-error">{errors.skills.message}</p>}
      </div>

      <div>
        <label htmlFor="motivation" className="form-label">Why would you like to volunteer? *</label>
        <textarea id="motivation" {...register("motivation")} rows={4} className="form-input resize-none" placeholder="Share your motivation..." />
        {errors.motivation && <p className="form-error">{errors.motivation.message}</p>}
      </div>

      <div>
        <label htmlFor="previousExperience" className="form-label">Previous Volunteer Experience</label>
        <textarea id="previousExperience" {...register("previousExperience")} rows={3} className="form-input resize-none" placeholder="Optional..." />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-lg py-4">
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Application
          </>
        )}
      </button>
    </form>
  );
}
