// src/components/FancyCard.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import GenerativeThumb from "@/components/GenerativeThumb";

export type CardVariant = "blog" | "project" | "research";

type Props = {
  href: string;
  title: string;
  summary?: string;
  cover?: string;
  date?: string;
  tags?: string[];
  variant?: CardVariant;
  badge?: string;
  className?: string;
  priority?: boolean;
  disableOverlay?: boolean;
};

/* ── variant-driven style maps ── */

const FOCUS_OUTLINE: Record<CardVariant, string> = {
  blog: "focus-visible:outline-amber-400",
  project: "focus-visible:outline-cyan-400",
  research: "focus-visible:outline-indigo-400",
};

const TITLE_COLOR: Record<CardVariant, string> = {
  blog: "text-white",
  project: "text-white",
  research: "text-white",
};

const MEDIA_BG: Record<CardVariant, string> = {
  blog: "bg-gradient-to-b from-amber-50 to-rose-50 dark:from-neutral-800 dark:to-neutral-800",
  project: "bg-gradient-to-b from-cyan-50 to-sky-50 dark:from-neutral-800 dark:to-neutral-800",
  research: "bg-gradient-to-b from-indigo-50 to-violet-50 dark:from-neutral-800 dark:to-neutral-800",
};

const SCRIM_GRADIENT: Record<CardVariant, string> = {
  blog: "from-amber-950/80 via-amber-950/40",
  project: "from-cyan-950/80 via-cyan-950/40",
  research: "from-indigo-950/80 via-indigo-950/40",
};

const STRIPE_BG: Record<CardVariant, string> = {
  blog: "bg-amber-50/80 dark:bg-amber-200/8 border-amber-200/60 dark:border-amber-300/10",
  project: "bg-cyan-50/80 dark:bg-cyan-200/8 border-cyan-200/60 dark:border-cyan-300/10",
  research: "bg-indigo-50/80 dark:bg-indigo-200/8 border-indigo-200/60 dark:border-indigo-300/10",
};

const BADGE_COLOR: Record<CardVariant, string> = {
  blog: "bg-amber-600/90 text-white dark:bg-amber-500/90",
  project: "bg-cyan-600/90 text-white dark:bg-cyan-500/90",
  research: "bg-indigo-600/90 text-white dark:bg-indigo-500/90",
};

export default function FancyCard({
  href,
  title,
  summary,
  cover,
  date,
  tags,
  variant = "blog",
  badge,
  className,
  priority,
  disableOverlay = false,
}: Props) {
  const [loaded, setLoaded] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const visibleTags = tags ?? [];
  const showImage = !!cover && !broken;

  function Shimmer() {
    return (
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800" />
    );
  }

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-md border border-black/5 bg-white",
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
          className={cn(
            "absolute inset-0 z-[5] focus-visible:outline-2 focus-visible:outline-offset-2",
            FOCUS_OUTLINE[variant]
          )}
        />
      )}

      {/* MEDIA + TITLE OVERLAY */}
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-t-md",
          MEDIA_BG[variant],
          "block leading-none text-[0]"
        )}
      >
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
          <GenerativeThumb
            title={title}
            variant={variant}
            className="h-full w-full object-cover"
          />
        )}

        {/* Badge overlay (top-left) */}
        {badge && (
          <span
            className={cn(
              "absolute left-3 top-3 z-[2] rounded px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider",
              BADGE_COLOR[variant]
            )}
          >
            {badge}
          </span>
        )}

        {/* Title scrim + title (bottom of image) */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t to-transparent px-5 pb-4 pt-16",
            SCRIM_GRADIENT[variant]
          )}
        >
          <h3 className="m-0 text-[1.1rem] font-bold leading-snug tracking-tight drop-shadow-sm sm:text-[1.2rem]">
            <Link
              href={href}
              className={cn(
                "relative z-[6] no-underline",
                TITLE_COLOR[variant]
              )}
            >
              <span className="line-clamp-3">{title}</span>
            </Link>
          </h3>
        </div>
      </div>

      {/* Summary stripe */}
      {summary && (
        <div
          className={cn(
            "border-y px-5 py-3",
            STRIPE_BG[variant]
          )}
        >
          <p className="m-0 line-clamp-3 text-[0.9rem] leading-relaxed text-neutral-700 dark:text-neutral-200/90">
            {summary}
          </p>
        </div>
      )}

      {/* Footer */}
      {(visibleTags.length > 0 || date) && (
        <div className="mt-auto px-5 pb-4 pt-3">
          <div className="relative flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div
                className="flex gap-2 overflow-hidden whitespace-nowrap pr-24"
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
