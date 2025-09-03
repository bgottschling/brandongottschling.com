"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FilterOption = {
  key: string;        // query value (e.g., "faith")
  label: string;      // UI label
  count?: number;     // optional count
  icon?: React.ReactNode;
};

export default function SidebarFilter({
  title = "Categories",
  param = "bucket",
  options,
  showAll = true,
}: {
  title?: string;
  param?: string;
  options: FilterOption[];
  showAll?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const active = search.get(param) ?? "";

  function setParam(value?: string) {
    const p = new URLSearchParams(search.toString());
    if (!value) p.delete(param);
    else p.set(param, value);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="px-2 pb-2 text-sm font-semibold">{title}</div>
      <Separator className="opacity-40" />

      <ScrollArea className="mt-2 max-h-[calc(100dvh-14rem)] pr-2">
        <nav className="grid gap-1">
          {showAll && (
            <button
              onClick={() => setParam(undefined)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-white/10",
                active === "" && "bg-amber-400/20 ring-1 ring-amber-400/50 text-foreground"
              )}
              aria-pressed={active === ""}
            >
              <div className="flex-1">All</div>
            </button>
          )}

          {options.map(({ key, label, count, icon }) => {
            const on = active === key;
            return (
              <button
                key={key}
                onClick={() => setParam(key)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-white/10",
                  on && "bg-amber-400/20 ring-1 ring-amber-400/50 text-foreground"
                )}
                aria-pressed={on}
              >
                {icon && <span className="text-muted-foreground">{icon}</span>}
                <span className="flex-1">{label}</span>
                {typeof count === "number" && (
                  <Badge variant="secondary" className="rounded-full">{count}</Badge>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
