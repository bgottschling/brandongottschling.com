// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import EdgeScrim from "@/components/EdgeScrim";
import MobileNavClient from "@/components/MobileNavClient";
import BackgroundNetworkStable from "@/components/BackgroundNetworkStable";

export const metadata: Metadata = {
  metadataBase: new URL("https://brandongottschling.com"),
  title: {
    default: "Brandon Gottschling — Research, Projects, Writing",
    template: "%s | brandongottschling.com",
  },
  description: "Research, Projects, Applications, CV, and Blog by Brandon Gottschling",
  openGraph: {
    title: "Brandon Gottschling",
    description: "Research, Projects, Applications, CV, and Blog by Brandon Gottschling.",
    url: "https://brandongottschling.com",
    siteName: "brandongottschling.com",
    images: ["/api/og?title=Brandon%20Gottschling"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@brandon_afk",
    creator: "@brandon_afk",
    title: "Research, Projects, Applications, CV, and Blog by Brandon Gottschling",
    description: "Research notes, Unity dev, crypto dashboards, and projects.",
    images: ["/api/og?title=Brandon%20Gottschling"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon.ico", sizes: "any", media: "(prefers-color-scheme: dark)" },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#111111" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900 antialiased">
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
            blur={14}                // 12–18 feels great
            tint={0.06}              // tiny neutral tint over blur (0.04–0.08)
            saturate={1.0}           // 1.0 = neutral; 1.15 adds a touch of vibrance
            columnWidth="min(100vw - 2rem, 48rem)"  // align to your max-w-3xl
            fade="16rem"             // widen/narrow side feather
            centerX="50%"            // adjust if you ever offset the reading lane
            z="z-0"
          />

          {/* Header / Nav (ABOVE scrim) */}
          <header className="sticky top-0 z-50 border-b border-border bg-white/70 backdrop-blur">
            <script type="application/ld+json" suppressHydrationWarning>
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Brandon Gottschling",
                url: "https://brandongottschling.com",
                sameAs: [
                  "https://github.com/bgottschling",
                  "https://www.linkedin.com/in/bgottschling/",
                  "https://twitter.com/brandon_afk",
                ],
              })}
            </script>

            <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
              <Link href="/" className="font-semibold tracking-tight hover:text-accent transition">
                brandongottschling.com
              </Link>

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
              </nav>

              {/* Mobile command menu */}
              <div className="md:hidden">
                <MobileNavClient />
              </div>
            </div>
          </header>

          {/* Main content (ABOVE scrim) */}
          <main className="relative z-10 mx-auto max-w-3xl px-4 py-8 prose prose-zinc">
            {children}
          </main>

          {/* Footer (ABOVE scrim) */}
          <footer className="relative z-10 mx-auto max-w-3xl px-4 py-8 text-sm text-muted">
            <hr className="mb-4 border-border" />
            <div className="flex items-center justify-between">
              <span>© {new Date().getFullYear()} Brandon Gottschling</span>
              <nav className="flex gap-4">
                <Link href="/now" className="hover:text-accent transition">
                  /now
                </Link>
                <Link href="/rss.xml" className="hover:text-accent transition">
                  RSS
                </Link>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
