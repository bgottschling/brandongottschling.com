import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Plain-language terms for using brandongottschling.com.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/trust/terms" },
};

export default function TermsPage() {
  const updated = "2025-09-10";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Use",
    "url": "https://brandongottschling.com/trust/terms",
    "dateModified": updated,
    "inLanguage": "en"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/trust" className="inline-flex items-center gap-1 text-sm text-muted-foreground no-underline hover:text-foreground transition-colors mb-4">
        <ChevronLeft className="h-3.5 w-3.5" />Trust
      </Link>
      <h1>Terms of Use</h1>
      <p className="text-sm text-muted-foreground">Last updated: {updated}</p>

      <h3>Plain-language summary</h3>
      <ul>
        <li>Use the site respectfully. Don’t break laws or harm the service.</li>
        <li>Content is provided “as is.” I try to be accurate, but errors can happen.</li>
        <li>You may link to public pages with credit; don’t republish my work without permission.</li>
        <li>Scraping or bulk extraction is not allowed.</li>
      </ul>

      <h3>Full terms</h3>
      <ol>
        <li>
          <strong>Acceptance.</strong> By accessing this site, you agree to these Terms and all applicable laws.
        </li>
        <li>
          <strong>Intellectual property.</strong> Unless noted otherwise, all content is owned by me.
          You may link and quote brief excerpts with attribution. Any other use requires prior written consent.
        </li>
        <li>
          <strong>Acceptable use.</strong> You will not attempt to disrupt, scrape, or reverse engineer the site,
          nor use it for unlawful purposes.
        </li>
        <li>
          <strong>No warranties.</strong> Content is provided “as is” without warranties of any kind.
        </li>
        <li>
          <strong>Limitation of liability.</strong> To the maximum extent permitted by law, I’m not liable for
          any damages arising from your use of the site.
        </li>
        <li>
          <strong>Changes.</strong> I may update these Terms; the “Last updated” date will reflect changes.
        </li>
        <li>
          <strong>Governing law.</strong> Georgia, USA (without regard to conflict-of-law principles).
        </li>
        <li>
          <strong>Contact.</strong> For questions about these Terms, email{" "}
          <a className="underline" href="mailto:hello@brandongottschling.com">hello@brandongottschling.com</a>.
        </li>
      </ol>
    </>
  );
}
