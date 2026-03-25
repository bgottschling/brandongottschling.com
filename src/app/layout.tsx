import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import EdgeScrim from "@/components/EdgeScrim";
import MobileNavClient from "@/components/MobileNavClient";
import NavSearch from "@/components/NavSearch";
import BackgroundNetworkStable from "@/components/BackgroundNetworkStable";
import ThemeSync from "@/components/ThemeSync";

export const metadata: Metadata = {
  metadataBase: new URL("https://brandongottschling.com"),
  title: {
    default: "Brandon Gottschling — Projects, Research, Writing",
    template: "%s | brandongottschling.com",
  },
  description:
    "A working record of projects, research, and writing by Brandon Gottschling. Technology, life, faith, and work — documented as it happens.",
  openGraph: {
    title: "Brandon Gottschling",
    description:
      "Projects, research, and writing on technology, life, faith, and work. Built in the open, documented as it happens.",
    url: "https://brandongottschling.com",
    siteName: "brandongottschling.com",
    images: ["/api/og?title=Brandon%20Gottschling"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@brandon_afk",
    creator: "@brandon_afk",
    title: "Brandon Gottschling — Projects, Research, Writing",
    description:
      "Projects, research, and writing on technology, life, faith, and work.",
    images: ["/api/og?title=Brandon%20Gottschling"],
  },
  keywords: ["Gottschling", "Brandon Gottschling", "projects", "research", "writing", "technology", "software engineering"],
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon.ico", sizes: "any", media: "(prefers-color-scheme: dark)" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#111111" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900 antialiased">
        <ThemeSync />
        {/* Create isolated stacking context */}
        <div className="relative isolate min-h-dvh">
          {/* Background LOWEST */}
          <div className="fixed inset-0 -z-30 pointer-events-none">
            <BackgroundNetworkStable
              density={1}
              triangles
              triangleStrength={0.85}
              triSmoothing={0.12}
              fadeOut={0.08}
              harmonyStrength={0.18}
              snapEvery={[28, 52]}
              snapRise={3}
              snapHold={4}
              snapFall={5}
            />
          </div>

          {/* Scrim BETWEEN background and content */}
          <EdgeScrim
            variant="column-blur"
            blur={4}
            tint={0.025}
            saturate={1.0}
            columnWidth="min(100vw - 2rem, 48rem)"
            fade="12rem"
            z="z-0"
          />

          {/* Header / Nav (ABOVE scrim) */}
          <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
            {/* Person */}
            <script type="application/ld+json" suppressHydrationWarning>
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Brandon Gottschling",
                givenName: "Brandon",
                familyName: "Gottschling",
                url: "https://brandongottschling.com",
                jobTitle: "Proposal Development",
                worksFor: {
                  "@type": "Organization",
                  name: "Becton, Dickinson and Company (BD)",
                },
                description: "Proposal and product development grounded in incident leadership. Technology, faith, and work — documented as it happens.",
                knowsAbout: ["proposal development", "incident management", "pharmacy automation", "software engineering", "AI", "Next.js"],
                sameAs: [
                  "https://github.com/bgottschling",
                  "https://www.linkedin.com/in/bgottschling/",
                  "https://twitter.com/brandon_afk",
                ],
              })}
            </script>

            {/* Site */}
            <script
              type="application/ld+json"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  name: "brandongottschling.com",
                  url: "https://brandongottschling.com",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://brandongottschling.com/search?q={query}",
                    "query-input": "required name=query",
                  },
                }),
              }}
            />

            {/* OfferCatalog JSON-LD — commented out until services page is active
            <script
              type="application/ld+json"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "OfferCatalog",
                  name: "Consulting Services",
                  url: "https://brandongottschling.com/services",
                  itemListElement: [],
                }),
              }}
            />
            */}

            <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
              <Link href="/" className="font-semibold tracking-tight hover:text-accent transition shrink-0">
                brandongottschling.com
              </Link>

              {/* Desktop search */}
              <NavSearch />

              {/* Desktop nav */}
              <nav className="hidden md:flex gap-4 text-sm" aria-label="Primary">
                {[
                  { href: "/research", label: "Research" },
                  { href: "/projects", label: "Projects" },
                  { href: "/blog", label: "Blog" },
                  { href: "/cv", label: "CV" },
                  { href: "/about", label: "About" },
                ].map((n) => (
                  <Link key={n.href} href={n.href} className="hover:text-accent transition">
                    {n.label}
                  </Link>
                ))}
                {/*<Link
                  href="/trust/contact" // replace with Calendly if desired
                  className="rounded-md border px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                >
                  Book a Pilot
                </Link>*/}
              </nav>

              {/* Mobile command menu */}
              <div className="md:hidden">
                <MobileNavClient />
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="relative z-10 mx-auto max-w-3xl px-4 py-8 prose prose-zinc">
            {children}
          </main>

          {/* Footer */}
          <footer className="relative z-10 mx-auto max-w-3xl px-4 py-8 text-sm text-muted-foreground">
            <hr className="mb-4 border-border" />
            <div className="flex items-center justify-between gap-3">
              <span>© {new Date().getFullYear()} Brandon Gottschling</span>
              <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <Link href="/now" className="hover:text-accent transition">/now</Link>
                <Link href="/rss.xml" className="hover:text-accent transition" rel="alternate">RSS</Link>
                <Link href="/trust" className="hover:text-accent transition">Trust</Link>
                <span aria-hidden="true" className="text-muted-foreground">·</span>
                <Link href="/trust/contact" className="hover:text-accent transition">Contact</Link>
                <span aria-hidden="true" className="text-muted-foreground">·</span>
                <Link href="/trust/privacy" className="hover:text-accent transition">Privacy</Link>
                <span aria-hidden="true" className="text-muted-foreground">·</span>
                <Link href="/trust/terms" className="hover:text-accent transition">Terms</Link>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
