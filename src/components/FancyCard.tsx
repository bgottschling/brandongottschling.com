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

function Shimmer() {
  return (
    <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-black/[0.03] to-black/[0.06] dark:from-white/[0.03] dark:to-white/[0.06]" />
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
  priority = false,
}: Props) {
  const [loaded, setLoaded] = React.useState(false);
  const [broken, setBroken] = React.useState(false);

  const showImage = !!cover && !broken;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_20px_-10px_rgba(0,0,0,0.25)] transition hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-zinc-900"
      , className)}
    >
      {/* MEDIA */}
      <div className="relative aspect-[16/9] min-h-[160px] w-full overflow-hidden rounded-t-2xl bg-gradient-to-b from-amber-50 to-rose-50 dark:from-neutral-800 dark:to-neutral-800">
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

      {/* BODY */}
      <div className="p-4 md:p-5">
        {/* Title: remove default h3 margins, add tight top spacing */}
        <h3 className="m-0 mt-2 text-lg font-semibold leading-snug tracking-tight">
          <Link
            href={href}
            className={cn(
              // Default: amber text so the line-clamp ellipsis matches
              "text-amber-700 dark:text-amber-300",
              // On hover/focus: upgrade to gradient
              "hover:text-transparent focus:text-transparent bg-clip-text hover:bg-gradient-to-r focus:bg-gradient-to-r hover:from-amber-600 hover:to-amber-500 focus:from-amber-600 focus:to-amber-500",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            )}
          >
            <span className="line-clamp-2">{title}</span>
          </Link>
        </h3>

        {/* Subtle accent for summary only */}
        {summary ? (
          <div className="mt-2 rounded-lg bg-amber-50/55 p-3 dark:bg-amber-300/5">
            <p className="m-0 line-clamp-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              {summary}
            </p>
          </div>
        ) : null}

        {/* Tags + Date (neutral base) */}
        {(tags?.length || date) && (
          <div className="mt-4 flex items-end justify-between gap-3">
            {tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200"
                  >
                    {t}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span />
            )}
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
        )}
      </div>

      {/* Click target overlay */}
      <Link href={href} className="absolute inset-0" aria-label={title} />
    </article>
  );
}
