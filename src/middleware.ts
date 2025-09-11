import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyCardToken } from "@/lib/cardToken";

export const config = { matcher: ["/card", "/card/qr", "/api/vcard"] };

function cookieOK(req: NextRequest) {
  const version = process.env.CARD_AUTH_VERSION || "1";
  return req.cookies.get("card_auth_v2")?.value === `v=${version}`;
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Canonical host (optional, if you added this earlier)
  // const host = req.headers.get("host") || "";
  // if (host.startsWith("www.")) { const url = req.nextUrl.clone(); url.host = host.slice(4); return NextResponse.redirect(url, 308); }

  // 1) QR page -> must be unlocked (cookie)
  if (pathname.startsWith("/card/qr")) {
    if (cookieOK(req)) return NextResponse.next();
    const url = req.nextUrl.clone(); url.pathname = "/card/access"; url.search = "";
    return NextResponse.redirect(url);
  }

  // 2) vCard download -> TOKEN ONLY (cookie is ignored)
  if (pathname.startsWith("/api/vcard")) {
    const t = searchParams.get("t") || "";
    const payload = await verifyCardToken(t);
    return payload ? NextResponse.next() : new NextResponse("Unauthorized", { status: 401 });
  }

  // 3) Card page -> cookie OR valid token (convenience)
  if (pathname === "/card") {
    if (cookieOK(req)) return NextResponse.next();
    const t = searchParams.get("t") || "";
    if (await verifyCardToken(t)) return NextResponse.next();

    const url = req.nextUrl.clone(); url.pathname = "/card/access"; url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
