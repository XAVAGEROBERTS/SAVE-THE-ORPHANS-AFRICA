import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Check, AlertCircle, Heart } from "lucide-react";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // ----- No token -----
  if (!token) {
    return (
      <section className="section-padding bg-light min-h-[60vh] flex items-center">
        <div className="container-custom max-w-lg text-center">
          <div className="card p-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3">Invalid Link</h1>
            <p className="text-dark/70 mb-6">
              This unsubscribe link is missing or invalid.
            </p>
            <Link href="/" className="btn-primary">
              Return Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ----- Lookup subscriber -----
  const supabase = createAdminClient();

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id, email")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  // ----- Token not found -----
  if (!subscriber) {
    return (
      <section className="section-padding bg-light min-h-[60vh] flex items-center">
        <div className="container-custom max-w-lg text-center">
          <div className="card p-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3">Not Found</h1>
            <p className="text-dark/70 mb-6">
              We couldn&apos;t find this subscription. It may have already been
              unsubscribed.
            </p>
            <Link href="/" className="btn-primary">
              Return Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ----- Mark as unsubscribed -----
  await supabase
    .from("subscribers")
    .update({
      is_active: false,
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("id", subscriber.id);

  // ----- Success -----
  return (
    <section className="section-padding bg-light min-h-[60vh] flex items-center">
      <div className="container-custom max-w-lg text-center">
        <div className="card p-8">
          <Check className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">
            You&apos;ve Been Unsubscribed
          </h1>
          <p className="text-dark/70 mb-2">{subscriber.email}</p>
          <p className="text-dark/60 text-sm mb-8">
            You will no longer receive newsletter emails from us. You can
            re-subscribe anytime from our website.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary">
              <Heart className="w-4 h-4" fill="currentColor" />
              Return Home
            </Link>
            <Link href="/" className="btn-ghost">
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}