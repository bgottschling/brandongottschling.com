import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = { matcher: ["/card", "/api/vcard"] };

// b64url helpers
function b64urlToUint8Array(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function uint8ToB64url(arr: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyToken(t?: string | null) {
  try {
    if (!t) return false;
    const [payloadB64, sigB64] = t.split(".");
    if (!payloadB64 || !sigB64) return false;

    const secret = process.env.CARD_TOKEN_SECRET;
    if (!secret) return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Sign the *string bytes* of payloadB64 to compute HMAC
    const data = new TextEncoder().encode(payloadB64);
    const sigBuf = await crypto.subtle.sign("HMAC", key, data);
    const expected = uint8ToB64url(new Uint8Array(sigBuf));
    if (expected !== sigB64) return false;

    const payloadJson = new TextDecoder().decode(b64urlToUint8Array(payloadB64));
    const payload = JSON.parse(payloadJson) as { sub?: string; exp?: number };
    return payload?.sub === "card" && typeof payload?.exp === "number" && Date.now() < payload.exp!;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Allow /card/qr and /card/access
  if (pathname.startsWith("/card/qr") || pathname.startsWith("/card/access")) {
    return NextResponse.next();
  }

  // Already unlocked via cookie?
  if (req.cookies.get("card_auth")?.value === "1") return NextResponse.next();

  // Token path (works for /api/vcard?t=...)
  if (await verifyToken(searchParams.get("t"))) return NextResponse.next();

  // Otherwise, ask for PIN
  const url = req.nextUrl.clone();
  url.pathname = "/card/access";
  url.search = ""; // no next param needed
  return NextResponse.redirect(url);
}
