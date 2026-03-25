"use client";

import * as React from "react";
import type { SkillGroup } from "@/data/cv";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/FadeIn";

export default function SkillsView({ groups, ats = false }: { groups: SkillGroup[]; ats?: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      {groups.map((g, idx) => (
        <FadeIn key={g.name} delay={idx * 0.06}>
          <section
            className={cn(
              "rounded-2xl border border-white/10 bg-white/5 p-5",
              ats && "bg-transparent"
            )}
          >
            <h3 className="mb-3 text-base font-semibold leading-tight">{g.name}</h3>
            <ul className="space-y-1.5 text-sm leading-relaxed marker:text-muted-foreground">
              {g.items.map((i) => (
                <li key={i} className="list-disc list-inside">{i}</li>
              ))}
            </ul>
          </section>
        </FadeIn>
      ))}
    </div>
  );
}
