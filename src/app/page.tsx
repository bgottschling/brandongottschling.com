// src/app/page.tsx
import Link from "next/link";
import { getAllContent, type ContentMeta } from "@/lib/content";
import FancyCard, { type CardVariant } from "@/components/FancyCard";
import MissionCard from "@/components/mission-card";
import BrandBadges from "@/components/BrandBadges";
import { FadeIn } from "@/components/FadeIn";
import HeroEntrance from "@/components/HeroEntrance";

function toCardProps(m: ContentMeta, variant: CardVariant) {
  return {
    href: `/${m.slug}`,
    title: m.title ?? "(Untitled)",
    summary: m.summary as string | undefined,
    cover: m.image as string | undefined,
    date: m.date as string | undefined,
    tags: Array.isArray(m.tags) ? (m.tags as string[]) : [],
    variant,
    contentType: m.type ?? "blog",
    slug: m.slug,
  };
}

export default async function HomePage() {
  const all: ContentMeta[] = await getAllContent();

  const latestBlog = all.filter((p) => p.type === "blog" && !p.draft).slice(0, 3);
  const latestProjects = all.filter((p) => p.type === "project" && !p.draft).slice(0, 3);
  const latestResearch = all.filter((p) => p.type === "research" && !p.draft).slice(0, 3);

  return (
    <div>
      {/* HERO — staggered entrance animation */}
      <section aria-labelledby="hero-heading" className="mb-6">
        <HeroEntrance>
          <h1 id="hero-heading" className="mb-3 text-2xl font-semibold tracking-tight">
            I build prototypes, write about tech and life, and share what I learn along the way.
          </h1>
          <p className="max-w-[68ch] leading-8 md:text-lg text-zinc-900 dark:text-zinc-100">
              Building to learn and learning to build. This is my journal, my experiment, my resume? Check it out, have a look around and get to know me a little. This place is an ever-evolving collection of my thoughts on technology, life, faith, and work, along with case studies of projects I&apos;ve built and research notes I&apos;ve compiled.
          </p>
        </HeroEntrance>
      </section>

      {/* TRUST BADGES */}
      <FadeIn delay={0.3}>
        <section aria-label="Trusted by" className="mb-8">
          <BrandBadges
            className="
              [--bb-h:28px] [--bb-w:112px]
              sm:[--bb-h:30px] sm:[--bb-w:128px]
              md:[--bb-h:32px] md:[--bb-w:136px]
            "
            gridClassName="
              gap-5 sm:gap-6
              md:grid-cols-3 md:grid-flow-row md:justify-items-center md:justify-center
            "
            brands={[
              { name: "Warner Bros Discovery", src: "/logos/WBD.png", pad: 3, scale: 2.0, align: "center", shiftX: 1, shiftY: -1 },
              { name: "Tricentis", src: "/logos/tricentis.webp", pad: 10, scale: 2.0},
              { name: "Becton Dickinson", src: "/logos/bd.svg", pad: 10, scale: 2.0 },
            ]}
            priority
          />
        </section>
      </FadeIn>

      {/* MISSION */}
      <FadeIn>
        <section className="mt-10" aria-labelledby="mission-heading">
          <h2 id="mission-heading" className="sr-only">
            Mission
          </h2>
          <MissionCard />
        </section>
      </FadeIn>

      {/* Latest Writing */}
      <section className="mt-10">
        <FadeIn>
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Latest Writing</h2>
            <Link href="/blog" className="text-sm underline underline-offset-4">
              Browse all
            </Link>
          </header>
        </FadeIn>
        {latestBlog.length ? (
          <div className="grid auto-rows-[1fr] gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestBlog.map((p, i) => {
              const props = toCardProps(p, "blog");
              return (
                <FadeIn key={p.slug} delay={i * 0.08}>
                  <FancyCard {...props} />
                </FadeIn>
              );
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
        <FadeIn>
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
            <Link href="/projects" className="text-sm underline underline-offset-4">
              Browse all
            </Link>
          </header>
        </FadeIn>
        {latestProjects.length ? (
          <div className="grid auto-rows-[1fr] gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestProjects.map((p, i) => {
              const props = toCardProps(p, "project");
              return (
                <FadeIn key={p.slug} delay={i * 0.08}>
                  <FancyCard {...props} />
                </FadeIn>
              );
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
        <FadeIn>
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Research Notes</h2>
            <Link href="/research" className="text-sm underline underline-offset-4">
              Browse all
            </Link>
          </header>
        </FadeIn>
        {latestResearch.length ? (
          <div className="grid auto-rows-[1fr] gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestResearch.map((p, i) => {
              const props = toCardProps(p, "research");
              return (
                <FadeIn key={p.slug} delay={i * 0.08}>
                  <FancyCard {...props} />
                </FadeIn>
              );
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
