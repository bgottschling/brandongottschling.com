// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://brandongottschling.com";
  return {
    rules: [
      {
        userAgent: "*",
        // keep the public site indexable
        allow: ["/", "/about", "/blog", "/projects", "/research", "/cv", "/trust", "/trust/"],
        // block private & dynamic endpoints
        disallow: [
          "/card",
          "/card/",
          "/card/*",
          "/api",
          "/api/",
          "/api/*",
          "/drafts",
          "/drafts/*",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site.replace(/^https?:\/\//, ""),
  };
}
