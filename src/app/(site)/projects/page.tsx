import { getAllContent, filterVisible } from "@/lib/content";
import { PROJECT_STAGES, PROJECT_STAGE_INFO, inferStageFromMeta, type ProjectStage } from "@/lib/projects-facets";
import CenteredFilterShell from "@/components/layouts/CenteredFilterShell";
import SidebarCategoryGrid, { type GridOption } from "@/components/SidebarCategoryGrid";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import SearchViewBar from "@/components/SearchViewBar";
import ItemsGridList from "@/components/ItemsGridList";

export const runtime = "nodejs";
export const metadata = { title: "Projects" };

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

type CountKey = ProjectStage | "all";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const raw = await getAllContent();
  const all = filterVisible(raw).filter((x) => (x.type ?? "project") === "project");

  const items = all.map((p) => {
    const stage = inferStageFromMeta(p.status, p.tags);
    return {
      href: `/projects/${p.slug.split("/").pop()}`,
      title: p.title,
      summary: p.summary,
      cover: p.image,
      date: p.date,
      tags: p.tags,
      stage: p.stage
    };
  });

  // counts
  const counts: Partial<Record<CountKey, number>> = {};
  for (const s of PROJECT_STAGES) counts[s] = 0;
  for (const it of items) {
    if (it.stage !== undefined) {
      counts[it.stage as ProjectStage] = (counts[it.stage as ProjectStage] ?? 0) + 1;
    }
  }
  counts.all = items.length;

  const options: GridOption[] = PROJECT_STAGES.map((k) => ({
    key: k,
    label: PROJECT_STAGE_INFO[k].label,
    description: PROJECT_STAGE_INFO[k].description,
    count: counts[k] ?? 0,
    iconKey: k,
  }));

  const stage = (sp.stage as ProjectStage | undefined) ?? undefined;
  const q = (sp.q as string | undefined) ?? undefined;
  const view = (sp.view as "grid" | "list" | undefined) ?? "grid";

  // filter + search
  let filtered = items;
  if (stage) filtered = filtered.filter((it) => it.stage === stage);
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
        sidebar={<SidebarCategoryGrid title="Project Stage" options={options} param="stage" />}
      >
        <div className="mx-auto max-w-3xl">
          {/* Mobile trigger */}
          <div className="mb-4 flex items-center justify-between md:hidden">
            <h1 className="text-2xl font-bold">Projects</h1>
            <MobileFilterSheet title="Project Filters" options={options} param="stage" />
          </div>

          {/* Desktop title */}
          <div className="mb-6 hidden md:block">
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-white/70">Apps and experiments by stage.</p>
          </div>

          <SearchViewBar placeholder="Search projects..." />

          <ItemsGridList items={filtered} view={view} />
        </div>
      </CenteredFilterShell>
    </main>
  );
}
  