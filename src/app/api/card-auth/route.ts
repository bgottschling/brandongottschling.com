import { NextResponse } from "next/server";

function originFromReq(reqUrl: string) {
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN) return process.env.NEXT_PUBLIC_SITE_ORIGIN;
  const u = new URL(reqUrl); return `${u.protocol}//${u.host}`;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const pin = (form.get("pin") ?? "").toString();
  const origin = originFromReq(req.url);

  if (pin !== process.env.CARD_PIN) {
    const redirect = new URL("/card/access", origin);
    redirect.searchParams.set("error", "Invalid code");
    return NextResponse.redirect(redirect, 303);
  }

  const version = process.env.CARD_AUTH_VERSION || "1";
  const res = NextResponse.redirect(new URL("/card", origin), 303);
  res.cookies.set("card_auth_v2", `v=${version}`, {
    httpOnly: true, secure: true, sameSite: "strict",
    maxAge: 2 * 60 * 60, // 2 hours
    path: "/",
  });
  return res;
}
