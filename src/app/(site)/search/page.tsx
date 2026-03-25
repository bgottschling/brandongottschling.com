import type { Metadata } from "next";
import { getAllContent, filterVisible } from "@/lib/content";
import SearchViewBar from "@/components/SearchViewBar";
import ItemsGridList, { type Item } from "@/components/ItemsGridList";
import type { CardVariant } from "@/components/FancyCard";
import { Search } from "lucide-react";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across all posts, projects, and research by Brandon Gottschling.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true }, // Don't index search results pages
};

const TYPE_LABELS: Record<string, { label: string; variant: CardVariant }> = {
  blog: { label: "Blog", variant: "blog" },
  project: { label: "Projects", variant: "project" },
  research: { label: "Research", variant: "research" },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (sp.q as string | undefined) ?? "";
  const view = (sp.view as "grid" | "list" | undefined) ?? "list";

  const raw = await getAllContent();
  const all = filterVisible(raw).filter(
    (x) => x.type === "blog" || x.type === "project" || x.type === "research"
  );

  // Map to display items
  const items: (Item & { type: string })[] = all.map((p) => {
    const type = p.type ?? "blog";
    const info = TYPE_LABELS[type] ?? TYPE_LABELS.blog;
    const slugTail = p.slug.split("/").pop();
    const prefix = type === "project" ? "projects" : type === "research" ? "research" : "blog";
    return {
      href: `/${prefix}/${slugTail}`,
      title: p.title,
      summary: p.summary,
      cover: p.image,
      date: p.date,
      tags: p.tags,
      variant: info.variant,
      badge: info.label,
      type,
    };
  });

  // Filter by query
  let results = items;
  if (q) {
    const qq = q.toLowerCase();
    results = items.filter(
      (it) =>
        it.title.toLowerCase().includes(qq) ||
        (it.summary?.toLowerCase().includes(qq) ?? false) ||
        (it.tags ?? []).some((t) => t.toLowerCase().includes(qq))
    );
  }

  // Group by type
  const grouped = new Map<string, (Item & { type: string })[]>();
  for (const item of results) {
    const group = grouped.get(item.type) ?? [];
    group.push(item);
    grouped.set(item.type, group);
  }

  const hasQuery = q.length > 0;
  const totalResults = results.length;

  return (
    <main className="py-10">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Search</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {hasQuery
            ? `${totalResults} result${totalResults !== 1 ? "s" : ""} for "${q}"`
            : "Search across all posts, projects, and research."}
        </p>

        <SearchViewBar />

        {hasQuery && totalResults === 0 && (
          <div className="mt-16 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">
              No results for &ldquo;{q}&rdquo;. Try a different search term.
            </p>
          </div>
        )}

        {!hasQuery && (
          <div className="mt-16 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">
              Type a keyword to search across all content.
            </p>
          </div>
        )}

        {hasQuery && totalResults > 0 && (
          <div className="mt-8 space-y-10">
            {(["blog", "project", "research"] as const).map((type) => {
              const group = grouped.get(type);
              if (!group?.length) return null;
              const info = TYPE_LABELS[type];
              return (
                <section key={type}>
                  <h2 className="text-lg font-semibold mb-4">
                    {info.label}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({group.length})
                    </span>
                  </h2>
                  <ItemsGridList items={group} view={view} />
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
