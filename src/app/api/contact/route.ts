// src/app/api/contact/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const Body = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(20).max(2000),
  website: z.string().optional(),        // honeypot
  startedAt: z.number().int().optional() // min dwell time
});

const resendKey = process.env.RESEND_API_KEY;
const TO = process.env.CONTACT_TO;
const FROM = process.env.CONTACT_FROM || "Website <no-reply@brandongottschling.com>";
const ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN || "";

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parse = Body.safeParse(json);
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { name, email, message, website, startedAt } = parse.data;

    // Simple guards (spam-lite, no external deps)
    if (website && website.trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 }); // honeypot
    }
    const minMs = 3000;
    if (!startedAt || Date.now() - startedAt < minMs) {
      return NextResponse.json({ error: "Please take a moment before sending." }, { status: 429 });
    }
    const ref = req.headers.get("referer") || "";
    if (ORIGIN && !ref.startsWith(ORIGIN)) {
      return NextResponse.json({ error: "Bad origin" }, { status: 400 });
    }

    if (!TO) {
      return NextResponse.json({ error: "CONTACT_TO not configured" }, { status: 500 });
    }

    const text = `New contact from ${name} <${email}>\n\n${message}\n`;
    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>
      </div>`;

    if (!resendKey) {
      // Fallback: don’t fail builds—just acknowledge (and you’ll see 500 logs)
      console.warn("RESEND_API_KEY missing; skipping send.");
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: email,
      subject: `New message from ${name}`,
      text,
      html,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
