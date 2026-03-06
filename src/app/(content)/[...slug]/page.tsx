// src/app/(content)/[...slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllContent, getBySlug, type ContentMeta } from "@/lib/content";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxRemoteOptions } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx-components";
import { articleJsonLd, creativeWorkJsonLd, makeUrl } from "@/lib/jsonld";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const all = (await getAllContent()) as ContentMeta[];
  return all.map((p) => ({ slug: p.slug.split("/") }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string[] }> }
): Promise<Metadata> {
  const { slug } = await params;
  const joined = slug.join("/");
  const entry = await getBySlug(joined).catch(() => null);
  if (!entry || entry.meta.draft) return {};
  return {
    title: entry.meta.title ?? "Untitled",
    description: entry.meta.summary ?? undefined,
    alternates: { canonical: `/${joined}` },
    robots: { index: true, follow: true },
  };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const joined = slug.join("/");
  const entry = await getBySlug(joined).catch(() => null);
  if (!entry || entry.meta.draft) notFound();

  const { meta, source } = entry;
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://brandongottschling.com";
  const url = makeUrl(origin, joined);

  // Decide schema type based on collection or path
  const isBlog = meta.collection === "blog" || joined.startsWith("blog/");
  const jsonLd = isBlog ? articleJsonLd(meta, url) : creativeWorkJsonLd(meta, url);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="prose prose-neutral dark:prose-invert">
        <h1>{meta.title}</h1>
        {meta.summary && <p className="lead">{meta.summary}</p>}
        <MDXRemote
          source={source}
          options={mdxRemoteOptions}
          components={mdxComponents as unknown as Record<string, React.ComponentType>}
        />
      </article>
    </main>
  );
}
