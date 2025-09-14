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
  disableOverlay?: boolean;
};

const TITLE_MIN_H = 48;   // ~2 lines
const SUMMARY_MIN_H = 78; // ~3 lines
const MAX_TAGS = 9999;    // we now fade instead of capping; keep all

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
  const [loaded, setLoaded] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const visibleTags = (tags ?? []).slice(0, MAX_TAGS);

  // Show image if cover is provided and not broken
  const showImage = !!cover && !broken;

  // Simple shimmer placeholder
  function Shimmer() {
    return (
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800" />
    );
  }

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
      {!disableOverlay && (
        <Link
          href={href}
          aria-label={title}
          className="absolute inset-0 z-[5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        />
      )}

      {/* Media */}
      <div className="relative aspect-[16/9] min-h-[160px] w-full overflow-hidden rounded-t-2xl bg-gradient-to-b from-amber-50 to-rose-50 dark:from-neutral-800 dark:to-neutral-800 mt-0 mb-0">
        {showImage ? (
          <>
        {!loaded && <Shimmer />}
        <Image
          src={cover!}
          alt=""
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-[1.03]",
            loaded ? "opacity-100" : "opacity-0"
          )}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
        />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        No Image
          </div>
        )}
      </div>

      {/* Title band */}
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

      {/* Summary band */}
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

      {/* Footer — single row tags with fade, date pinned */}
      {(visibleTags.length > 0 || date) && (
        <div className="px-4 pb-4 pt-3 md:px-5">
          <div className="relative flex items-center gap-3">
            {/* Tags rail (no wrap, no scrollbars, fade on the right) */}
            <div className="min-w-0 flex-1">
              <div
                className="flex gap-2 whitespace-nowrap overflow-hidden pr-24"
                // Fade the last ~20% so tags visually disappear behind the date
                style={{
                  maskImage: "linear-gradient(to right, black 80%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to right, black 80%, transparent 100%)",
                }}
              >
                {visibleTags.map((t) => (
                  <span
                    key={t}
                    className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Date pinned at the far right */}
            {date && (
              <time
                dateTime={date}
                className="z-[1] shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
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
