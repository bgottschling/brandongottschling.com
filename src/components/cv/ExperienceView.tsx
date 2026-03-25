"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Experience } from "@/data/cv";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CalendarDays, MapPin, CheckCircle2, Target, Building2, ChevronDown } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

const PREVIEW_BULLETS = 2;

function ExperienceCard({ exp, idx }: { exp: Experience; idx: number }) {
  const [expanded, setExpanded] = React.useState(false);

  const hasScope = Boolean(exp.scope?.trim());
  const metrics = Array.isArray(exp.metrics) ? exp.metrics.filter(Boolean) : [];
  const hasMetrics = metrics.length > 0;
  const bullets = exp.bullets ?? [];
  const hasMore = hasMetrics || bullets.length > PREVIEW_BULLETS || (exp.tags?.length ?? 0) > 0;

  return (
    <FadeIn delay={idx * 0.06}>
      <div className="relative flex gap-4 md:gap-6">
        {/* Timeline dot + connector (hidden on mobile) */}
        <div className="hidden md:flex flex-col items-center">
          <div className="h-3 w-3 rounded-full border-2 border-amber-400 bg-white dark:bg-zinc-900 shrink-0 mt-5 z-10" />
          <div className="w-[2px] flex-1 bg-gradient-to-b from-amber-300/60 to-amber-200/20 dark:from-amber-500/40 dark:to-amber-700/10" />
        </div>

        {/* Card */}
        <Card className="flex-1 border-white/15 bg-white/70 backdrop-blur dark:bg-neutral-900/60">
          <CardContent className="p-4 sm:p-5">
            {/* Header */}
            <div className="flex flex-col gap-1 sm:gap-1.5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                {/* Company logo */}
                {exp.logo ? (
                  <div className="mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-black/5 bg-white p-1.5 dark:border-white/10 dark:bg-neutral-800">
                    <Image
                      src={exp.logo}
                      alt={exp.company}
                      width={44}
                      height={44}
                      className="h-auto w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/5 bg-neutral-50 dark:border-white/10 dark:bg-neutral-800">
                    <Building2 className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                )}
                <div>
                  <div className="text-base sm:text-lg font-semibold leading-tight">
                    {exp.role}
                    {exp.org ? <span className="text-muted-foreground font-normal"> · {exp.org}</span> : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {exp.company}
                  </div>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground flex flex-col sm:items-end gap-1">
                <div className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>{exp.start} – {exp.end ?? "Present"}</span>
                </div>
                {exp.location && (
                  <div className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{exp.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scope — always visible */}
            {hasScope && (
              <div className="mt-3 rounded-md bg-black/[0.03] dark:bg-white/[0.04] p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Scope</div>
                <p className="text-sm leading-relaxed">{exp.scope}</p>
              </div>
            )}

            {/* Preview bullets — always visible */}
            {bullets.length > 0 && (
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Highlights</div>
                <ul className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground/50">
                  {bullets.slice(0, PREVIEW_BULLETS).map((b, i) => (
                    <li key={i} className="text-sm leading-relaxed">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expandable section */}
            <AnimatePresence initial={false}>
              {expanded && hasMore && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" as const }}
                  className="overflow-hidden"
                >
                  {/* Metrics */}
                  {hasMetrics && (
                    <div className="mt-3 rounded-md border border-border p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-2">
                        <Target className="h-3.5 w-3.5" /> Key Results
                      </div>
                      <ul className="mt-1 space-y-1.5">
                        {metrics.map((m, i) => (
                          <li key={i} className="text-sm leading-relaxed flex gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 opacity-80" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Remaining bullets */}
                  {bullets.length > PREVIEW_BULLETS && (
                    <div className="mt-3">
                      <ul className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground/50">
                        {bullets.slice(PREVIEW_BULLETS).map((b, i) => (
                          <li key={i} className="text-sm leading-relaxed">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {!!exp.tags?.length && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {exp.tags.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-[11px] py-0.5">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expand/Collapse toggle */}
            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    expanded && "rotate-180"
                  )}
                />
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}

export default function ExperienceView({ items }: { items: Experience[] }) {
  if (!items?.length) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {items.map((exp, idx) => (
        <ExperienceCard key={`${exp.company}-${exp.role}-${exp.start}-${idx}`} exp={exp} idx={idx} />
      ))}
    </div>
  );
}
