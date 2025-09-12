// src/components/FancyCard.tsx
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  summary?: string;
  cover?: string;
  date?: string;      // ISO string
  tags?: string[];
  className?: string;
};

export default function FancyCard({
  href,
  title,
  summary,
  cover,
  date,
  tags = [],
  className,
}: Props) {
  const dt = date ? new Date(date) : null;
  const dateLabel =
    dt && !Number.isNaN(dt.getTime())
      ? dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : undefined;

  const shown = tags.slice(0, 3);
  const more = tags.length - shown.length;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-black/5 bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:shadow-md dark:bg-neutral-900/70 dark:ring-white/10",
        className
      )}
    >
      {/* Click target */}
      <Link href={href} className="absolute inset-0 z-[1]">
        <span className="sr-only">{title}</span>
      </Link>

      {/* Media header */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-gradient-to-b from-amber-50 to-rose-50 dark:from-neutral-800 dark:to-neutral-800">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            No Image
          </div>
        )}
      </div>

      {/* Body  (tightened top padding so the title sits closer to the media) */}
      <div className="p-4 pt-3">
        {/* Title – pure clamp; ellipsis uses currentColor so it matches the title color */}
        <h3 className="text-[1.05rem]/6 font-semibold tracking-tight text-neutral-900 transition-colors group-hover:text-amber-600 dark:text-neutral-100">
          <span
            className="line-clamp-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as any,
              overflow: "hidden",
            }}
          >
            {title}
          </span>
        </h3>

        {/* Summary */}
        {summary ? (
          <p
            className="mt-2 text-[0.95rem]/6 text-neutral-600 dark:text-neutral-300 line-clamp-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as any,
              overflow: "hidden",
            }}
          >
            {summary}
          </p>
        ) : null}

        {/* Tags + date */}
        {(tags.length > 0 || dateLabel) && (
          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {shown.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 ring-1 ring-black/5 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-white/10"
                >
                  {t}
                </span>
              ))}
              {more > 0 && (
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700 ring-1 ring-black/5 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-white/10">
                  +{more}
                </span>
              )}
            </div>
            {dateLabel && (
              <time
                dateTime={date}
                className="shrink-0 text-sm text-neutral-500 dark:text-neutral-400"
              >
                {dateLabel}
              </time>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
