"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search } from "lucide-react";
import { BUCKET_LABEL, type PrimaryCategory } from "@/lib/buckets";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

function setParam(
  pathname: string,
  params: URLSearchParams,
  router: ReturnType<typeof useRouter>,
  key: string,
  value?: string
) {
  const p = new URLSearchParams(params.toString());
  if (!value) p.delete(key);
  else p.set(key, value);
  const q = p.toString();
  router.replace(q ? `${pathname}?${q}` : pathname);
}

export default function FiltersBar({
  bucketKeys,
  placeholder = "Search...",
}: {
  bucketKeys: PrimaryCategory[];
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeBucket =
    (params.get("bucket") as PrimaryCategory | null) ?? ("all" as unknown as PrimaryCategory);
  const activeView = (params.get("view") || "grid") as "grid" | "list";
  const defaultQuery = params.get("q") ?? "";

  return (
    <div className="sticky top-0 z-20 mb-6 border-b border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-1 py-3">
        {/* Tabs row (underline style, horizontally scrollable) */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex min-w-0 items-center gap-3 px-1">
            <ToggleGroup
              type="single"
              value={activeBucket}
              onValueChange={(v: string) => setParam(pathname, params, router, "bucket", v === "all" ? undefined : v)}
              className="flex min-w-0 items-center gap-1"
            >
              <ToggleGroupItem
                value={"all" as any}
                aria-label="Show all"
                className={[
                  // underline-tab look (no pill)
                  "rounded-none border-b-2 border-transparent bg-transparent",
                  "px-1.5 md:px-2.5 py-2 text-sm leading-none",
                  "data-[state=on]:border-amber-400 data-[state=on]:text-foreground",
                ].join(" ")}
              >
                <span className="inline-block max-w-[10ch] md:max-w-[14ch] truncate">All</span>
              </ToggleGroupItem>

              {bucketKeys.map((k) => (
                <TooltipProvider key={k} delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value={k}
                        aria-label={`Filter ${BUCKET_LABEL[k]}`}
                        className={[
                          "rounded-none border-b-2 border-transparent bg-transparent",
                          "px-1.5 md:px-2.5 py-2 text-sm leading-none",
                          "data-[state=on]:border-amber-400 data-[state=on]:text-foreground",
                        ].join(" ")}
                      >
                        <span className="inline-block max-w-[11ch] md:max-w-[16ch] truncate">
                          {BUCKET_LABEL[k]}
                        </span>
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{BUCKET_LABEL[k]}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </ToggleGroup>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Search + view toggle */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search"
              defaultValue={defaultQuery}
              onChange={(e) => setParam(pathname, params, router, "q", e.currentTarget.value || undefined)}
              placeholder={placeholder}
              className="pl-8"
            />
          </div>

          {/* Segmented view toggle (small footprint) */}
          <ToggleGroup
            type="single"
            value={activeView}
            onValueChange={(v: string) => setParam(pathname, params, router, "view", v || undefined)}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1"
          >
            <ToggleGroupItem
              value="grid"
              aria-label="Grid view"
              className="h-9 w-9 rounded-full data-[state=on]:bg-amber-400 data-[state=on]:text-black"
            >
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="List view"
              className="h-9 w-9 rounded-full data-[state=on]:bg-amber-400 data-[state=on]:text-black"
            >
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator className="mt-3 opacity-40" />
      </div>
    </div>
  );
}
