"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Cpu, Dumbbell, Globe2, Landmark, LineChart, Heart, Users, Briefcase, Sparkles, BookOpen,
  TestTube, Palette, Gamepad2, Lightbulb, Rocket, BoxSelect
} from "lucide-react";

export type GridOption = {
  key: string;            // query value (e.g., "macro" | "prototype")
  label: string;          // visible label
  description?: string;   // helper line
  count?: number;         // optional badge
  iconKey?: string;       // maps to ICONS below
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  // Blog keys (still supported)
  faith: BookOpen, life: Heart, fitness: Dumbbell, relationships: Users, work: Briefcase,
  technology: Cpu, travel: Globe2, economics: LineChart, civics: Landmark, projects: Sparkles,
  research: Sparkles, other: Sparkles,

  // Research “areas”
  macro: LineChart,
  tech: Cpu,
  unity: Gamepad2,
  design: Palette,
  faithphilo: BookOpen,

  // Research “formats” (if you later use them)
  briefing: TestTube,
  note: TestTube,
  compare: BoxSelect,
  dataset: TestTube,

  // Project “stages”
  idea: Lightbulb,
  prototype: Rocket,
  beta: Rocket,
  live: Rocket,
  archived: Sparkles,
};

export default function SidebarCategoryGrid({
  title = "Categories",
  options,
  param = "bucket",       // e.g. "area" or "stage"
  showAll = true,
  onPicked,               // optional: close mobile sheet after pick
  className,
}: {
  title?: string;
  options: GridOption[];
  param?: string;
  showAll?: boolean;
  onPicked?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const active = search.get(param) ?? "";

  function setParam(value?: string) {
    const p = new URLSearchParams(search.toString());
    if (!value) p.delete(param);
    else p.set(param, value);
    router.replace(p.toString() ? `${pathname}?${p}` : pathname);
    onPicked?.();
  }

  return (
    <div className={cn("w-[280px] lg:w-[320px]", className)}>
      <div className="mb-2 px-1 text-sm font-semibold">{title}</div>
      <div className="grid gap-3">
        {showAll && (
          <button
            onClick={() => setParam(undefined)}
            aria-pressed={!active}
            className={cn(
              "relative grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border p-3 text-left transition",
              "border-white/12 bg-white/6 hover:bg-white/10",
              !active && "ring-2 ring-amber-400/60"
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/20 font-semibold text-amber-600">All</div>
            <div>
              <div className="text-sm font-semibold">All</div>
              <div className="text-xs text-muted-foreground">Show everything</div>
            </div>
          </button>
        )}

        {options.map(({ key, label, description, count, iconKey }) => {
          const on = active === key;
          const Icon = (iconKey && ICONS[iconKey]) || ICONS[key] || Sparkles;
          return (
            <button
              key={key}
              onClick={() => setParam(key)}
              aria-pressed={on}
              className={cn(
                "relative grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border p-3 text-left transition",
                "border-white/12 bg-white/6 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-sm",
                on && "ring-2 ring-amber-400/60"
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">{label}</div>
                {description && <div className="text-xs text-muted-foreground">{description}</div>}
              </div>
              {typeof count === "number" && (
                <Badge variant="secondary" className="rounded-full">{count}</Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
