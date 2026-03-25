"use client";

import * as React from "react";
import type { Experience } from "@/data/cv";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/FadeIn";

function parseDate(s: string): Date {
  if (s === "Present") return new Date();
  const parts = s.split(" ");
  if (parts.length === 2) {
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    return new Date(parseInt(parts[1]), months[parts[0]] ?? 0);
  }
  return new Date(parseInt(s), 0);
}

function monthDiff(a: Date, b: Date): number {
  return Math.max(1, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

const BAR_COLORS = [
  "bg-amber-500 dark:bg-amber-400",
  "bg-cyan-500 dark:bg-cyan-400",
  "bg-indigo-400 dark:bg-indigo-400",
  "bg-emerald-400 dark:bg-emerald-400",
  "bg-rose-400 dark:bg-rose-400",
  "bg-amber-300 dark:bg-amber-600",
];

function abbreviate(company: string): string {
  if (company.includes("BD")) return "BD";
  if (company.includes("Warner")) return "WBD";
  if (company.includes("Tricentis")) return "Tricentis";
  if (company.includes("Alfresco")) return "Alfresco";
  if (company.includes("Vertafore")) return "Vertafore";
  if (company.includes("Encompass")) return "Encompass";
  return company.split(" ")[0];
}

export default function CareerTimeline({ experiences }: { experiences: Experience[] }) {
  if (!experiences?.length) return null;

  const spans = experiences.map((exp) => ({
    company: abbreviate(exp.company),
    role: exp.role,
    start: parseDate(exp.start),
    end: parseDate(exp.end ?? "Present"),
    isCurrent: !exp.end || exp.end === "Present",
  }));

  // Sort chronologically (earliest first)
  const sorted = [...spans].sort((a, b) => a.start.getTime() - b.start.getTime());

  const earliest = sorted[0].start;
  const latest = new Date();
  const totalMonths = monthDiff(earliest, latest);

  // Each year gets ~90px so shorter tenures still have room for labels
  const years = latest.getFullYear() - earliest.getFullYear() + 1;
  const minWidth = Math.max(700, years * 90);

  return (
    <FadeIn>
      <div className="mb-6 rounded-xl border border-white/10 bg-white/50 backdrop-blur p-4 dark:bg-neutral-900/50">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Career Timeline</div>

        {/* Scrollable container — scrollbar hidden, scroll-wheel works on hover */}
        <div
          className="overflow-x-auto pb-2 -mx-1 px-1"
          style={{
            scrollbarWidth: "none",       /* Firefox */
            msOverflowStyle: "none",      /* IE/Edge */
          }}
        >
          {/* Hide WebKit scrollbar via inline style workaround */}
          <style>{`.timeline-scroll::-webkit-scrollbar { display: none; }`}</style>
          <div
            className="timeline-scroll overflow-x-auto"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              minWidth: `${minWidth}px`,
            }}
          >
            {/* Year markers */}
            <div className="relative h-5 mb-1">
              {Array.from(
                { length: years },
                (_, i) => earliest.getFullYear() + i
              ).map((year) => {
                const offset = ((year - earliest.getFullYear()) * 12 / totalMonths) * 100;
                return (
                  <span
                    key={year}
                    className="absolute text-[10px] text-muted-foreground/60"
                    style={{ left: `${Math.min(offset, 98)}%` }}
                  >
                    {year}
                  </span>
                );
              })}
            </div>

            {/* Bars */}
            <div className="space-y-1.5">
              {sorted.map((span, i) => {
                const startPx = (monthDiff(earliest, span.start) / totalMonths) * 100;
                const endPx = (monthDiff(earliest, span.end) / totalMonths) * 100;
                const width = Math.max(3, endPx - startPx);

                return (
                  <div key={i} className="relative h-7 flex items-center">
                    <div
                      className={cn(
                        "absolute h-6 rounded transition-all duration-200",
                        BAR_COLORS[i % BAR_COLORS.length],
                        span.isCurrent && "ring-1 ring-amber-400/50"
                      )}
                      style={{
                        left: `${startPx}%`,
                        width: `${width}%`,
                        minWidth: "4rem",
                      }}
                    >
                      <span className="absolute inset-0 flex items-center px-2 text-[11px] font-semibold text-white whitespace-nowrap">
                        {span.company}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
