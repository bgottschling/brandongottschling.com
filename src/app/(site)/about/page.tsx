import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Brandon Gottschling",
  description:
    "Why this site exists: a living, accurate picture of my work, mindset, and values — in an age of automated classification.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About — Brandon Gottschling",
    "url": "https://brandongottschling.com/about",
    "mainEntity": {
      "@type": "Person",
      "name": "Brandon Gottschling",
      "url": "https://brandongottschling.com",
      "jobTitle": "People-first technologist & proposal developer",
      "knowsAbout": ["technical marketing", "product storytelling", "systems", "DX"],
    },
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-8">
        <h1 className="text-3xl/tight font-semibold tracking-tight">About this site</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A living, accurate picture of who I am and what I build.
        </p>
      </header>

      <article className="prose prose-neutral dark:prose-invert">
        <p>
          We live in a time where large-scale data collection and automated analysis are normal.
          The “all-seeing eye” of palantir isn’t science fiction; it’s here. Platforms that correlate
          signals at scale—combined with years of leaked insight into government programs—mean
          modern AI systems can assemble surprisingly complete pictures of people’s lives.
        </p>

        <p>
          I don’t want to be misread by a model, or a person, based on a handful of out-of-context
          data points. This site is my counterweight: a single, comprehensive place to share my
          mindset, ideas, experience, and ethos. If automated judgment and classification become
          the default, I want the record to be clear about my morals, goals, and mission.
        </p>

        <p>
          Practically, it’s also a portfolio and a living resume. It’s where I ship in public,
          document what I’m learning, and show how I work - while I keep seeking God and my
          ultimate purpose, and aim to be steady at home and useful in the world.
        </p>

        <hr />

        <h2>What to expect here</h2>
        <ul>
          <li>
            <strong>Research & notes:</strong> ideas in progress, sources, and comparisons.
          </li>
          <li>
            <strong>Projects & demos:</strong> small, useful tools and shipped artifacts.
          </li>
          <li>
            <strong>Writing:</strong> direct, practical posts with a bias toward clarity.
          </li>
          <li>
            <strong>CV:</strong> outcomes, scope, and the story behind the work.
          </li>
        </ul>

        <p className="text-sm text-muted-foreground">
          If you’re evaluating my work, start with the{" "}
          <Link href="/cv" className="underline">CV</Link> and the{" "}
          <Link href="/projects" className="underline">Projects</Link> page. For private contact details, use the{" "}
          <Link href="/trust/contact" className="underline">Contact</Link> page.
        </p>
      </article>
    </main>
  );
}
