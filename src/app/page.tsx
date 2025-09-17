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

  // Services menu (accordion-style bands)
  const services: { id: string; title: string; price: string; blurb: string; bullets: string[] }[] = [
    {
      id: "mvp",
      title: "MVP / Custom App (Next.js + Supabase + Tailwind)",
      price: "Typical: $10k–$50k",
      blurb: "Lean builds with auth, data, and clean UI — prove the idea fast.",
      bullets: ["Scoped MVP plan + milestones", "Auth, data model, basic CRUD", "Deployment + handover docs"],
    },
    {
      id: "ai",
      title: "AI Integrations / LLM (fine-tuning, embeddings)",
      price: "Typical: $20k–$60k",
      blurb: "Chat/workflows on your data; RAG, evals, guardrails.",
      bullets: ["Retrieval + eval harness", "Prompt/guardrail design", "Infra + monitoring basics"],
    },
    {
      id: "perf-a11y",
      title: "Performance & Accessibility",
      price: "Typical: $2k–$10k / $1.5k–$5k",
      blurb: "Core Web Vitals, WCAG/ADA — faster, more inclusive experiences.",
      bullets: ["Perf audit + fixes", "A11y audit + remediations", "Before/after reporting"],
    },
    {
      id: "dash",
      title: "Dashboards & Analytics",
      price: "Typical: $2k–$10k",
      blurb: "KPI design, GA4, Looker/BI — decision-ready views and alerts.",
      bullets: ["KPI design + source mapping", "Dashboard build + sharing", "Alerting + documentation"],
    },
    {
      id: "automation",
      title: "Workflow Automation (Notion / Zapier / Airtable)",
      price: "Typical: $1k–$5k",
      blurb: "Cut busywork; robust hand-off docs included.",
      bullets: ["Process mapping", "Automations with error handling", "Runbooks + training"],
    },
    {
      id: "seo",
      title: "SEO Audit (Tech + Content + JSON-LD)",
      price: "Typical: $1k–$5k",
      blurb: "Crawl, IA, schema for rich/AI results — when it’s the right lever.",
      bullets: ["Technical + content audit", "Schema/JSON-LD plan", "90-day roadmap"],
    },
    {
      id: "strategy",
      title: "Strategy & CX Architecture",
      price: "Typical: $10k–$50k",
      blurb: "Roadmaps that tie tech to outcomes.",
      bullets: ["Workshops + discovery", "Journey mapping", "Roadmap + org enablement"],
    },
    {
      id: "support",
      title: "Maintenance & Support",
      price: "Typical: $1k–$5k/mo",
      blurb: "Slim retainer for fixes, updates, and QA.",
      bullets: ["Monthly fixes + updates", "Uptime checks + minor enhancements", "Quarterly review"],
    },
  ];

  return (
    <div>
      {/* HERO */}
      <section aria-labelledby="hero-heading" className="mb-6">
        <h1 id="hero-heading" className="mb-3 text-2xl font-semibold tracking-tight">
          I build MVPs and modernize digital systems — fast.
        </h1>
        <p className="max-w-[68ch] leading-8 md:text-lg text-zinc-900 dark:text-zinc-100">
          From custom apps and dashboards to AI integrations, performance, accessibility, and automation —
          I bring enterprise-tested craft within reach. I’ve supported teams at{" "}
          <span className="font-medium">Warner Bros Discovery</span>, <span className="font-medium">Tricentis</span>, and{" "}
          <span className="font-medium">Becton Dickinson</span>, and now apply that experience to help organizations ship what matters.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {/* Replace href with your Calendly link if desired */}
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

      {/* TRUST STRIP */}
      <section aria-label="Trusted by" className="mb-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="uppercase tracking-wide text-xs text-zinc-500">Trusted by teams at:</span>
          <span className="px-2 py-1 rounded-md border border-border">Warner Bros Discovery</span>
          <span className="px-2 py-1 rounded-md border border-border">Tricentis</span>
          <span className="px-2 py-1 rounded-md border border-border">Becton Dickinson</span>
        </div>
      </section>

      {/* SERVICES (Accordion Bands) */}
      <section className="mt-2" aria-labelledby="services-heading">
        <header className="mb-3 flex items-baseline justify-between">
          <h2 id="services-heading" className="text-lg font-semibold tracking-tight">
            Services <span className="text-sm text-zinc-500">(pilot is 100% discounted)</span>
          </h2>
          <Link href="/services" className="text-sm underline underline-offset-4">
            See full menu
          </Link>
        </header>

        <div className="flex flex-col gap-3">
          {services.map((s) => (
            <details key={s.id} className="group rounded-xl border border-border bg-white/70 dark:bg-zinc-900/40">
              <summary className="list-none cursor-pointer select-none px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">{s.title}</h3>
                    <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{s.blurb}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-zinc-500">Typical</div>
                    <div className="text-sm font-medium">{s.price}</div>
                  </div>
                  <span
                    aria-hidden
                    className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-md border border-border text-xs transition-transform group-open:rotate-180"
                  >
                    ▾
                  </span>
                </div>
              </summary>

              <div className="px-4 pb-4">
                <ul className="mt-1 list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
                    ☑ Included in pilot scoping
                  </span>
                  <Link
                    href="/services"
                    className="inline-flex items-center rounded-md border px-2 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="mt-10" aria-labelledby="mission-heading">
        <h2 id="mission-heading" className="sr-only">Mission</h2>
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
