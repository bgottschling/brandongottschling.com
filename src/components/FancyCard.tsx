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
        "not-prose h-full flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_1px_20px_-10px_rgba(0,0,0,0.25)] transition hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-zinc-900",
        className
      )}
    >
      {/* MEDIA */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-b from-amber-50 to-rose-50 dark:from-neutral-800 dark:to-neutral-800">
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

      {/* CONTENT (grows) */}
      <div className="flex grow flex-col p-4 md:p-5">
        {/* Title: smaller & tighter margin */}
        <h3 className="m-0 mt-1.5 text-[1.05rem] leading-tight tracking-tight sm:text-[1.1rem] font-semibold">
          <Link
            href={href}
            className="text-amber-700 underline-offset-[6px] hover:underline dark:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            <span className="line-clamp-2">{title}</span>
          </Link>
        </h3>

        {/* Summary band: higher contrast warm gradient, tighter padding */}
        {summary ? (
          <div className="-mx-4 mt-2 px-4 py-2 md:-mx-5 md:px-5 bg-gradient-to-r from-amber-200/90 via-amber-50/90 to-rose-200/90 dark:from-amber-300/15 dark:via-amber-300/10 dark:to-rose-300/15 border-t border-amber-200/80 dark:border-amber-300/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            <p className="m-0 line-clamp-3 text-[0.95rem] leading-6 text-neutral-800 dark:text-neutral-200">
              {summary}
            </p>
          </div>
        ) : null}

        {/* FOOTER (fixed height; tags never wrap; date pinned right) */}
        {(tags?.length || date) && (
          <div className="mt-auto pt-4">
            <div className="relative flex items-center justify-between min-h-[44px]">
              {/* Single-line, overflow-masked tags row */}
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

      {/* Full-card click target */}
      <Link href={href} className="absolute inset-0" aria-label={title} />
    </article>
  );
}
