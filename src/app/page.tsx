// src/app/page.tsx
import Link from "next/link";
import { getAllContent, type ContentMeta } from "@/lib/content";
import FancyCard from "@/components/FancyCard";
import MissionCard from "@/components/mission-card";
import ServicesList from "@/components/ServicesList";
import BrandBadges from "@/components/BrandBadges";

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
      {/* HERO */}
      <section aria-labelledby="hero-heading" className="mb-6">
        <h1 id="hero-heading" className="mb-3 text-2xl font-semibold tracking-tight">
          I build MVPs and modernize digital systems — fast.
        </h1>
        <p className="max-w-[68ch] leading-8 md:text-lg text-zinc-900 dark:text-zinc-100">
          I help teams ship smarter — not just faster. Whether it’s a lean MVP, an AI-powered dashboard, or a performance overhaul, I bring enterprise-grade precision to small teams and bold ideas. Trusted by <span className="font-medium">Warner Bros Discovery</span>, <span className="font-medium">Tricentis</span>, and <span className="font-medium">BD</span>, I turn complexity into clarity — so you can launch what actually moves the needle.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {/* Replace href with your Calendly link if preferred */}
          <Link
            href="/trust/contact"
            className="inline-flex items-center rounded-lg border border-transparent bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900"
          >
            Book a free pilot call
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center rounded-lg border px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
          >
            View services & pricing
          </Link>
        </div>
      </section>

      {/* TRUST BADGES (swap srcs when you add SVGs in /public/logos) */}
      <section aria-label="Trusted by" className="mb-8">
        <BrandBadges
          className="
            [--bb-h:28px] [--bb-w:112px]
            sm:[--bb-h:30px] sm:[--bb-w:128px]
            md:[--bb-h:32px] md:[--bb-w:136px]
          "
          brands={[
            // WBD often ships with generous whitespace → reduce padding + bump scale slightly
            { name: "Warner Bros Discovery", src: "/logos/WBD.png", pad: 4, scale: 1.12, align: "center" },
            { name: "Tricentis", src: "/logos/tricentis.webp", pad: 8, scale: 1.0 },
            { name: "Becton Dickinson", src: "/logos/bd.svg", pad: 8, scale: 1.0 },
          ]}
          bordered
          priority
        />
      </section>

      {/* SERVICES — accented expandable bands to match FancyCard language */}
      <ServicesList />

      {/* MISSION — restyled to match FancyCard accent band */}
      <section className="mt-10" aria-labelledby="mission-heading">
        <h2 id="mission-heading" className="sr-only">
          Mission
        </h2>
        <MissionCard />
      </section>

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
            {latestBlog.map((p) => {
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
            {latestProjects.map((p) => {
              const props = toCardProps(p);
              return <FancyCard key={p.slug} {...props} />;
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
            {latestResearch.map((p) => {
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
