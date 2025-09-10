import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const PROTECTED_PATHS = ["/card", "/api/vcard"];

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function verifyToken(t?: string | null): boolean {
  if (!t) return false;
  const [payloadB64, sig] = t.split(".");
  if (!payloadB64 || !sig) return false;
  const h = crypto.createHmac("sha256", process.env.CARD_TOKEN_SECRET!);
  h.update(payloadB64);
  const expected = h.digest("base64url");
  if (expected !== sig) return false;
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as { sub: string; exp: number };
  return payload.sub === "card" && Date.now() < payload.exp;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();

  // already authed via cookie?
  const authed = req.cookies.get("card_auth")?.value === "1";
  if (authed) return NextResponse.next();

  // token path (from QR)
  const token = searchParams.get("t");
  if (verifyToken(token)) return NextResponse.next();

  // otherwise send to access page
  const url = req.nextUrl.clone();
  url.pathname = "/card/access";
  url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/card/:path*", "/api/vcard/:path*"],
};
