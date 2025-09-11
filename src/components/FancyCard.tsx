// src/components/FancyCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { TagList } from "@/components/TagList";

export default function FancyCard({
  href,
  title,
  summary,
  cover,
  date,
  tags,
  priority = false,
}: {
  href: string;
  title: string;
  summary?: string;
  cover?: string;
  date?: string;
  tags?: string[];
  priority?: boolean;
}) {
  const d =
    date && !Number.isNaN(Date.parse(date))
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : undefined;

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white/70 shadow-sm ring-1 ring-black/[.02] transition hover:shadow-md dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/[.03]">
      <Link
        href={href}
        aria-label={title}
        className="grid h-full grid-rows-[auto_1fr_auto] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {/* Media */}
        <div className="relative overflow-hidden">
          <div className="relative aspect-[16/9]">
            {cover ? (
              <Image
                src={cover}
                alt=""
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                priority={priority}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-amber-100 to-rose-100 dark:from-zinc-800 dark:to-zinc-700" />
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/5 dark:to-white/5" />
        </div>

        {/* Body */}
        <div className="px-4 pb-2 pt-3 sm:px-4">
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {summary && (
            <p className="mt-1 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
              {summary}
            </p>
          )}
        </div>

        {/* Footer (stable height) */}
        <div className="flex items-end justify-between gap-3 px-4 pb-4">
          <TagList tags={tags} limit={4} className="max-w-[85%]" />
          {d && (
            <time
              dateTime={date}
              className="shrink-0 text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
            >
              {d}
            </time>
          )}
        </div>
      </Link>
    </article>
  );
}
