import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Shield, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Trust",
  description: "Policies, terms, and how to get in touch with Brandon Gottschling.",
  alternates: { canonical: "/trust" },
};

const links = [
  {
    href: "/trust/contact",
    icon: Mail,
    title: "Contact",
    description: "Send me a message directly from the site.",
  },
  {
    href: "/trust/privacy",
    icon: Shield,
    title: "Privacy Policy",
    description: "What data is collected and how it is handled.",
  },
  {
    href: "/trust/terms",
    icon: FileText,
    title: "Terms of Use",
    description: "The ground rules for using this site.",
  },
];

export default function TrustPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Trust</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plain-language policies and how to reach me.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group rounded-lg border border-black/5 bg-white/70 p-5 transition hover:border-amber-300/50 hover:shadow-md dark:border-white/10 dark:bg-neutral-900/60 dark:hover:border-amber-500/30 no-underline"
        >
          <link.icon className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-2" />
          <h2 className="text-sm font-semibold group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
            {link.title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {link.description}
          </p>
        </Link>
      ))}
    </div>
    </>
  );
}
