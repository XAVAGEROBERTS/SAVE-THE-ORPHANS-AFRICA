import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://save-the-orphans-africa.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/unsubscribe",
          "/donate/success",
          "/*?*utm_",
          "/*?*ref=",
          "/*?*fbclid=",
        ],
      },
      { userAgent: "Googlebot", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}