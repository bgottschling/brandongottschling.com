// src/components/FancyCard.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  summary?: string;
  cover?: string;
  date?: string;
  tags?: string[];
  className?: string;
  priority?: boolean;
  /** If the parent already wraps this in a <Link>, set true to avoid a nested anchor. */
  disableOverlay?: boolean;
};

// Height guards to keep cards uniform across the grid
const TITLE_MIN_H = 48;   // ~2 lines
const SUMMARY_MIN_H = 78; // ~3 lines
const MAX_TAGS = 3;       // keep date pinned; no scrollbars

export default function FancyCard({
  href,
  title,
  summary,
  cover,
  date,
  tags,
  className,
  priority,
  disableOverlay = false,
}: Props) {
  const [imgOk, setImgOk] = React.useState(true);
  const visibleTags = (tags ?? []).slice(0, MAX_TAGS);
  const extraCount = (tags?.length ?? 0) - visibleTags.length;

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white",
        "shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)] transition-all",
        "hover:-translate-y-[1px] hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.55)]",
        "dark:border-white/10 dark:bg-zinc-900",
        className
      )}
    >
      {/* Full-card click target without underlining content */}
      {!disableOverlay && (
        <Link
          href={href}
          aria-label={title}
          className="absolute inset-0 z-[5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        />
      )}

      {/* Media */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-gradient-to-b from-amber-50 to-rose-50 dark:from-neutral-800 dark:to-neutral-800">
        {cover && imgOk ? (
          <Image
            fill
            src={cover}
            alt=""
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            priority={priority}
            className="rounded-t-2xl object-cover"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            No Image
          </div>
        )}
      </div>

      {/* Title band (tight spacing; only the title text is a link) */}
      <div className="px-4 pb-1 pt-2 md:px-5" style={{ minHeight: TITLE_MIN_H }}>
        <h3 className="m-0 text-[1.05rem] font-semibold leading-snug tracking-tight sm:text-[1.1rem]">
          <Link
            href={href}
            className="relative z-[6] text-amber-800 underline-offset-[4px] hover:underline dark:text-amber-300"
          >
            <span className="line-clamp-2">{title}</span>
          </Link>
        </h3>
      </div>

      {/* Summary band – contrasty but calm; no underlines */}
      <div
        className={cn(
          "px-4 py-3 md:px-5",
          "bg-gradient-to-r from-amber-50/85 via-amber-50 to-amber-100/80 ring-1 ring-inset ring-amber-100/80",
          "dark:from-amber-200/10 dark:via-amber-200/10 dark:to-amber-200/10 dark:ring-white/10"
        )}
        style={{ minHeight: SUMMARY_MIN_H }}
      >
        {summary ? (
          <p className="m-0 line-clamp-3 text-[0.95rem] leading-6 text-neutral-800 dark:text-neutral-100/90">
            {summary}
          </p>
        ) : (
          <div className="h-[1px] opacity-0" />
        )}
      </div>

      {/* Footer – tags never scroll; date stays pinned */}
      {(visibleTags.length > 0 || date) && (
        <div className="px-4 pb-4 pt-3 md:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap gap-2">
              {visibleTags.map((t) => (
                <span
                  key={t}
                  className="shrink-0 whitespace-nowrap rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200"
                >
                  {t}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
                  +{extraCount}
                </span>
              )}
            </div>
            {date && (
              <time
                dateTime={date}
                className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
              >
                {new Date(date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </time>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
