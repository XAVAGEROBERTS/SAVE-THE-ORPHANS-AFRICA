import Link from "next/link";
import { Check, Heart } from "lucide-react";

export default async function DonateSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; OrderTrackingId?: string }>;
}) {
  const params = await searchParams;
  const ref = params.ref;

  return (
    <section className="section-padding bg-light min-h-[70vh] flex items-center">
      <div className="container-custom max-w-2xl">
        <div className="card p-8 md:p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">
            Thank You for Your Donation!
          </h1>

          <p className="text-lg text-dark/70 mb-6">
            Your generous gift will help provide vulnerable children with care,
            education, healthcare, and a safe place to call home.
          </p>

          {ref && (
            <div className="bg-light rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-dark/60">Reference:</span>
                <span className="font-mono font-semibold">{ref}</span>
              </div>
            </div>
          )}

          <p className="text-sm text-dark/60 mb-8">
            A confirmation email will be sent shortly. For any questions, contact{" "}
            <a href="mailto:donations@savetheorphansafrica.org" className="text-primary underline">
              donations@savetheorphansafrica.org
            </a>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary">
              <Heart className="w-5 h-5" fill="currentColor" />
              Back to Home
            </Link>
            <Link href="/stories" className="btn-ghost">
              Read Our Stories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}