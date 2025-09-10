import { NextResponse } from "next/server";

function getOrigin(reqUrl: string) {
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN) return process.env.NEXT_PUBLIC_SITE_ORIGIN;
  const u = new URL(reqUrl);
  return `${u.protocol}//${u.host}`;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const pin = (form.get("pin") ?? "").toString();

  const url = new URL(req.url);
  const rawNext = url.searchParams.get("next");

  // sanitize: must begin with "/" and not be "null"
  const nextPath = rawNext && rawNext !== "null" && rawNext.startsWith("/") ? rawNext : "/card";
  const origin = getOrigin(req.url);

  if (pin !== process.env.CARD_PIN) {
    const redirect = new URL("/card/access", origin);
    redirect.searchParams.set("error", "Invalid code");
    redirect.searchParams.set("next", nextPath);
    return NextResponse.redirect(redirect);
  }

  const res = NextResponse.redirect(new URL(nextPath, origin));
  res.cookies.set("card_auth", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return res;
}
