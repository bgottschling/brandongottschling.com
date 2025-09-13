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
};

// tweakable band heights (keep cards consistent)
const TITLE_MIN_H = "56px";   // ~2 lines at ~1.05rem
const SUMMARY_MIN_H = "76px"; // ~3 lines at 0.95rem

export default function FancyCard({
  href,
  title,
  summary,
  cover,
  date,
  tags,
  className,
  priority = false,
}: Props) {
  const [loaded, setLoaded] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const showImage = !!cover && !broken;

  return (
    <Link
      href={href}
      className="group block h-full"
      aria-label={title}
      prefetch
    >
      <article
        className={cn(
          "h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_24px_-16px_rgba(0,0,0,0.35)] transition-all",
          "hover:shadow-[0_14px_36px_-18px_rgba(0,0,0,0.45)] hover:-translate-y-[1px]",
          "dark:border-white/10 dark:bg-zinc-900",
          className
        )}
      >
        {/* Media */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-b from-amber-50 to-rose-50 dark:from-neutral-800 dark:to-neutral-800">
          {showImage ? (
            <Image
              src={cover!}
              alt=""
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className={cn(
                "object-cover transition-transform duration-500",
                "group-hover:scale-[1.03]",
                loaded ? "opacity-100" : "opacity-0"
              )}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              onLoad={() => setLoaded(true)}
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-0px)] flex-col">
          {/* Title band (consistent height, tight spacing) */}
          <div
            className="px-4 pt-3 pb-1 md:px-5"
            style={{ minHeight: TITLE_MIN_H }}
          >
            <h3 className="m-0 text-[1.05rem] leading-snug tracking-tight sm:text-[1.1rem] font-semibold">
              <span className="line-clamp-2 text-amber-800 dark:text-amber-300">
                {title}
              </span>
            </h3>
          </div>

          {/* Summary band (subtle, low-saturation warm tint) */}
          <div
            className={cn(
              "-mx-4 md:-mx-5 px-4 md:px-5 py-2 border-t",
              // very light warm gradient
              "bg-gradient-to-r from-amber-50/70 via-amber-50/40 to-amber-50/0",
              "border-amber-100/80 dark:border-amber-300/20",
              "dark:from-amber-200/10 dark:via-amber-200/5 dark:to-transparent"
            )}
            style={{ minHeight: SUMMARY_MIN_H }}
          >
            {summary ? (
              <p className="m-0 line-clamp-3 text-[0.95rem] leading-6 text-neutral-800 dark:text-neutral-200">
                {summary}
              </p>
            ) : (
              // spacer keeps consistent height even without summary
              <div className="h-[1px] opacity-0" />
            )}
          </div>

          {/* Footer (fixed row; tags never wrap; date pinned) */}
          {(tags?.length || date) && (
            <div className="mt-auto px-4 pb-4 pt-3 md:px-5">
              <div className="relative flex min-h-[44px] items-center justify-between">
                {/* single line tags with fade mask so date alignment never moves */}
                <div className="min-w-0 grid grid-flow-col auto-cols-max gap-2 overflow-hidden pe-6 [mask-image:linear-gradient(to_right,black_85%,transparent)]">
                  {(tags ?? []).slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="shrink-0 whitespace-nowrap rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200"
                    >
                      {t}
                    </span>
                  ))}
                  {tags && tags.length > 3 && (
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>

                {date && (
                  <time
                    dateTime={date}
                    className="ml-3 shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
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
        </div>
      </article>
    </Link>
  );
}
