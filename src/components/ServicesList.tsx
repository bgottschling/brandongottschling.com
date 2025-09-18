// src/components/ServicesList.tsx
import ServiceBand, { type Service } from "./ServiceBand";
import Link from "next/link";

export default function ServicesList() {
  const services: Service[] = [
    {
      id: "mvp",
      title: "MVP / Custom App (Next.js + Supabase + Tailwind)",
      price: "$10k–$50k",
      blurb: "Lean builds with auth, data, and clean UI — prove the idea fast.",
      bullets: ["Scoped MVP plan + milestones", "Auth, data model, basic CRUD", "Deployment + handover docs"],
    },
    {
      id: "ai",
      title: "AI Integrations / LLM (fine-tuning, embeddings)",
      price: "$20k–$60k",
      blurb: "Chat/workflows on your data; RAG, evals, guardrails.",
      bullets: ["Retrieval + eval harness", "Prompt/guardrail design", "Infra + monitoring basics"],
    },
    {
      id: "perf-a11y",
      title: "Performance & Accessibility",
      price: "$2k–$10k / $1.5k–$5k",
      blurb: "Core Web Vitals, WCAG/ADA — faster, more inclusive experiences.",
      bullets: ["Perf audit + fixes", "A11y audit + remediations", "Before/after reporting"],
    },
    {
      id: "dash",
      title: "Dashboards & Analytics",
      price: "$2k–$10k",
      blurb: "KPI design, GA4, Looker/BI — decision-ready views and alerts.",
      bullets: ["KPI design + source mapping", "Dashboard build + sharing", "Alerting + documentation"],
    },
    {
      id: "automation",
      title: "Workflow Automation (Notion / Zapier / Airtable)",
      price: "$1k–$5k",
      blurb: "Cut busywork; robust hand-off docs included.",
      bullets: ["Process mapping", "Automations w/ error handling", "Runbooks + training"],
    },
    {
      id: "seo",
      title: "SEO Audit (Tech + Content + JSON-LD)",
      price: "$1k–$5k",
      blurb: "Crawl, IA, schema for rich/AI results — when it’s the right lever.",
      bullets: ["Technical + content audit", "Schema/JSON-LD plan", "90-day roadmap"],
    },
    {
      id: "strategy",
      title: "Strategy & CX Architecture",
      price: "$10k–$50k",
      blurb: "Roadmaps that tie tech to outcomes.",
      bullets: ["Workshops + discovery", "Journey mapping", "Roadmap + org enablement"],
    },
    {
      id: "support",
      title: "Maintenance & Support",
      price: "$1k–$5k/mo",
      blurb: "Slim retainer for fixes, updates, and QA.",
      bullets: ["Monthly fixes + updates", "Uptime checks + minor enhancements", "Quarterly review"],
    },
  ];

    return (
    <section className="mt-2" aria-labelledby="services-heading">
        <header className="mb-3 flex items-baseline justify-between">
        <h2 id="services-heading" className="text-lg font-semibold tracking-tight">
            Services <span className="text-sm text-zinc-500">(pilot is 100% discounted)</span>
        </h2>
        <Link href="/services" className="text-sm underline underline-offset-4">
            See full menu
        </Link>
        </header>

        {/* single column on mobile; two columns on lg+; equal-height rows */}
        <div className="flex flex-col gap-4">
        {services.map((svc) => (
            <ServiceBand key={svc.id} service={svc} />
        ))}
        </div>
    </section>
    );
}
