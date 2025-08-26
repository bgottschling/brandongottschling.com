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
    'Research, projects/apps, CV, and blog by Brandon Gottschling — Unity (Subject 33), the Awake comic, Orgami (SME index), crypto cycle tools, and LIT Wax Works.',
  openGraph: {
    title: 'Brandon Gottschling',
    description:
      'Research, projects/apps, CV, and blog by Brandon Gottschling.',
    url: 'https://brandongottschling.com',
    siteName: 'brandongottschling.com',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    type: 'website',
  },
  robots: { index: true, follow: true },
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
