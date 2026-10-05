"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Send, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const contactSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.from("contact_messages").insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
      });

      if (error) {
        console.error("Contact error:", error.message, error.code);
        setSubmitError(`Failed: ${error.message} [${error.code}]`);
        return;
      }

      // Track analytics event (if Plausible loaded)
      if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible("Contact Form Submitted");
      }

      // Notify admin — fire and forget
      try {
        await fetch("/api/email/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "contact",
            data: {
              name: data.fullName,
              email: data.email,
              phone: data.phone || "—",
              subject: data.subject,
              message: data.message,
            },
          }),
        });
      } catch (notifyErr) {
        console.error("Admin notification failed:", notifyErr);
      }

      setIsSubmitted(true);
      reset();
    } catch (err: any) {
      console.error("Unexpected:", err);
      setSubmitError(`Unexpected error: ${err?.message || "Unknown"}`);
    }
  };

  if (isSubmitted) {
    return (
      <div className="card p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-bold text-2xl text-dark mb-3">Message Sent!</h3>
        <p className="text-dark/70 mb-6">
          Thank you for reaching out. We&apos;ll get back to you within 2 business days.
        </p>
        <button onClick={() => setIsSubmitted(false)} className="btn-primary">
          Send Another Message
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
          <label htmlFor="contact-name" className="form-label">Full Name *</label>
          <input
            id="contact-name"
            type="text"
            {...register("fullName")}
            className="form-input"
            placeholder="Your name"
          />
          {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className="form-label">Email Address *</label>
          <input
            id="contact-email"
            type="email"
            {...register("email")}
            className="form-input"
            placeholder="you@example.com"
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-phone" className="form-label">Phone Number</label>
          <input
            id="contact-phone"
            type="tel"
            {...register("phone")}
            className="form-input"
            placeholder="+256 700 000 000"
          />
        </div>
        <div>
          <label htmlFor="contact-subject" className="form-label">Subject *</label>
          <input
            id="contact-subject"
            type="text"
            {...register("subject")}
            className="form-input"
            placeholder="How can we help?"
          />
          {errors.subject && <p className="form-error">{errors.subject.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="form-label">Message *</label>
        <textarea
          id="contact-message"
          {...register("message")}
          rows={5}
          className="form-input resize-none"
          placeholder="Write your message here..."
        />
        {errors.message && <p className="form-error">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full text-lg py-4"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}