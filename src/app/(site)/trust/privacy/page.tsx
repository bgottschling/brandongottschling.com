import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Plain-language privacy policy for brandongottschling.com.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/trust/privacy" },
};

export default function PrivacyPage() {
  const updated = "2025-09-10";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy",
    "url": "https://brandongottschling.com/trust/privacy",
    "dateModified": updated,
    "inLanguage": "en"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/trust" className="inline-flex items-center gap-1 text-sm text-muted-foreground no-underline hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="h-3.5 w-3.5" />Trust
      </Link>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: {updated}</p>

      <h3>Summary</h3>
      <p>
        I collect the minimum necessary to run this site. There are no third-party ads or trackers.
        If I add analytics, they will be privacy-respecting and documented here.
      </p>

      <h3>What’s collected</h3>
      <ul>
        <li><strong>Server logs:</strong> standard request data (IP, user agent, referrer) kept briefly for security and reliability.</li>
        <li><strong>Contact:</strong> if you email me, I’ll receive your message and address. I use this only to reply.</li>
        <li><strong>Private contact card:</strong> time-limited tokens may be logged to prevent abuse; tokens expire quickly.</li>
      </ul>

      <h3>What’s not collected</h3>
      <ul>
        <li>No third-party advertising IDs or cross-site tracking pixels.</li>
        <li>No sale of personal information.</li>
      </ul>

      <h3>Data retention</h3>
      <p>
        Logs are retained briefly (typically days, not months) for troubleshooting/security and then discarded.
        Emails are kept as long as the conversation is active or as required by law.
      </p>

      <h3>Security</h3>
      <p>
        Private contact sharing uses short-lived, single-use links and basic rate-limits. I rotate secrets as needed.
      </p>

      <h3>Your choices</h3>
      <ul>
        <li>You can browse most of the site without sharing personal data.</li>
        <li>You can email me to request correction or deletion of messages you’ve sent.</li>
      </ul>

      <h3>Changes</h3>
      <p>
        If this policy changes, I’ll update the date at the top and summarize material changes in the changelog.
      </p>

      <h3>Contact</h3>
      <p>
        Questions? Email{" "}
        <a className="underline" href="mailto:hello@brandongottschling.com">hello@brandongottschling.com</a>.
      </p>
    </>
  );
}
