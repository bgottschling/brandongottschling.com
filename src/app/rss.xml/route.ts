import { NextResponse } from "next/server";
import { getAllContent, type ContentMeta } from "@/lib/content";

export const runtime = "edge";          // works fine on Edge or switch to "nodejs"
export const revalidate = 0;            // we’ll control caching via headers

function siteOrigin(req: Request) {
  return process.env.NEXT_PUBLIC_SITE_ORIGIN || new URL(req.url).origin;
}
function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(req: Request) {
  const origin = siteOrigin(req);

  // Pull everything and filter to public blog posts
  const all = (await getAllContent()) as ContentMeta[];
  const posts = all
    .filter((m) => !m.draft && (
      m.type === "blog" ||
      (typeof m.slug === "string" && m.slug.startsWith("blog/"))
    ))
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 50); // keep the feed lean

  const now = new Date();
  const lastBuildDate = posts[0]?.date ?? now.toISOString();

  const itemsXml = posts.map((m) => {
    const url = `${origin}/${m.slug}`;
    const title = escapeXml(m.title || "Untitled");
    const summary = m.summary ? `<![CDATA[${m.summary}]]>` : "";
    const pub = new Date(m.date ?? now).toUTCString();
    return `
      <item>
        <title>${title}</title>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        <pubDate>${pub}</pubDate>
        ${m.summary ? `<description>${summary}</description>` : ""}
      </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>brandongottschling.com</title>
    <link>${origin}</link>
    <description>Research, projects, and writing by Brandon Gottschling.</description>
    <language>en</language>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${origin}/favicon-32x32.png</url>
      <title>brandongottschling.com</title>
      <link>${origin}</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Cache at the edge for 5 minutes; allow 1 minute stale while revalidating
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      "X-Robots-Tag": "index, follow",
    },
  });
}
