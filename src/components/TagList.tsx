// src/components/TagList.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function TagList({
  tags = [],
  limit = 4,
  className,
}: {
  tags?: string[];
  limit?: number;
  className?: string;
}) {
  const shown = tags.slice(0, limit);
  const extra = tags.length - shown.length;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} aria-label="Tags">
      {shown.map((t) => (
        <span
          key={t}
          className="inline-flex items-center rounded-full border border-black/5 bg-black/[.03] px-2 py-0.5 text-[11px] leading-4 text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
        >
          {t}
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center rounded-full border border-black/5 bg-black/[.03] px-2 py-0.5 text-[11px] leading-4 text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
          +{extra}
        </span>
      )}
    </div>
  );
}
