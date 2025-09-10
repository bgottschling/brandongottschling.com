import { getAllContent, getBySlug, type ContentMeta } from "@/lib/content";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxRemoteOptions } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx-components";

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const all = await getAllContent();
  return all.map((p: ContentMeta) => ({ slug: p.slug.split("/") }));
}

export const revalidate = 60; // or 0/false for full static; tune as you like

export default async function ContentPage({ params }: { params: { slug: string[] } }) {
  const joined = params.slug.join("/");
  const entry = await getBySlug(joined);
  if (!entry || entry.meta.draft) {
    return <div>Not found.</div>;
    // or: import { notFound } from "next/navigation"; notFound();
  }

  const { meta, source } = entry; // `source` is the raw MDX string

  return (
    <article className="prose prose-neutral max-w-none">
      <h1>{meta.title}</h1>
      {meta.summary && <p className="lead">{meta.summary}</p>}
      <MDXRemote
      source={source}
      components={mdxComponents as Record<string, React.ComponentType<unknown>>}
      options={mdxRemoteOptions}
      />
    </article>
  );
}
