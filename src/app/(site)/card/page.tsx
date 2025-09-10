import { signCardToken } from "@/lib/cardToken";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { robots: { index: false, follow: false } };

export default async function QRPage() {
  // Ensure this is a SERVER component (no "use client" at top)
  const ttl = Number(process.env.CARD_TOKEN_TTL_SECONDS || 300);
  const t = signCardToken(ttl);
  const target = `${process.env.NEXT_PUBLIC_SITE_URL}/card?t=${encodeURIComponent(t)}`;

  // Dynamic import avoids bundler resolution quirks
  // @ts-expect-error: No type definitions for 'qrcode'
  const QR = await import("qrcode");
  // Prefer SVG on the server: no canvas, no native binaries
  const svg = await QR.default.toString(target, { type: "svg", margin: 1, width: 512 });

  return (
    <main className="mx-auto max-w-md p-6 text-center space-y-4">
      <meta name="robots" content="noindex,nofollow" />
      <h1 className="text-xl font-semibold">Scan to view contact</h1>
      <div
        className="mx-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
        aria-label="QR code"
      />
      <p className="text-xs text-neutral-500">This code expires in {ttl / 60} minutes.</p>
    </main>
  );
}
