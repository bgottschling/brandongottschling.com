// /app/card/page.tsx  (Next 13+/App Router)
// If using Pages Router: /pages/card.tsx
import Link from "next/link";

export const metadata = {
  title: "Brandon Gottschling — Contact",
  description: "One-tap contact card. Save to phone, call, email, or connect.",
  openGraph: {
    title: "Brandon Gottschling — Contact",
    description: "One-tap contact card.",
    url: "https://brandongottschling.com/card",
    images: [{ url: "/images/og-card.png" }],
  },
};

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Brandon Gottschling",
    jobTitle: "Technical Marketing & Builder",
    url: "https://brandongottschling.com",
    sameAs: [
      "mailto:hello@brandongottschling.com",
      "https://www.linkedin.com/in/brandongottschling",
      "https://github.com/bgottschling",
      // add socials
    ],
    worksFor: { "@type": "Organization", name: "—" },
    email: "hello@brandongottschling.com",
    telephone: "+1-770-480-7979",
  };
}

export default function ContactCard() {
  const phone = "+17704807979";
  const email = "hello@brandongottschling.com";
  const vcfUrl = "/api/vcard?profile=brandon&v=1";
  const passUrl = "/api/walletpass?profile=brandon"; // optional
  const site = "https://brandongottschling.com";
  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <section className="text-center">
        <img src="/images/avatar.jpg" alt="Brandon" className="mx-auto h-24 w-24 rounded-full" />
        <h1 className="mt-4 text-2xl font-semibold">Brandon Gottschling</h1>
        <p className="text-sm text-neutral-500">Technical Marketing • Builder</p>
      </section>

      <div className="grid gap-3">
        <a className="rounded-2xl border p-3 text-center" href={`tel:${phone}`}>📞 Call</a>
        <a className="rounded-2xl border p-3 text-center" href={`sms:${phone}`}>💬 Text</a>
        <a className="rounded-2xl border p-3 text-center" href={`mailto:${email}`}>✉️ Email</a>
        <a className="rounded-2xl border p-3 text-center" href={vcfUrl}>➕ Save Contact (VCF)</a>
        {/* Optional Wallet pass */}
        {/* <a className="rounded-2xl border p-3 text-center" href={passUrl}> Add to Apple Wallet</a> */}
        <Link className="rounded-2xl border p-3 text-center" href={site}>🌐 Website</Link>
        <a className="rounded-2xl border p-3 text-center" href="/card/qr">🔳 Show QR (fallback)</a>
      </div>

      <footer className="text-center text-xs text-neutral-400">
        Tip: Tap NFC or scan QR. Links carry source tags for analytics.
      </footer>
    </main>
  );
}
