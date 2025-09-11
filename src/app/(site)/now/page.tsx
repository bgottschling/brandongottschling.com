import type { Metadata } from "next";
import Link from "next/link";
import { getAllContent, getBySlug, type ContentMeta } from "@/lib/content";
import { MDXRemote } from "next-mdx-remote/rsc";
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

const fmt = (d?: string) => {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};
const isPeriodSlug = (s: string) => /^now\/\d{4}-\d{2}$/.test(s);

export default async function NowPage() {
  const entry = await getBySlug("now").catch(() => null);
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
        {snapshots.length ? (
          <div className="prose prose-neutral dark:prose-invert">
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
          </div>
        ) : null}
      </main>
    );
  }

  const { meta, source } = entry;
  const updated = fmt(meta.date);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-6">
        <h1 className="text-3xl/tight font-semibold tracking-tight">Now</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Last updated: {updated ? <time dateTime={meta.date}>{updated}</time> : <em>—</em>}
        </p>
      </header>

      <article className="prose prose-neutral dark:prose-invert">
        <MDXRemote
          source={source}
          options={mdxRemoteOptions}
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
