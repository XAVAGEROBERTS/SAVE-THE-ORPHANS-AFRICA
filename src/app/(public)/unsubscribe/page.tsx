"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, AlertCircle, Heart, Home, Loader2 } from "lucide-react";

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

        // Look up the subscriber by token
        const { data: subscriber } = await supabase
          .from("subscribers")
          .select("id, email")
          .eq("unsubscribe_token", token)
          .maybeSingle();

        if (!subscriber) {
          setStatus("not_found");
          return;
        }

        // DELETE the subscriber entirely
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
                Your email has been removed from our list. You can re-subscribe
                anytime from our website.
              </p>
            </>
          )}

          {(status === "success" || status === "not_found" || status === "invalid") && (
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

              {status === "success" && (
                <button
                  onClick={handleReturnHome}
                  disabled={isNavigating}
                  className="btn-ghost inline-flex items-center justify-center gap-2 min-w-[180px]"
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" fill="currentColor" />
                      Back to Website
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}