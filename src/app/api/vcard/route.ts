import { NextResponse } from "next/server";
import { verifyCardToken } from "@/lib/cardToken";
import { redis } from "@/lib/redis";

function secondsUntil(msEpoch: number) {
  return Math.max(1, Math.floor((msEpoch - Date.now()) / 1000));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const t = url.searchParams.get("t") || "";
  const payload = await verifyCardToken(t);
  if (!payload) return new NextResponse("Unauthorized", { status: 401 });

  // Rate limit per IP (best-effort)
  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") || "unknown";
  if (redis) {
    const key = `card:rl:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60); // 1-minute window
    if (count > 6) return new NextResponse("Too many requests", { status: 429 });
  }

  // Single use via jti
  if (redis) {
    const key = `card:jti:${payload.jti}`;
    // Set NX; if already present -> replay
    const ok = await redis.set(key, "1", { nx: true, ex: secondsUntil(payload.exp) });
    if (ok !== "OK") return new NextResponse("Link expired or already used", { status: 410 });
  }

  // Build vCard (your existing implementation)
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || `${url.protocol}//${url.host}`;

  let photoLine = "";
  try {
    const imgRes = await fetch(`${origin}/images/avatar.jpg`, { cache: "no-store" });
    if (imgRes.ok) {
      const ab = await imgRes.arrayBuffer();
      const b64 = Buffer.from(ab).toString("base64");
      photoLine = fold(`PHOTO;ENCODING=b;TYPE=JPEG:${b64}`);
    }
  } catch {}

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Gottschling;Brandon;;;",
    "FN:Brandon Gottschling",
    "ORG:LIT",
    "TITLE:Technical Marketing & Builder",
    "TEL;TYPE=CELL:+1-770-480-7979",
    "EMAIL;TYPE=INTERNET:hello@brandongottschling.com",
    "URL:https://brandongottschling.com",
    "ADR;TYPE=WORK:;;Georgia, USA;;;;",
    photoLine,
    "END:VCARD",
  ].filter(Boolean);

  const vcf = lines.join("\r\n");
  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Brandon-Gottschling.vcf"',
      "Cache-Control": "no-store, private",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function fold(s: string, max = 73) {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max));
  return out.join("\r\n ");
}
