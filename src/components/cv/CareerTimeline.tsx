"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import Image from "next/image";
import type { Experience } from "@/data/cv";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/FadeIn";
import { Building2 } from "lucide-react";

/* ── helpers ── */

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

function formatDate(d: Date, isCurrent: boolean): string {
  if (isCurrent) return "Present";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

const BAR_COLORS = [
  "bg-amber-500 dark:bg-amber-400",
  "bg-cyan-500 dark:bg-cyan-400",
  "bg-indigo-400 dark:bg-indigo-400",
  "bg-emerald-400 dark:bg-emerald-400",
  "bg-rose-400 dark:bg-rose-400",
  "bg-amber-300 dark:bg-amber-600",
];

// No overrides needed — cv.ts now points to icon versions directly

/* ── Floating tooltip that escapes overflow containers ── */

function FloatingTooltip({
  barRef,
  company,
  role,
  startDate,
  endDate,
  isCurrent,
}: {
  barRef: React.RefObject<HTMLDivElement | null>;
  company: string;
  role: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
}) {
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);

  React.useEffect(() => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  }, [barRef]);

  if (!pos) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        top: pos.top - window.scrollY,
        left: pos.left - window.scrollX,
        transform: "translateX(-50%)",
      }}
    >
      <div className="mx-auto h-0 w-0 border-x-[5px] border-b-[5px] border-x-transparent border-b-neutral-900 dark:border-b-neutral-700" />
      <div className="rounded-md bg-neutral-900 px-3 py-2 text-[11px] text-white whitespace-nowrap shadow-xl dark:bg-neutral-700">
        <div className="font-semibold text-xs">{company}</div>
        <div className="text-white/70 text-[10px]">{role}</div>
        <div className="text-white/60 text-[10px] mt-0.5">
          {formatDate(startDate, false)} – {formatDate(endDate, isCurrent)}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── component ── */

export default function CareerTimeline({ experiences }: { experiences: Experience[] }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const barRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  if (!experiences?.length) return null;

  const spans = experiences.map((exp) => ({
    company: exp.company,
    role: exp.role,
    logo: exp.logo,
    start: parseDate(exp.start),
    end: parseDate(exp.end ?? "Present"),
    isCurrent: !exp.end || exp.end === "Present",
  }));

  const sorted = [...spans].sort((a, b) => a.start.getTime() - b.start.getTime());

  const earliest = sorted[0].start;
  const latest = new Date();
  const totalMonths = Math.max(1, monthsBetween(earliest, latest));

  // Generous width — 120px per year for roomy bars and clear badges
  const years = latest.getFullYear() - earliest.getFullYear() + 1;
  const minWidth = Math.max(900, years * 120);

  /* ── drag-to-scroll ── */
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeftRef = React.useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeftRef.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  return (
    <FadeIn>
      <div className="mb-6 rounded-xl border border-white/10 bg-white/50 backdrop-blur p-4 sm:p-5 dark:bg-neutral-900/50">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-4">Career Timeline</div>

        {/* Drag-to-scroll container */}
        <div
          ref={scrollRef}
          className="timeline-scroll overflow-x-auto pb-3 -mx-1 px-1 select-none"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            cursor: "grab",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <style>{`.timeline-scroll::-webkit-scrollbar { display: none; }`}</style>

          <div style={{ minWidth: `${minWidth}px` }}>
            {/* Year markers */}
            <div className="relative h-6 mb-2">
              {Array.from(
                { length: years },
                (_, i) => earliest.getFullYear() + i
              ).map((year) => {
                const offset = ((year - earliest.getFullYear()) * 12 / totalMonths) * 100;
                return (
                  <span
                    key={year}
                    className="absolute text-[11px] font-medium text-muted-foreground/50"
                    style={{ left: `${Math.min(offset, 98)}%` }}
                  >
                    {year}
                  </span>
                );
              })}
            </div>

            {/* Bars */}
            <div className="space-y-2">
              {sorted.map((span, i) => {
                const startOffset = (monthsBetween(earliest, span.start) / totalMonths) * 100;
                const endOffset = (monthsBetween(earliest, span.end) / totalMonths) * 100;
                const barWidth = Math.max(2, endOffset - startOffset);

                return (
                  <div key={i} className="relative h-10 flex items-center">
                    <div
                      ref={(el) => { barRefs.current[i] = el; }}
                      className={cn(
                        "absolute h-9 rounded-lg transition-all duration-200",
                        BAR_COLORS[i % BAR_COLORS.length],
                        span.isCurrent && "ring-1 ring-amber-400/50",
                        "hover:brightness-110 hover:shadow-md"
                      )}
                      style={{
                        left: `${startOffset}%`,
                        width: `${barWidth}%`,
                        minWidth: "2.5rem",
                      }}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {/* Brand badge icon */}
                      <span className="absolute inset-0 flex items-center justify-center">
                        {span.logo ? (
                          <Image
                            src={span.logo}
                            alt={span.company}
                            width={28}
                            height={28}
                            className="h-6 w-6 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                            draggable={false}
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-white/80" />
                        )}
                      </span>
                    </div>

                    {/* Portal tooltip — escapes overflow container */}
                    {hovered === i && (
                      <FloatingTooltip
                        barRef={{ current: barRefs.current[i] }}
                        company={span.company}
                        role={span.role}
                        startDate={span.start}
                        endDate={span.end}
                        isCurrent={span.isCurrent}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-2 text-center text-[10px] text-muted-foreground/40">
          Drag to scroll
        </div>
      </div>
    </FadeIn>
  );
}
