import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trust — Policies & Contact",
  description: "Contact, Privacy Policy, and Terms of Use for brandongottschling.com.",
  robots: { index: true, follow: true },
};

export default function TrustLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="prose prose-neutral dark:prose-invert">{children}</div>
    </main>
  );
}
