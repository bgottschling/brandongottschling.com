import { NextResponse } from "next/server";

function originFromReq(reqUrl: string) {
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN) return process.env.NEXT_PUBLIC_SITE_ORIGIN;
  const u = new URL(reqUrl);
  return `${u.protocol}//${u.host}`;
}

// Only allow site-internal paths like "/card", "/card?x=y"
function sanitizeNext(v?: string | null): string {
  if (!v) return "/card";
  try {
    // If someone sent an absolute URL, discard host and keep pathname+search
    if (v.startsWith("http://") || v.startsWith("https://")) {
      const u = new URL(v);
      return u.pathname + (u.search || "");
    }
  } catch {}
  return v.startsWith("/") ? v : "/card";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const pin = (form.get("pin") ?? "").toString();
  const nextPath = sanitizeNext(form.get("next")?.toString());
  const origin = originFromReq(req.url);

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
