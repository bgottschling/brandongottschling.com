// src/app/(site)/now/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getBySlug } from "@/lib/content"; // your existing content loader
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { mdxRemoteOptions } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx-components";

export const runtime = "nodejs";       // content.ts uses fs/path
export const dynamic = "force-static"; // generate at build
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
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function NowPage() {
  // Try to load `content/now.mdx` (slug: "now")
  const entry = await getBySlug("now").catch(() => null);

  // Fallback content if MDX not found so /now never 404s
  if (!entry) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <header className="mb-6">
          <h1 className="text-3xl/tight font-semibold tracking-tight">Now</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Last updated: <em>—</em>
          </p>
        </header>
        <div className="prose prose-neutral dark:prose-invert">
          <p>
            This page shares what I’m focused on right now—work in progress, reading,
            and priorities. I keep it short and current.
          </p>
          <p className="text-sm text-muted-foreground">
            To enable live updates, create <code>content/now.mdx</code>. See the template in the repo.
          </p>
          <p>
            Meanwhile, you can explore the{" "}
            <Link className="underline" href="/projects">Projects</Link>,{" "}
            <Link className="underline" href="/blog">Blog</Link>, or{" "}
            <Link className="underline" href="/cv">CV</Link>.
          </p>
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
        <hr />
        <p className="text-sm text-muted-foreground">
          Want a longer view? See the{" "}
          <Link href="/projects" className="underline">Projects</Link> and{" "}
          <Link href="/blog" className="underline">Blog</Link>. Subscribe via{" "}
          <Link href="/rss.xml" className="underline" rel="alternate">RSS</Link>.
        </p>
      </article>
    </main>
  );
}
