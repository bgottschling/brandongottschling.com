import Link from "next/link";
import { getAllContent, type ContentMeta } from "@/lib/content";
import FancyCard from "@/components/FancyCard";
import MissionCard from "@/components/mission-card";

function toCardProps(m: ContentMeta) {
  return {
    href: `/${m.slug}`,
    title: m.title ?? "(Untitled)",
    summary: m.summary as string | undefined,
    cover: m.image as string | undefined,
    date: m.date as string | undefined,
    tags: Array.isArray(m.tags) ? (m.tags as string[]) : [],
  };
}

export default async function HomePage() {
  const all: ContentMeta[] = await getAllContent();

  const latestBlog = all.filter((p) => p.type === "blog" && !p.draft).slice(0, 3);
  const latestProjects = all.filter((p) => p.type === "project" && !p.draft).slice(0, 3);
  const latestResearch = all.filter((p) => p.type === "research" && !p.draft).slice(0, 3);

  return (
    <div>
      <h1 className="mb-3">Hi, I’m Brandon.</h1>
      <p className="max-w-[68ch] leading-8 md:text-lg text-zinc-900 dark:text-zinc-100">
        Building to learn and learning to build. I turn ideas into working things - one tool, one system, one patient
        story at a time. Here I share prototypes, playbooks, and results: Application Development, UX design, Game
        Development, Proposal Crafting, Multi-Faceted Commentary that will maybe one day shape the future — privacy-first,
        measurable, and human.
      </p>

      <MissionCard />

      {/* Latest Writing */}
      <section className="mt-10">
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Latest Writing</h2>
          <Link href="/blog" className="text-sm underline underline-offset-4">
            Browse all
          </Link>
        </header>
        {latestBlog.length ? (
          <div className="grid auto-rows-[1fr] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestBlog.map((p, i) => {
              const props = toCardProps(p);
              return <FancyCard key={p.slug} {...props} />;
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">
            No posts yet. Add MDX under <code>content/blog/</code>.
          </p>
        )}
      </section>

      {/* Projects */}
      <section className="mt-12">
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
          <Link href="/projects" className="text-sm underline underline-offset-4">
            Browse all
          </Link>
        </header>
        {latestProjects.length ? (
          <div className="grid auto-rows-[1fr] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestProjects.map((p, i) => {
              const props = toCardProps(p);
              return <FancyCard key={p.slug} {...props}/>;
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">
            No projects yet. Add MDX under <code>content/projects/</code>.
          </p>
        )}
      </section>

      {/* Research */}
      <section className="mt-12">
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Research Notes</h2>
          <Link href="/research" className="text-sm underline underline-offset-4">
            Browse all
          </Link>
        </header>
        {latestResearch.length ? (
          <div className="grid auto-rows-[1fr] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestResearch.map((p, i) => {
              const props = toCardProps(p);
              return <FancyCard key={p.slug} {...props} />;
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">
            No research notes yet. Add MDX under <code>content/research/</code>.
          </p>
        )}
      </section>
    </div>
  );
}
