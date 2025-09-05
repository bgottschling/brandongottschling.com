"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ExecutiveSummary({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  if (!items?.length) return null;

  return (
    <Card className={cn("border-white/20 bg-white/80 backdrop-blur dark:bg-neutral-900/70", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="text-sm font-semibold tracking-tight mb-2">Executive Summary</div>
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          {items.map((t, i) => (
            <li key={i} className="pl-4">
              <span className="align-middle">{t}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
