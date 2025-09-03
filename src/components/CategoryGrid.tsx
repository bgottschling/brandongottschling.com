"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BLOG_BUCKETS,
  BLOG_CATEGORY_INFO,
  type PrimaryCategory,
} from "@/lib/buckets";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  Dumbbell,
  Globe2,
  Landmark,
  LineChart,
  Heart,
  Users,
  Briefcase,
  Sparkles,
  BookOpen,
} from "lucide-react";

type BlogCountKey = PrimaryCategory | "all";

const Icons: Record<string, React.ComponentType<{ className?: string }>> = {
  faith: BookOpen,
  life: Heart,
  fitness: Dumbbell,
  relationships: Users,
  work: Briefcase,
  technology: Cpu,
  travel: Globe2,
  economics: LineChart,
  civics: Landmark,
  other: Sparkles,
};

export default function CategoryGrid({
  active,
  counts = {},
  categories = BLOG_BUCKETS,
}: {
  active?: PrimaryCategory;
  counts?: Partial<Record<BlogCountKey, number>>;
  categories?: PrimaryCategory[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setBucket(value?: string) {
    const p = new URLSearchParams(params.toString());
    if (!value) p.delete("bucket");
    else p.set("bucket", value);
    router.replace(p.toString() ? `${pathname}?${p}` : pathname);
  }

  // Build tile list including the "All" tile and detect odd count
  const tiles: Array<"all" | PrimaryCategory> = ["all", ...categories];
  const isOdd = tiles.length % 2 === 1;

  return (
    // 1 col on mobile, 2 cols from md upward (so "span 2" is meaningful)
    <div className="grid gap-4 md:grid-cols-2">
      {tiles.map((key, idx) => {
        const isAll = key === "all";
        const info = isAll
          ? { label: "All", description: "Show every post" }
          : BLOG_CATEGORY_INFO[key as PrimaryCategory];

        const Icon = isAll ? null : Icons[key as string] ?? Sparkles;
        const pressed = isAll ? !active : active === key;
        const isLast = idx === tiles.length - 1;
        const span2 = isOdd && isLast ? "md:col-span-2" : "";

        const count = isAll
          ? counts.all
          : counts[key as PrimaryCategory];

        return (
          <button
            key={isAll ? "all" : key}
            onClick={() => setBucket(isAll ? undefined : (key as string))}
            aria-pressed={pressed}
            className={[
              "relative flex items-start gap-3 rounded-xl border p-4 text-left",
              // base look
              "border-white/12 bg-white/6",
              // subtle animation on hover/active
              "transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
              pressed ? "ring-2 ring-amber-400/60" : "",
              span2,
            ].join(" ")}
          >
            <div
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                isAll ? "bg-amber-400/20 text-amber-500" : "bg-white/10",
              ].join(" ")}
            >
              {isAll ? (
                <span className="text-[13px] font-semibold">All</span>
              ) : (
                Icon && <Icon className="h-4 w-4" />
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold">{info.label}</div>
              <div className="text-xs text-muted-foreground">{info.description}</div>
            </div>

            {typeof count === "number" && (
              <Badge variant="secondary" className="absolute right-3 top-3 rounded-full">
                {count}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
