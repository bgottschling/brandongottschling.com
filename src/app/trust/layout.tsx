import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust — Policies & Contact",
  description: "Contact, Privacy Policy, and Terms of Use for brandongottschling.com.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/trust" },
};

export default function TrustLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Trust</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plain-language policies and how to reach me.
        </p>
        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/trust/contact" className="underline">Contact</Link>
          <span aria-hidden="true" className="text-muted-foreground">·</span>
          <Link href="/trust/privacy" className="underline">Privacy Policy</Link>
          <span aria-hidden="true" className="text-muted-foreground">·</span>
          <Link href="/trust/terms" className="underline">Terms of Use</Link>
        </nav>
      </header>
      <div className="prose prose-neutral dark:prose-invert">{children}</div>
    </main>
  );
}
