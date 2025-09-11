import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllContent, getBySlug, type ContentMeta } from "@/lib/content";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxRemoteOptions } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx-components";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

const isPeriod = (v: string) => /^\d{4}-\d{2}$/.test(v);

export async function generateStaticParams(): Promise<{ period: string }[]> {
  const all = (await getAllContent()) as ContentMeta[];
  return all
    .map((m) => (typeof m.slug === "string" ? m.slug : ""))
    .filter((s) => /^now\/\d{4}-\d{2}$/.test(s))
    .map((s) => ({ period: s.split("/")[1] }));
}

export async function generateMetadata({ params }: { params: { period: string } }): Promise<Metadata> {
  if (!isPeriod(params.period)) return {};
  const title = `Now — ${params.period}`;
  return { title, description: `What I focused on in ${params.period}.`, alternates: { canonical: `/now/${params.period}` } };
}

export default async function NowPeriodPage({ params }: { params: { period: string } }) {
  const { period } = params;
  if (!isPeriod(period)) notFound();

  const slug = `now/${period}`;
  const entry = await getBySlug(slug).catch(() => null);
  if (!entry) notFound();

  const { meta, source } = entry;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-6">
        <h1 className="text-3xl/tight font-semibold tracking-tight">Now — {period}</h1>
        {meta.summary && <p className="mt-1 text-sm text-muted-foreground">{meta.summary}</p>}
      </header>
      <article className="prose prose-neutral dark:prose-invert">
        <MDXRemote
          source={source}
          options={mdxRemoteOptions}
          components={mdxComponents as unknown as Record<string, React.ComponentType>}
        />
      </article>
    </main>
  );
}
