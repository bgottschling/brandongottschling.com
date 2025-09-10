import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = { matcher: ["/card", "/api/vcard"] };

function getCookieValid(req: NextRequest): boolean {
  const version = process.env.CARD_AUTH_VERSION || "1";
  const expected = `v=${version}`;
  return req.cookies.get("card_auth_v2")?.value === expected;
}

// base64url helpers
function b64urlToU8(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4; if (pad) b64 += "=".repeat(4 - pad);
  const bin = atob(b64); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function u8ToB64url(arr: Uint8Array): string {
  let bin = ""; for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyToken(t?: string | null): Promise<boolean> {
  try {
    if (!t) return false;
    const [payloadB64, sigB64] = t.split(".");
    if (!payloadB64 || !sigB64) return false;

    const secret = process.env.CARD_TOKEN_SECRET || "";
    if (!secret) return false;

    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );

    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
    if (u8ToB64url(new Uint8Array(sig)) !== sigB64) return false;

    const data = JSON.parse(new TextDecoder().decode(b64urlToU8(payloadB64))) as { sub?: string; exp?: number };
    return data?.sub === "card" && typeof data?.exp === "number" && Date.now() < data.exp!;
  } catch { return false; }
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Allow QR & access page
  if (pathname.startsWith("/card/qr") || pathname.startsWith("/card/access")) {
    return NextResponse.next();
  }

  // Accept versioned cookie OR short-lived token
  if (getCookieValid(req)) return NextResponse.next();
  if (await verifyToken(searchParams.get("t"))) return NextResponse.next();

  // Otherwise challenge
  const url = req.nextUrl.clone();
  url.pathname = "/card/access";
  url.search = "";
  return NextResponse.redirect(url);
}
