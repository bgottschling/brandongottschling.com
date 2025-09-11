// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://brandongottschling.com";
  const now = new Date().toISOString();

  const urls: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site}/research`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site}/cv`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site}/trust`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${site}/trust/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/trust/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site}/trust/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Optionally: append dynamic content (blog posts, projects) here.
  return urls;
}
