import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Only protect /card (the private contact page) and /api/vcard.
 * We intentionally DO NOT guard /card/qr or /card/access so you can open the QR fast
 * and people can enter the PIN when needed.
 */
export const config = {
  matcher: ["/card", "/api/vcard"],
};

// ---- base64url helpers (Edge-safe) ----
function b64urlToUint8Array(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Convert a TypedArray view to a clean ArrayBuffer slice (Edge typing friendly)
function viewToArrayBuffer(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
}

function uint8ToB64url(arr: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyToken(t?: string | null) {
  if (!t) return false;
  const [payloadB64, sigB64] = t.split(".");
  if (!payloadB64 || !sigB64) return false;

  const secret = process.env.CARD_TOKEN_SECRET;
  if (!secret) return false;

  // Web Crypto (Edge runtime)
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // IMPORTANT: Pass an ArrayBuffer (not a generic Uint8Array<ArrayBufferLike>)
  const payloadBytes = b64urlToUint8Array(payloadB64);
  const payloadBuf = viewToArrayBuffer(payloadBytes);
  const sigBuf = await crypto.subtle.sign("HMAC", key, payloadBuf);

  const expected = uint8ToB64url(new Uint8Array(sigBuf));
  if (expected !== sigB64) return false;

  // Validate payload
  const payloadJson = new TextDecoder().decode(payloadBytes);
  const payload = JSON.parse(payloadJson) as { sub?: string; exp?: number };
  return payload?.sub === "card" && typeof payload?.exp === "number" && Date.now() < payload.exp!;
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Allowlist: don't guard /card/qr or /card/access
  if (pathname.startsWith("/card/qr") || pathname.startsWith("/card/access")) {
    return NextResponse.next();
  }

  // Guard /card and /api/vcard
  const authed = req.cookies.get("card_auth")?.value === "1";
  if (authed) return NextResponse.next();

  const ok = await verifyToken(searchParams.get("t"));
  if (ok) return NextResponse.next();

  // Otherwise require PIN
  const url = req.nextUrl.clone();
  url.pathname = "/card/access";
  url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
  return NextResponse.redirect(url);
}
