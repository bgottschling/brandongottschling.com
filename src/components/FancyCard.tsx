// src/components/FancyCard.tsx
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type FancyCardProps = {
  href: string;
  title: string;
  summary?: string;
  cover?: string;
  date?: string;      // ISO string
  tags?: string[];
  priority?: boolean; // pass true for the first item in a section
};

export default function FancyCard({
  href,
  title,
  summary,
  cover,
  date,
  tags = [],
  priority = false,
}: FancyCardProps) {
  const maxTags = 3;
  const shown = tags.slice(0, maxTags);
  const extra = Math.max(0, tags.length - shown.length);

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm",
        "transition hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
      )}
    >
      {/* Media (no crop): padded frame + object-contain */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl border-b border-black/5 bg-gradient-to-b from-amber-50 to-rose-50 dark:from-zinc-800 dark:to-zinc-800/60">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-2"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-xs text-zinc-400">
            {/* graceful placeholder */}
            No Image
          </div>
        )}
      </div>

      {/* Title band (subtle tint; no underline) */}
      <div className="bg-amber-50/60 px-4 pb-3 pt-4 dark:bg-amber-400/10">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight">
          <Link
            href={href}
            className="after:absolute after:inset-0"
            // the after anchor makes the whole header area clickable without extra markup
          >
            {title}
          </Link>
        </h3>
        {summary && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
            {summary}
          </p>
        )}
      </div>

      {/* Body spacer so footer anchors to bottom (equal height) */}
      <div className="flex-1" />

      {/* Footer: tags + date */}
      <footer className="flex items-end justify-between gap-3 px-4 pb-4 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {shown.map((t) => (
            <span
              key={t}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {t}
            </span>
          ))}
          {extra > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              +{extra}
            </span>
          )}
        </div>

        {date && (
          <time
            dateTime={date}
            className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400"
          >
            {new Date(date).toLocaleDateString(undefined, {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </time>
        )}
      </footer>
    </article>
  );
}
