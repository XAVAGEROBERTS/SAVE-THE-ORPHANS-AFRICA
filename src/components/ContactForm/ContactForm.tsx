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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("ENV CHECK:", {
      url: supabaseUrl,
      keyStart: supabaseKey?.substring(0, 20) + "...",
    });

    if (!supabaseUrl || !supabaseKey) {
      setSubmitError("Configuration error: Supabase environment variables missing.");
      return;
    }

    try {
      const supabase = createClient();

      const payload = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
      };

      console.log("Submitting payload:", payload);

      const { data: result, error } = await supabase
        .from("contact_messages")
        .insert(payload)
        .select();

         if (error) {
        const errorDetails = [
          `MESSAGE: ${error.message || "(empty)"}`,
          `CODE: ${error.code || "(empty)"}`,
          `DETAILS: ${error.details || "(empty)"}`,
          `HINT: ${error.hint || "(empty)"}`,
          `KEYS: ${Object.keys(error).join(", ")}`,
          `STRINGIFIED: ${JSON.stringify(error)}`,
          `STRING: ${String(error)}`,
        ].join("\n");

        console.error("SUPABASE ERROR DETAILS:\n" + errorDetails);

        setSubmitError(
          `Failed [${error.code || "no-code"}]: ${error.message || "Unknown error"}`
        );
        return;
      }

      console.log("SUCCESS:", result);
      setIsSubmitted(true);
      reset();
    } catch (err: any) {
      console.error("CATCH ERROR:", err);
      setSubmitError(`Unexpected error: ${err?.message || JSON.stringify(err)}`);
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
            placeholder="+1 234 567 8900"
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