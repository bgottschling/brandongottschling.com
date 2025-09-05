"use client";

import * as React from "react";
import type { Experience } from "@/data/cv";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarDays, MapPin, CheckCircle2, Target, Building2, Info } from "lucide-react";

export default function ExperienceView({
  items,
  showPlaceholders = false, // set true temporarily to visualize missing scope/metrics
}: {
  items: Experience[];
  showPlaceholders?: boolean;
}) {
  if (!items?.length) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {items.map((exp, idx) => {
        const hasScope = Boolean(exp.scope && exp.scope.trim().length > 0);
        const metrics = Array.isArray(exp.metrics) ? exp.metrics.filter(Boolean) : [];
        const hasMetrics = metrics.length > 0;

        if (showPlaceholders && (!hasScope || !hasMetrics)) {
          // Helpful one-time warning in the console so you know which item is missing
          // eslint-disable-next-line no-console
          console.warn("[CV] Missing fields:",
            { company: exp.company, role: exp.role, hasScope, metricsCount: metrics.length }
          );
        }

        return (
          <Card
            key={`${exp.company}-${exp.role}-${exp.start}-${idx}`}
            className="border-white/15 bg-white/70 backdrop-blur dark:bg-neutral-900/60"
          >
            <CardContent className="p-4 sm:p-5">
              {/* Header */}
              <div className="flex flex-col gap-1 sm:gap-1.5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-base sm:text-lg font-semibold leading-tight">
                    {exp.role}
                    {exp.org ? <span className="text-muted-foreground font-normal"> · {exp.org}</span> : null}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{exp.company}</span>
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

              {/* Scope */}
              {hasScope ? (
                <div className="mt-3 rounded-md bg-black/[0.03] dark:bg-white/[0.04] p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Scope</div>
                  <p className="text-sm leading-relaxed">{exp.scope}</p>
                </div>
              ) : showPlaceholders ? (
                <div className="mt-3 rounded-md border border-dashed border-border p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-2">
                    <Info className="h-3.5 w-3.5" /> Scope
                  </div>
                  <p className="text-sm text-muted-foreground">Add a one-line scope (what you owned/influenced).</p>
                </div>
              ) : null}

              {/* Metrics */}
              {hasMetrics ? (
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
              ) : showPlaceholders ? (
                <div className="mt-3 rounded-md border border-dashed border-border p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-2">
                    <Target className="h-3.5 w-3.5" /> Key Results
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add 2–4 measurable results (mechanism → metric → impact).
                  </p>
                </div>
              ) : null}

              {/* Highlights */}
              {exp.bullets?.length ? (
                <div className="mt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Highlights</div>
                  <ul className="space-y-1.5">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="text-sm leading-relaxed pl-4">
                        <span className="mr-2">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
