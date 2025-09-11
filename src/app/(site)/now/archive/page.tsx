// src/app/(site)/now/archive/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getAllContent, type ContentMeta } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Now — Archive",
  description: "Past /now snapshots.",
  alternates: { canonical: "/now/archive" },
  robots: { index: true, follow: true },
};

function isPeriodSlug(s: string) {
  return /^now\/\d{4}-\d{2}$/.test(s);
}
function fmt(d?: string) {
  if (!d) return null;
  const date = new Date(d);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export default async function NowArchivePage() {
  const all = (await getAllContent()) as ContentMeta[];
  const snapshots = all
    .filter((m) => !m.draft && typeof m.slug === "string" && isPeriodSlug(m.slug))
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-6">
        <h1 className="text-3xl/tight font-semibold tracking-tight">Now — Archive</h1>
        <p className="mt-1 text-sm text-muted-foreground">Past snapshots by month.</p>
      </header>

      <div className="prose prose-neutral dark:prose-invert">
        {snapshots.length === 0 ? (
          <p>No snapshots yet.</p>
        ) : (
          <ul>
            {snapshots.map((s) => (
              <li key={s.slug}>
                <Link className="underline" href={`/${s.slug}`}>
                  {s.title || s.slug.replace("now/", "")}
                </Link>
                {s.date && <span className="text-sm text-muted-foreground"> — {fmt(s.date)}</span>}
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm"><Link className="underline" href="/now">Back to current →</Link></p>
      </div>
    </main>
  );
}
