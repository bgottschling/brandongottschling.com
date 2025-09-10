import { signCardToken } from "@/lib/cardToken";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { robots: { index: false, follow: false } };

function getOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN) return process.env.NEXT_PUBLIC_SITE_ORIGIN;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default async function QRPage() {
  const ttl = Number(process.env.CARD_TOKEN_TTL_SECONDS || 300);
  const t = signCardToken(ttl);
  const origin = getOrigin();
  const target = `${origin}/card?t=${encodeURIComponent(t)}`;

  // Create a file named qrcode.d.ts in your project's src or types directory (e.g., src/types/qrcode.d.ts)
  // Add the following declaration in that file:
  // declare module 'qrcode';

  const QR = await import("qrcode");
  const svg = await QR.default.toString(target, { type: "svg", margin: 1, width: 512 });

  return (
    <main className="min-h-[70vh] grid place-items-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-xl font-semibold">Scan to view contact</h1>
        <div className="mx-auto max-w-[520px]" dangerouslySetInnerHTML={{ __html: svg }} aria-label="QR code" />
        <p className="text-xs text-neutral-500">This code expires in {ttl / 60} minutes.</p>
      </div>
    </main>
  );
}
