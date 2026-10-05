"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Check, AlertCircle, Home, Heart, Loader2 } from "lucide-react";

export default function UnsubscribePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "not_found" | "invalid">("loading");
  const [email, setEmail] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    async function process() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setStatus("invalid");
        return;
      }

      try {
        const supabase = createClient();

        const { data: subscriber } = await supabase
          .from("subscribers")
          .select("id, email")
          .eq("unsubscribe_token", token)
          .maybeSingle();

        if (!subscriber) {
          setStatus("not_found");
          return;
        }

        const { error: deleteError } = await supabase
          .from("subscribers")
          .delete()
          .eq("id", subscriber.id);

        if (deleteError) {
          console.error("Delete error:", deleteError);
          setStatus("not_found");
          return;
        }

        setEmail(subscriber.email);
        setStatus("success");
      } catch (err) {
        console.error("Unsubscribe error:", err);
        setStatus("not_found");
      }
    }
    process();
  }, []);

  const handleReturnHome = () => {
    setIsNavigating(true);
    router.push("/");
  };

  return (
    <section className="section-padding bg-light min-h-[60vh] flex items-center">
      <div className="container-custom max-w-lg text-center">
        <div className="card p-8">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-3">Processing...</h1>
              <p className="text-dark/70">Please wait a moment.</p>
            </>
          )}

          {status === "invalid" && (
            <>
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-3">Invalid Link</h1>
              <p className="text-dark/70 mb-6">
                This unsubscribe link is missing or invalid.
              </p>
              <button
                onClick={handleReturnHome}
                disabled={isNavigating}
                className="btn-primary inline-flex items-center justify-center gap-2 min-w-[180px]"
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4" />
                    Return Home
                  </>
                )}
              </button>
            </>
          )}

          {status === "not_found" && (
            <>
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-3">Not Found</h1>
              <p className="text-dark/70 mb-6">
                We couldn&apos;t find this subscription. It may have already been
                removed.
              </p>
              <button
                onClick={handleReturnHome}
                disabled={isNavigating}
                className="btn-primary inline-flex items-center justify-center gap-2 min-w-[180px]"
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4" />
                    Return Home
                  </>
                )}
              </button>
            </>
          )}

          {status === "success" && (
            <>
              <Check className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-3">
                You&apos;ve Been Unsubscribed
              </h1>
              <p className="text-dark/70 mb-2">{email}</p>
              <p className="text-dark/60 text-sm mb-8">
                You will no longer receive newsletter emails from us. You can
                re-subscribe anytime from our website.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleReturnHome}
                  disabled={isNavigating}
                  className="btn-primary inline-flex items-center justify-center gap-2 min-w-[180px]"
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Home className="w-4 h-4" />
                      Return Home
                    </>
                  )}
                </button>

                <Link
                  href="/donate"
                  prefetch={true}
                  className="btn-ghost inline-flex items-center justify-center gap-2 min-w-[180px]"
                >
                  <Heart className="w-4 h-4" fill="currentColor" />
                  Support Our Work
                </Link>
              </div>

              <p className="text-xs text-dark/50 mt-6">
                Changed your mind? You can{" "}
                <button
                  onClick={handleReturnHome}
                  className="text-primary underline hover:no-underline"
                >
                  re-subscribe anytime
                </button>{" "}
                from our homepage.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

