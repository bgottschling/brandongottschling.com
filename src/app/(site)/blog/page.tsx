import { getAllContent, filterVisible } from "@/lib/content";
import { BLOG_BUCKETS, BLOG_CATEGORY_INFO, inferFromTags, type PrimaryCategory } from "@/lib/buckets";
import CenteredFilterShell from "@/components/layouts/CenteredFilterShell";
import SidebarCategoryGrid, { type GridOption } from "@/components/SidebarCategoryGrid";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import SearchViewBar from "@/components/SearchViewBar";
import ItemsGridList, { type Item as ItemsGridItem } from "@/components/ItemsGridList";

export const runtime = "nodejs";
export const metadata = { title: "Blog" };

// themeColor belongs in `export const viewport`, not metadata
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

type CountKey = PrimaryCategory | "all";
type BlogItem = ItemsGridItem & { primaryCategory?: PrimaryCategory };

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const raw = await getAllContent();
  const posts = filterVisible(raw).filter((x) => (x.type ?? "blog") === "blog");

  const items: BlogItem[] = posts.map((p) => ({
    href: `/blog/${p.slug.split("/").pop()}`,
    title: p.title,
    summary: p.summary,
    cover: p.image,
    date: p.date,
    tags: p.tags,
    primaryCategory: p.primaryCategory,
  }));

  // counts
  const counts: Partial<Record<CountKey, number>> = {};
  for (const b of BLOG_BUCKETS) counts[b] = 0;
  for (const it of items) {
    const cat = (it.primaryCategory ?? inferFromTags(it.tags)) as PrimaryCategory;
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  counts.all = items.length;

  // sidebar/mobile options (no ReactNodes)
  const options: GridOption[] = BLOG_BUCKETS.map((k) => ({
    key: k,
    label: BLOG_CATEGORY_INFO[k].label,
    description: BLOG_CATEGORY_INFO[k].description,
    count: counts[k] ?? 0,
    iconKey: k, // the grid renders icons by key on the client
  }));

  const bucket = (sp.bucket as PrimaryCategory | undefined) ?? undefined;
  const q = (sp.q as string | undefined) ?? undefined;
  const view = (sp.view as "grid" | "list" | undefined) ?? "grid";

    // filter + search
  let filtered = items;
  if (bucket) filtered = filtered.filter((it) => (it.primaryCategory ?? inferFromTags(it.tags)) === bucket);
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
        sidebar={
          // purely a Client Component; no handlers passed down
          <SidebarCategoryGrid title="Blog" options={options} />
        }
      >
        <div className="mx-auto max-w-3xl">
          {/* Mobile filter trigger */}
          <div className="mb-4 flex items-center justify-between md:hidden">
            <h1 className="text-2xl font-bold">Blog</h1>
            <MobileFilterSheet title="Blog Filters" options={options} />
          </div>

          {/* Desktop title */}
          <div className="mb-6 hidden md:block">
            <h1 className="text-3xl font-bold">Blog</h1>
            <p className="text-white/70">Browse by theme or search across posts.</p>
          </div>

          <SearchViewBar placeholder="Search posts..." />

          <ItemsGridList items={filtered} view={view} />
        </div>
      </CenteredFilterShell>
    </main>
  );
}
