"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SearchViewBar({ placeholder = "Search posts..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeView = (params.get("view") || "grid") as "grid" | "list";
  const defaultQuery = params.get("q") ?? "";

  function setParam(key: string, value?: string) {
    const p = new URLSearchParams(params.toString());
    if (!value) p.delete(key);
    else p.set(key, value);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <div className="sticky top-0 z-20 mb-6 border-b border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-1 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search"
              defaultValue={defaultQuery}
              onChange={(e) => setParam("q", e.currentTarget.value || undefined)}
              placeholder={placeholder}
              className="pl-8"
            />
          </div>

          <ToggleGroup
            type="single"
            value={activeView}
            onValueChange={(v: string | undefined) => setParam("view", v || undefined)}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view" className="h-9 w-9 rounded-full data-[state=on]:bg-amber-400 data-[state=on]:text-black">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="h-9 w-9 rounded-full data-[state=on]:bg-amber-400 data-[state=on]:text-black">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Separator className="mt-3 opacity-40" />
      </div>
    </div>
  );
}
