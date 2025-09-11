import { NextResponse } from "next/server";

function originFromReq(reqUrl: string) {
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN) return process.env.NEXT_PUBLIC_SITE_ORIGIN;
  const u = new URL(reqUrl); return `${u.protocol}//${u.host}`;
}

// only allow internal /card* destinations
function safeNextPath(raw: string | null | undefined): string {
  if (!raw) return "/card";
  try {
    // Support plain path (`/card/qr`) or full URL on same origin
    const asUrl = raw.startsWith("http") ? new URL(raw) : new URL(raw, "http://local");
    const path = asUrl.pathname + (asUrl.search || "");
    return path.startsWith("/card") ? path : "/card";
  } catch { return "/card"; }
}

export async function POST(req: Request) {
  const form = await req.formData();
  const pin = (form.get("pin") ?? "").toString();
  const nextRaw = (form.get("next") ?? "").toString();
  const nextPath = safeNextPath(nextRaw);
  const origin = originFromReq(req.url);

  if (pin !== process.env.CARD_PIN) {
    const redirect = new URL("/card/access", origin);
    redirect.searchParams.set("error", "Invalid code");
    redirect.searchParams.set("next", nextPath);
    return NextResponse.redirect(redirect, 303);
  }

  const version = process.env.CARD_AUTH_VERSION || "1";
  const res = NextResponse.redirect(new URL(nextPath, origin), 303);
  res.cookies.set("card_auth_v2", `v=${version}`, {
    httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 2 * 60 * 60,
  });
  return res;
}
