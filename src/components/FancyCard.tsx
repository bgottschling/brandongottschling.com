// src/components/FancyCard.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import CardThumbnailCanvas from "@/components/CardThumbnailCanvas";

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
  contentType?: string;
  slug?: string;
};

/* ── variant-driven style maps ── */

const FOCUS_OUTLINE: Record<CardVariant, string> = {
  blog: "focus-visible:outline-amber-400",
  project: "focus-visible:outline-cyan-400",
  research: "focus-visible:outline-indigo-400",
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

const HOVER_COLOR: Record<CardVariant, string> = {
  blog: "group-hover:text-amber-200",
  project: "group-hover:text-cyan-200",
  research: "group-hover:text-indigo-200",
};

function FancyCardInner({
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
  contentType,
  slug,
}: Props) {
  const [loaded, setLoaded] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const visibleTags = tags ?? [];
  const showImage = !!cover && !broken;
  const canvasSeed = slug ?? href;
  const canvasType = contentType ?? variant;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-md border border-black/5 bg-white",
        "shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out",
        "hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)]",
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
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-t-md">
        {/* Animated canvas base layer */}
        <CardThumbnailCanvas
          seed={canvasSeed}
          contentType={canvasType}
          className="absolute inset-0 h-full w-full"
        />

        {/* Cover image fades in over canvas when loaded */}
        {showImage && (
          <Image
            src={cover!}
            alt=""
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className={cn(
              "relative z-[1] object-cover transition-all duration-500 group-hover:scale-[1.03]",
              loaded ? "opacity-100" : "opacity-0"
            )}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setLoaded(true)}
            onError={() => setBroken(true)}
          />
        )}

        {/* Badge overlay (top-left) */}
        {badge && (
          <span
            className={cn(
              "absolute left-3 top-3 z-[3] rounded px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider",
              BADGE_COLOR[variant]
            )}
          >
            {badge}
          </span>
        )}

        {/* Title scrim + title + tags */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t to-transparent px-5 pb-4 pt-16",
            SCRIM_GRADIENT[variant]
          )}
        >
          <h3 className="m-0 text-lg font-bold leading-tight tracking-[-0.01em] drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] sm:text-xl">
            <Link
              href={href}
              className={cn(
                "relative z-[6] text-white no-underline transition-colors duration-200",
                HOVER_COLOR[variant]
              )}
            >
              <span className="line-clamp-3">{title}</span>
            </Link>
          </h3>

          {visibleTags.length > 0 && (
            <div className="mt-2 flex gap-1.5">
              {visibleTags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="shrink-0 rounded-full bg-white/15 backdrop-blur-sm border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/90"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary stripe */}
      {summary && (
        <div
          className={cn(
            "flex-1 border-y px-5 py-3",
            STRIPE_BG[variant]
          )}
        >
          <p className="m-0 line-clamp-3 text-[0.9rem] leading-relaxed text-neutral-700 dark:text-neutral-200/90">
            {summary}
          </p>
        </div>
      )}

      {/* Footer — date pinned right */}
      {date && (
        <div className="mt-auto px-5 pb-3 pt-2">
          <div className="flex items-center justify-end">
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
          </div>
        </div>
      )}
    </article>
  );
}

const FancyCard = React.memo(FancyCardInner);
export default FancyCard;
