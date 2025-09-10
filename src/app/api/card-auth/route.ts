import { NextResponse } from "next/server";
import { getSiteOriginFallback } from "@/lib/origin";

export async function POST(req: Request) {
  const form = await req.formData();
  const pin = (form.get("pin") ?? "").toString();
  const url = new URL(req.url);

  const next = url.searchParams.get("next") || "/card";
  const origin = getSiteOriginFallback(req.url);

  if (pin !== process.env.CARD_PIN) {
    const redirect = new URL("/card/access", origin);
    redirect.searchParams.set("error", "Invalid code");
    redirect.searchParams.set("next", next);
    return NextResponse.redirect(redirect);
  }

  const res = NextResponse.redirect(new URL(next, origin));
  res.cookies.set("card_auth", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return res;
}
