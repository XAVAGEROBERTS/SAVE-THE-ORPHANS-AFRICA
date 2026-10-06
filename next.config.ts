import type { NextConfig } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://save-the-orphans-africa.vercel.app";

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------
// These are applied to EVERY response. They do not break anything on the site
// as-is; the CSP is the only one you should watch carefully, and it's scoped
// to your known payment/email providers. If anything starts failing (payment
// iframe won't load, image won't render), open DevTools → Console and check
// for "Content Security Policy" violations, then add the blocked domain here.
// ---------------------------------------------------------------------------
const securityHeaders = [
  // Force HTTPS for 2 years, including subdomains, and preload into browsers
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Stop MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Stop your site being embedded in a foreign iframe (clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Don't leak full referrer to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features you don't need
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  // DNS prefetch
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Content Security Policy — see notes above before tightening further
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js needs 'unsafe-inline' for its runtime; 'unsafe-eval' in dev
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // Where the browser can make fetch/XHR calls. Add your payment provider:
      "connect-src 'self' https://plausible.io https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.nylonpay.com",
      // Where iframes can load from (payment providers use iframes)
      "frame-src 'self' https://js.stripe.com https://checkout.flutterwave.com",
      // Only your own site can frame you
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Hide the "X-Powered-By: Next.js" header — mild info-leak reduction
  poweredByHeader: false,

  // Enable React strict mode for dev-time warnings
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Supabase Storage — add once you know your project ref
      // { protocol: "https", hostname: "*.supabase.co" },
    ],
    // Reduce risk of huge uploaded images bypassing optimization
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Extra: never cache admin pages in shared caches
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        // Never index API routes
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;