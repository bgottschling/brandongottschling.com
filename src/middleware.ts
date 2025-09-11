import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyCardToken } from "@/lib/cardToken";

export const config = { matcher: ["/card", "/card/qr", "/api/vcard"] };

function cookieOK(req: NextRequest) {
  const version = process.env.CARD_AUTH_VERSION || "1";
  return req.cookies.get("card_auth_v2")?.value === `v=${version}`;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Helper to send to access with ?next=<original>
  const sendToAccess = () => {
    const url = req.nextUrl.clone();
    url.pathname = "/card/access";
    const orig = `${pathname}${req.nextUrl.search || ""}`;
    url.search = `?next=${encodeURIComponent(orig)}`;
    return NextResponse.redirect(url);
  };

  // 1) QR page: require cookie
  if (pathname.startsWith("/card/qr")) {
    if (cookieOK(req)) return NextResponse.next();
    return sendToAccess();
  }

  // 2) vCard download: token-only (kept from your hardened flow)
  if (pathname.startsWith("/api/vcard")) {
    const t = req.nextUrl.searchParams.get("t") || "";
    const ok = await verifyCardToken(t);
    return ok ? NextResponse.next() : new NextResponse("Unauthorized", { status: 401 });
  }

  // 3) /card: allow cookie or valid token; else challenge
  if (pathname === "/card") {
    if (cookieOK(req)) return NextResponse.next();
    const t = req.nextUrl.searchParams.get("t") || "";
    if (await verifyCardToken(t)) return NextResponse.next();
    return sendToAccess();
  }

  return NextResponse.next();
}
