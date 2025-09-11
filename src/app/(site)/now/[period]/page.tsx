// src/app/(site)/now/[period]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllContent, getBySlug, type ContentMeta } from "@/lib/content";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { mdxRemoteOptions } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx-components";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

function isPeriod(v: string) {
  return /^\d{4}-\d{2}$/.test(v);
}

export async function generateStaticParams(): Promise<{ period: string }[]> {
  const all = (await getAllContent()) as ContentMeta[];
  const periods = all
    .map((m) => (typeof m.slug === "string" ? m.slug : ""))
    .filter((s) => /^now\/\d{4}-\d{2}$/.test(s))
    .map((s) => ({ period: s.split("/")[1] }));
  return periods;
}

export async function generateMetadata({ params }: { params: { period: string } }): Promise<Metadata> {
  const period = params.period;
  if (!isPeriod(period)) return {};
  const title = `Now — ${period}`;
  return {
    title,
    description: `What I focused on in ${period}.`,
    alternates: { canonical: `/now/${period}` },
    robots: { index: true, follow: true },
  };
}

export default async function NowPeriodPage({ params }: { params: { period: string } }) {
  const period = params.period;
  if (!isPeriod(period)) notFound();

  const slug = `now/${period}`;
  const entry = await getBySlug(slug).catch(() => null);
  if (!entry) notFound();

  const { meta, source } = entry;
  const mdxSource = await serialize(source, mdxRemoteOptions);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Now — ${period}`,
    url: `https://brandongottschling.com/now/${period}`,
    dateModified: meta.date || new Date().toISOString(),
    inLanguage: "en",
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="mb-6">
        <h1 className="text-3xl/tight font-semibold tracking-tight">Now — {period}</h1>
        {meta.summary && <p className="mt-1 text-sm text-muted-foreground">{meta.summary}</p>}
      </header>
      <article className="prose prose-neutral dark:prose-invert">
        <MDXRemote
          {...mdxSource}
          components={mdxComponents as unknown as Record<string, React.ComponentType>}
        />
      </article>
    </main>
  );
}
