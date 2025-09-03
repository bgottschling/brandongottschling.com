import { getAllContent, filterVisible } from "@/lib/content";
import { RESEARCH_AREAS, RESEARCH_AREA_INFO, inferAreaFromTags, type ResearchArea } from "@/lib/research-facets";
import CenteredFilterShell from "@/components/layouts/CenteredFilterShell";
import SidebarCategoryGrid, { type GridOption } from "@/components/SidebarCategoryGrid";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import SearchViewBar from "@/components/SearchViewBar";
import ItemsGridList from "@/components/ItemsGridList";

export const runtime = "nodejs";
export const metadata = { title: "Research" };

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

type CountKey = ResearchArea | "all";

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const raw = await getAllContent();
  const all = filterVisible(raw).filter((x) => (x.type ?? "research") === "research");

  const items = all.map((p) => ({
    href: `/research/${p.slug.split("/").pop()}`,
    title: p.title,
    summary: p.summary,
    cover: p.image,
    date: p.date,
    tags: p.tags,
    area: inferAreaFromTags(p.tags),
  }));

  // counts
  const counts: Partial<Record<CountKey, number>> = {};
  for (const a of RESEARCH_AREAS) counts[a] = 0;
  for (const it of items) counts[it.area] = (counts[it.area] ?? 0) + 1;
  counts.all = items.length;

  const options: GridOption[] = RESEARCH_AREAS.map((k) => ({
    key: k,
    label: RESEARCH_AREA_INFO[k].label,
    description: RESEARCH_AREA_INFO[k].description,
    count: counts[k] ?? 0,
    iconKey: k, // sidebar has icons for these keys
  }));

  const area = (sp.area as ResearchArea | undefined) ?? undefined;
  const q = (sp.q as string | undefined) ?? undefined;
  const view = (sp.view as "grid" | "list" | undefined) ?? "grid";

  // filter + search
  let filtered = items;
  if (area) filtered = filtered.filter((it) => it.area === area);
  if (q) {
    const qq = q.toLowerCase();
    filtered = filtered.filter(
      (it) =>
        it.title.toLowerCase().includes(qq) ||
        (it.summary?.toLowerCase().includes(qq) ?? false) ||
        (it.tags ?? []).some((t) => t.toLowerCase().includes(qq))
    );
  }

  return (
    <main className="py-10">
      <CenteredFilterShell
        sidebar={<SidebarCategoryGrid title="Research Areas" options={options} param="area" />}
      >
        <div className="mx-auto max-w-3xl">
          {/* Mobile trigger */}
          <div className="mb-4 flex items-center justify-between md:hidden">
            <h1 className="text-2xl font-bold">Research</h1>
            <MobileFilterSheet title="Research Filters" options={options} param="area" />
          </div>

          {/* Desktop title */}
          <div className="mb-6 hidden md:block">
            <h1 className="text-3xl font-bold">Research</h1>
            <p className="text-white/70">Briefings, notes, and investigations by area.</p>
          </div>

          <SearchViewBar placeholder="Search research..." />

          <ItemsGridList items={filtered} view={view} />
        </div>
      </CenteredFilterShell>
    </main>
  );
}
