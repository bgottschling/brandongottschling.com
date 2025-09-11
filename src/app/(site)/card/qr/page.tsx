import { signCardToken } from "@/lib/cardToken";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { robots: { index: false, follow: false } };

function origin() {
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN) return process.env.NEXT_PUBLIC_SITE_ORIGIN;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default async function QRPage() {
  const ttl = Number(process.env.CARD_TOKEN_TTL_SECONDS || 60);
  const t = await signCardToken(ttl);
  const target = `${origin()}/api/vcard?t=${encodeURIComponent(t)}`;

  const QR = await import("qrcode");
  const svg = await QR.default.toString(target, { type: "svg", margin: 1, width: 512 });

  // Auto-rotate code a bit before expiry
  const refreshSec = Math.max(20, Math.min(ttl - 15, 45));

  return (
    <main className="min-h-[70vh] px-4 pb-10">
      <meta httpEquiv="refresh" content={`${refreshSec}`} />
      <div className="mx-auto max-w-screen-sm pt-6 flex flex-col items-center text-center">
        <h1 className="text-lg md:text-xl font-semibold">Scan to save contact</h1>
        <div className="mt-4 w-full max-w-[18rem] sm:max-w-[22rem] md:max-w-[26rem] [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-full"
             dangerouslySetInnerHTML={{ __html: svg }} aria-label="QR code" />
        <p className="mt-3 text-xs text-neutral-500">Code rotates every {refreshSec}s.</p>
      </div>
    </main>
  );
}
