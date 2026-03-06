import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Brandon Gottschling",
  description:
    "Why this site exists: one place for my work, ideas, and values. A living workshop where I build in public.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About | Brandon Gottschling",
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
          One place for my work, my ideas, and who I am.
        </p>
      </header>

      <article className="prose prose-neutral dark:prose-invert">
        <p>
          I believe in owning your narrative. Not because the world is out to get you,
          but because the best way to be understood is to show your work. This site is where
          I do that: one place to share what I am building, what I am learning, and what I
          care about.
        </p>

        <p>
          It is a portfolio, a living resume, and a workshop. I ship in public here. I write
          about things I find interesting or important. I document projects as they evolve,
          not just when they are finished. The goal is transparency and craft, not performance.
        </p>

        <p>
          I am also a person of faith. I keep seeking God and my ultimate purpose, and I aim
          to be steady at home and useful in the world. That shapes how I work and why I work.
          You will see it in the writing.
        </p>

        <hr />

        <h2>What to expect here</h2>
        <ul>
          <li>
            <strong>Research and notes:</strong> ideas in progress, sources, and comparisons.
          </li>
          <li>
            <strong>Projects and demos:</strong> small, useful tools and shipped artifacts.
          </li>
          <li>
            <strong>Writing:</strong> direct, practical posts with a bias toward clarity.
          </li>
          <li>
            <strong>CV:</strong> outcomes, scope, and the story behind the work.
          </li>
        </ul>

        <p className="text-sm text-muted-foreground">
          If you are evaluating my work, start with the{" "}
          <Link href="/cv" className="underline">CV</Link> and the{" "}
          <Link href="/projects" className="underline">Projects</Link> page. For private contact details, use the{" "}
          <Link href="/trust/contact" className="underline">Contact</Link> page.
        </p>
      </article>
    </main>
  );
}
