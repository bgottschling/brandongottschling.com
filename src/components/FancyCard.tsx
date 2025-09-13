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
  /** Set true if a parent already wraps this card in a <Link> to avoid nested anchors */
  disableLink?: boolean;
};

// Tunable, keeps card heights consistent across the grid
const TITLE_MIN_H_PX = 54;    // ~2 lines
const SUMMARY_MIN_H_PX = 78;  // ~3 lines

function CardInner({
  href,
  title,
  summary,
  cover,
  date,
  tags,
  priority,
}: Omit<Props, "className" | "disableLink">) {
  const [imgOk, setImgOk] = React.useState(true);

  return (
    <article
      className={cn(
        "h-full overflow-hidden rounded-2xl border border-black/5 bg-white",
        "shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)] transition-all",
        "hover:-translate-y-[1px] hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.55)]",
        "dark:border-white/10 dark:bg-zinc-900"
      )}
    >
      {/* Media */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-gradient-to-b from-amber-50 to-rose-50 dark:from-neutral-800 dark:to-neutral-800">
        {cover && imgOk ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            No Image
          </div>
        )}
      </div>

      {/* Title band (tight spacing, fixed min-height) */}
      <div
        className="px-4 pt-3 pb-2 md:px-5"
        style={{ minHeight: TITLE_MIN_H_PX }}
      >
        <h3 className="m-0 text-[1.06rem] leading-snug tracking-tight font-semibold sm:text-[1.12rem]">
          <span className="line-clamp-2 text-amber-800 dark:text-amber-300">
            {title}
          </span>
        </h3>
      </div>

      {/* Summary band (higher contrast but not shouty) */}
      <div
        className={cn(
          "px-4 py-3 md:px-5",
          "bg-gradient-to-r from-amber-50 via-amber-50/80 to-amber-100/70",
          "ring-1 ring-inset ring-amber-100/80",
          "dark:from-amber-200/10 dark:via-amber-200/10 dark:to-amber-200/10 dark:ring-white/10"
        )}
        style={{ minHeight: SUMMARY_MIN_H_PX }}
      >
        {summary ? (
          <p className="m-0 line-clamp-3 text-[0.95rem] leading-6 text-neutral-800 dark:text-neutral-100/90">
            {summary}
          </p>
        ) : (
          <div className="h-[1px] opacity-0" />
        )}
      </div>

      {/* Footer (stable row: tags scroll, date pinned) */}
      {(tags?.length || date) && (
        <div className="px-4 pb-4 pt-3 md:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex gap-2 overflow-x-auto overscroll-x-contain scrollbar-none">
              {(tags ?? []).slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="shrink-0 whitespace-nowrap rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200"
                >
                  {t}
                </span>
              ))}
              {tags && tags.length > 6 && (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
                  +{tags.length - 6}
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

      {/* Click affordance for keyboard users if the whole card is linked */}
      <span className="sr-only">Open: {title}</span>
    </article>
  );
}

export default function FancyCard({
  href,
  title,
  summary,
  cover,
  date,
  tags,
  className,
  priority,
  disableLink = false,
}: Props) {
  const body = (
    <div className={cn("group h-full", className)}>
      <CardInner
        href={href}
        title={title}
        summary={summary}
        cover={cover}
        date={date}
        tags={tags}
        priority={priority}
      />
    </div>
  );

  // If you ever wrap FancyCard in a parent <Link>, pass disableLink to avoid nested anchors
  if (disableLink) return body;

  return (
    <Link
      href={href}
      className="block h-full focus-visible:outline-none"
      prefetch
    >
      {body}
    </Link>
  );
}
