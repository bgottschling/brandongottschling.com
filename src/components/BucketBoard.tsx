import FancyCard from "@/components/FancyCard";
import { Button } from "@/components/ui/button";
import { BUCKET_LABEL, inferFromTags, PRIMARY_CATEGORIES, type PrimaryCategory } from "@/lib/buckets";

export type Item = {
  href: string;
  title: string;
  summary?: string;
  cover?: string;
  date?: string;
  tags?: string[];
  primaryCategory?: PrimaryCategory;
};

export default function BucketBoard({
  items,
  filterBucket,
  q,
  view = "grid",
  visibleBuckets = [...PRIMARY_CATEGORIES],
}: {
  items: Item[];
  filterBucket?: PrimaryCategory;
  q?: string | null;
  view?: "grid" | "list";
  visibleBuckets?: PrimaryCategory[];
}) {
  // filter + search
  let data = items;
  if (filterBucket) data = data.filter((it) => (it.primaryCategory ?? inferFromTags(it.tags)) === filterBucket);
  if (q) {
    const qq = q.toLowerCase();
    data = data.filter(
      (it) =>
        it.title.toLowerCase().includes(qq) ||
        (it.summary?.toLowerCase().includes(qq) ?? false) ||
        (it.tags ?? []).some((t) => t.toLowerCase().includes(qq))
    );
  }

  if (view === "list") {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10">
        {data.map((it, idx) => (
          <a
            key={it.href}
            href={it.href}
            className={`block bg-white/5 px-4 py-3 transition hover:bg-white/10 ${idx !== 0 ? "border-t border-white/10" : ""}`}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div className="text-base font-semibold leading-tight">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.date?.slice(0, 10)}</div>
            </div>
            {it.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{it.summary}</p>}
          </a>
        ))}
      </div>
    );
  }

  // group by bucket
  const grouped: Record<PrimaryCategory, Item[]> = {
    faith: [],
    fitness: [],
    relationships: [],
    technology: [],
    life: [],
    work: [],
    travel: [],
    economics: [],
    civics: [],
    projects: [],
    research: [],
    other: [],
  };
  for (const it of data) {
    const cat = it.primaryCategory ?? inferFromTags(it.tags);
    grouped[cat].push(it);
  }

  return (
    <div className="space-y-10">
      {visibleBuckets.map((bucket) => {
        const arr = grouped[bucket];
        if (arr.length === 0) return null;

        const showViewAll = !filterBucket && arr.length > 6;

        return (
          <section key={bucket} className="scroll-mt-24">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{BUCKET_LABEL[bucket]}</h2>
              {showViewAll && (
                <Button asChild variant="link" className="h-auto p-0 text-amber-400">
                  <a href={`?bucket=${bucket}`}>View all</a>
                </Button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {arr.slice(0, 6).map((it) => (
                <FancyCard
                  key={it.href}
                  href={it.href}
                  title={it.title}
                  summary={it.summary}
                  cover={it.cover}
                  date={it.date}
                  tags={it.tags}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
