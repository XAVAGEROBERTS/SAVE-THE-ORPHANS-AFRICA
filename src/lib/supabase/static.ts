import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for public, cacheable content.
 * Used by server components in static/ISR contexts (sitemap, queries, etc.)
 * Safe because these tables have public SELECT policies.
 */
export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}