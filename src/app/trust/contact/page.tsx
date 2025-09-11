import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Trust",
  description: "How to reach me and how I share private contact details.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/trust/contact" },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact — Brandon Gottschling",
    "url": "https://brandongottschling.com/trust/contact",
    "contactPoint": [{
      "@type": "ContactPoint",
      "contactType": "Work",
      "email": "hello@brandongottschling.com",
      "areaServed": "US",
      "availableLanguage": ["en"]
    }]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h2>Contact</h2>
      <p>
        The fastest way to reach me is email:{" "}
        <a className="underline" href="mailto:hello@brandongottschling.com">hello@brandongottschling.com</a>.
      </p>

      <h3>Private contact card</h3>
      <p>
        For privacy, my full contact card is available by request and protected behind an access code.
        If we’re meeting live, I’ll share a time-limited QR that downloads my vCard.
      </p>
      <ul>
        <li>Live share: I unlock a rotating QR during our conversation.</li>
        <li>Asynchronous: email me and I’ll send a private link.</li>
      </ul>

      <h3>Response time</h3>
      <p className="text-sm text-muted-foreground">
        I aim to reply within 2–3 business days. If it’s urgent, include “URGENT” in the subject.
      </p>
    </>
  );
}
