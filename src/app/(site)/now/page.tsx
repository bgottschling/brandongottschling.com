// src/app/(site)/now/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getAllContent, getBySlug, type ContentMeta } from "@/lib/content";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { mdxRemoteOptions } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx-components";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Now — What I’m focused on",
  description: "What I’m doing now: focus, projects, learning, and life.",
  alternates: { canonical: "/now" },
  robots: { index: true, follow: true },
};

function fmt(d?: string) {
  if (!d) return null;
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function isPeriodSlug(s: string) {
  // accepts "now/2025-09"
  return /^now\/\d{4}-\d{2}$/.test(s);
}

export default async function NowPage() {
  const entry = await getBySlug("now").catch(() => null);

  // Collect recent snapshots
  const all = (await getAllContent()) as ContentMeta[];
  const snapshots = all
    .filter((m) => !m.draft && typeof m.slug === "string" && isPeriodSlug(m.slug))
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 3);

  if (!entry) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <header className="mb-6">
          <h1 className="text-3xl/tight font-semibold tracking-tight">Now</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last updated: <em>—</em></p>
        </header>
        <div className="prose prose-neutral dark:prose-invert">
          <p>This page shares what I’m focused on right now.</p>
          {snapshots.length ? (
            <>
              <hr />
              <h3>Recent snapshots</h3>
              <ul>
                {snapshots.map((s) => (
                  <li key={s.slug}>
                    <Link className="underline" href={`/${s.slug}`}>{s.title || s.slug.replace("now/", "")}</Link>
                    {s.date && <span className="text-sm text-muted-foreground"> — {fmt(s.date)}</span>}
                  </li>
                ))}
              </ul>
              <p><Link className="underline" href="/now/archive">View all snapshots →</Link></p>
            </>
          ) : null}
        </div>
      </main>
    );
  }

  const { meta, source } = entry;
  const mdxSource = await serialize(source, mdxRemoteOptions);
  const updated = fmt(meta.date);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Now — What I’m focused on",
    url: "https://brandongottschling.com/now",
    dateModified: meta.date || new Date().toISOString(),
    inLanguage: "en",
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-6">
        <h1 className="text-3xl/tight font-semibold tracking-tight">Now</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Last updated: {updated ? <time dateTime={meta.date}>{updated}</time> : <em>—</em>}
        </p>
      </header>

      <article className="prose prose-neutral dark:prose-invert">
        <MDXRemote
          {...mdxSource}
          components={mdxComponents as unknown as Record<string, React.ComponentType>}
        />

        {snapshots.length ? (
          <>
            <hr />
            <h3>Recent snapshots</h3>
            <ul>
              {snapshots.map((s) => (
                <li key={s.slug}>
                  <Link className="underline" href={`/${s.slug}`}>{s.title || s.slug.replace("now/", "")}</Link>
                  {s.date && <span className="text-sm text-muted-foreground"> — {fmt(s.date)}</span>}
                </li>
              ))}
            </ul>
            <p><Link className="underline" href="/now/archive">View all snapshots →</Link></p>
          </>
        ) : null}
      </article>
    </main>
  );
}
