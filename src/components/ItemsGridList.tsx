import Link from "next/link";
import FancyCard, { type CardVariant } from "@/components/FancyCard";

export type Item = {
  href: string;
  title: string;
  summary?: string;
  cover?: string;
  date?: string;
  tags?: string[];
  variant?: CardVariant;
  badge?: string;
};

export default function ItemsGridList({
  items,
  view = "grid",
}: {
  items: Item[];
  view?: "grid" | "list";
}) {
  if (view === "list") {
    return (
      <div className="overflow-hidden rounded-md border border-white/10">
        {items.map((it, idx) => (
          <Link
            key={it.href}
            href={it.href}
            className={`block bg-white/5 px-4 py-3 transition hover:bg-white/10 ${
              idx !== 0 ? "border-t border-white/10" : ""
            }`}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div className="text-base font-semibold leading-tight">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.date?.slice(0, 10)}</div>
            </div>
            {it.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{it.summary}</p>}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((it) => (
        <FancyCard
          key={it.href}
          href={it.href}
          title={it.title}
          summary={it.summary}
          cover={it.cover}
          date={it.date}
          tags={it.tags}
          variant={it.variant}
          badge={it.badge}
        />
      ))}
    </div>
  );
}
