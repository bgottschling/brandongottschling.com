import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const pin = form.get("pin")?.toString() || "";
  const nextUrl = new URL(req.url).searchParams.get("next") || "/card";
  const ok = pin === process.env.CARD_PIN;
  if (!ok) {
    const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/card/access`);
    url.searchParams.set("error", "Invalid code");
    url.searchParams.set("next", nextUrl);
    return NextResponse.redirect(url);
  }
  const res = NextResponse.redirect(new URL(nextUrl, process.env.NEXT_PUBLIC_SITE_URL));
  res.cookies.set("card_auth", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12, // 12h session
    path: "/",
  });
  return res;
}
