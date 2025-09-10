import { NextResponse } from "next/server";

function originFromReq(reqUrl: string) {
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN) return process.env.NEXT_PUBLIC_SITE_ORIGIN;
  const u = new URL(reqUrl);
  return `${u.protocol}//${u.host}`;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const pin = (form.get("pin") ?? "").toString();
  const origin = originFromReq(req.url);

  if (pin !== process.env.CARD_PIN) {
    const redirect = new URL("/card/access", origin);
    redirect.searchParams.set("error", "Invalid code");
    // 303 so the browser turns POST → GET on the next page
    return NextResponse.redirect(redirect, 303);
  }

  const res = NextResponse.redirect(new URL("/card", origin), 303); // ← 303 here
  res.cookies.set("card_auth", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return res;
}
