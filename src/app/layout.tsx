// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
//import ContentScrim from '@/components/ContentScrim'
import BackgroundNetworkStable from '@/components/BackgroundNetworkStable'


export const metadata: Metadata = {
  metadataBase: new URL('https://brandongottschling.com'),
  title: {
    default: 'Brandon Gottschling — Research, Projects, Writing',
    template: '%s | brandongottschling.com',
  },
  description:
    'Research, Projects, Applications, CV, and Blog by Brandon Gottschling',
  openGraph: {
    title: 'Brandon Gottschling',
    description:
      'Research, Projects, Applications, CV, and Blog by Brandon Gottschling.',
    url: 'https://brandongottschling.com',
    siteName: 'brandongottschling.com',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: "summary_large_image",
    site: "@brandon_afk", // optional
    creator: "@brandon_afk",
    title: "Research, Projects, Applications, CV, and Blog by Brandon Gottschling",
    description: "Research notes, Unity dev, crypto dashboards, and projects.",
    images: ["/api/og?title=Brandon%20Gottschling"]
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      // Dark theme (your current pack)
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon.ico", sizes: "any", media: "(prefers-color-scheme: dark)" },

      
    ]
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#111111" },

  ]

}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900 antialiased">
        
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

        {/* Header / Nav */}
        <header className="sticky top-0 z-50 border-b border-border bg-white/70 backdrop-blur dark:bg-card/70">
          {/* Structured Data for SEO */}
          {/* See https://developers.google.com/search/docs/appearance/structured-data/person */}
            <script type="application/ld+json" suppressHydrationWarning>
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Brandon Gottschling",
              url: "https://brandongottschling.com",
              sameAs: [
                "https://github.com/bgottschling",
                "https://www.linkedin.com/in/bgottschling/",
                "https://twitter.com/brandon_afk"
              ]
            })}
            </script>

            <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
              <Link href="/" className="font-semibold tracking-tight hover:text-accent transition">
                brandongottschling.com
              </Link>
              <nav className="flex gap-4 text-sm">
                {[
                  { href: '/research', label: 'Research' },
                  { href: '/projects', label: 'Projects' },
                  { href: '/blog', label: 'Blog' },
                  { href: '/cv', label: 'CV' },
                  { href: '/about', label: 'About' },
                ].map((n) => (
                  <Link key={n.href} href={n.href} className="hover:text-accent transition">
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

        {/* Main content */}
        <main
          className={[
            'mx-auto max-w-3xl px-4 py-8',
            'prose prose-zinc',
          ].join(' ')}
        >
          {children}
        </main>

        {/* Footer */}
        <footer className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted">
          <hr className="mb-4 border-border" />
          <div className="flex items-center justify-between">
            <span>© {new Date().getFullYear()} Brandon Gottschling</span>
            <nav className="flex gap-4">
              <Link href="/now" className="hover:text-accent transition">/now</Link>
              <Link href="/rss.xml" className="hover:text-accent transition">RSS</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
