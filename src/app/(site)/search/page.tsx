import type { Metadata } from "next";
import Link from "next/link";
import { getAllContent, filterVisible } from "@/lib/content";
import SearchViewBar from "@/components/SearchViewBar";
import type { CardVariant } from "@/components/FancyCard";
import { Search, BookOpen, Hammer, FlaskConical, Calendar, Tag } from "lucide-react";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across all posts, projects, and research by Brandon Gottschling.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

const TYPE_CONFIG: Record<string, {
  label: string;
  variant: CardVariant;
  icon: typeof BookOpen;
  accent: string;
  bg: string;
}> = {
  blog: {
    label: "Blog",
    variant: "blog",
    icon: BookOpen,
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-800/30",
  },
  project: {
    label: "Project",
    variant: "project",
    icon: Hammer,
    accent: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 border-cyan-200/50 dark:bg-cyan-950/20 dark:border-cyan-800/30",
  },
  research: {
    label: "Research",
    variant: "research",
    icon: FlaskConical,
    accent: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 border-indigo-200/50 dark:bg-indigo-950/20 dark:border-indigo-800/30",
  },
};

type ResultItem = {
  href: string;
  title: string;
  summary?: string;
  date?: string;
  tags?: string[];
  type: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (sp.q as string | undefined) ?? "";

  const raw = await getAllContent();
  const all = filterVisible(raw).filter(
    (x) => x.type === "blog" || x.type === "project" || x.type === "research"
  );

  const items: ResultItem[] = all.map((p) => {
    const type = p.type ?? "blog";
    const slugTail = p.slug.split("/").pop();
    const prefix = type === "project" ? "projects" : type === "research" ? "research" : "blog";
    return {
      href: `/${prefix}/${slugTail}`,
      title: p.title,
      summary: p.summary,
      date: p.date,
      tags: p.tags,
      type,
    };
  });

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

  const hasQuery = q.length > 0;
  const totalResults = results.length;

  return (
    <main className="py-10">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Search</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {hasQuery
            ? `${totalResults} result${totalResults !== 1 ? "s" : ""} for \u201c${q}\u201d`
            : "Search across all posts, projects, and research."}
        </p>

        <SearchViewBar />

        {/* Empty states */}
        {hasQuery && totalResults === 0 && (
          <div className="mt-20 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/20" />
            <p className="mt-4 text-muted-foreground">
              No results for &ldquo;{q}&rdquo;
            </p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Try a different keyword or browse by section.
            </p>
          </div>
        )}

        {!hasQuery && (
          <div className="mt-20 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/20" />
            <p className="mt-4 text-muted-foreground">
              Type a keyword to search across all content.
            </p>
          </div>
        )}

        {/* Results */}
        {hasQuery && totalResults > 0 && (
          <div className="mt-8 space-y-3">
            {results.map((item) => {
              const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.blog;
              const Icon = config.icon;
              const dateStr = item.date
                ? new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group block rounded-lg border border-black/5 bg-white/80 p-4 sm:p-5 transition-all hover:border-black/10 hover:shadow-md hover:bg-white dark:border-white/5 dark:bg-neutral-900/60 dark:hover:border-white/10 dark:hover:bg-neutral-900/80 no-underline"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Type icon */}
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.accent}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Type badge + date */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${config.accent}`}>
                          {config.label}
                        </span>
                        {dateStr && (
                          <>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                              <Calendar className="h-3 w-3" />
                              {dateStr}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-semibold leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h2>

                      {/* Summary */}
                      {item.summary && (
                        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      )}

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          <Tag className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                          {item.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-neutral-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 4 && (
                            <span className="text-[10px] text-muted-foreground/50">
                              +{item.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
