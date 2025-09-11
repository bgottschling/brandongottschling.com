export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const Body = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(20, "Message must be at least 20 characters").max(2000),
  website: z.string().optional(),        // honeypot
  startedAt: z.number().int().optional() // dwell-time guard
});

const resendKey = process.env.RESEND_API_KEY;
const TO = process.env.CONTACT_TO;
const FROM = process.env.CONTACT_FROM || "Website <no-reply@brandongottschling.com>";
const ORIGIN_ENV = process.env.NEXT_PUBLIC_SITE_ORIGIN || "";
const EXTRA = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

function normalizeOrigin(o: string) {
  const u = new URL(o);
  const host = u.hostname.replace(/^www\./, "");
  const port = u.port ? `:${u.port}` : "";
  return `${u.protocol}//${host}${port}`;
}

function allowedOrigin(req: Request) {
  // Build an allowlist: request’s own origin, NEXT_PUBLIC_SITE_ORIGIN, any ALLOWED_ORIGINS, and their www/apex variants.
  const self = new URL(req.url).origin;
  const candidates = new Set<string>([self]);
  if (ORIGIN_ENV) candidates.add(ORIGIN_ENV);
  for (const x of EXTRA) candidates.add(x);

  // Normalize and add www/apex mirrors
  const expanded = new Set<string>();
  for (const c of candidates) {
    try {
      const n = normalizeOrigin(c);
      expanded.add(n);
      const u = new URL(c);
      const host = u.hostname;
      if (host.startsWith("www.")) {
        expanded.add(`${u.protocol}//${host.slice(4)}`);
      } else {
        expanded.add(`${u.protocol}//www.${host}`);
      }
    } catch {}
  }

  // Check referrer or origin header
  const ref = (req.headers.get("referer") || req.headers.get("origin") || "").trim();
  if (!ref) return true; // don’t block when header missing (some browsers)
  try {
    const n = normalizeOrigin(new URL(ref).origin);
    return expanded.has(n);
  } catch {
    return true; // can’t parse → don’t hard fail
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      // Return first zod error for better UX
      const issue = parsed.error.issues[0];
      return NextResponse.json({ error: issue?.message || "Invalid payload" }, { status: 400 });
    }
    const { name, email, message, website, startedAt } = parsed.data;

    // Honeypot
    if (website && website.trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Dwell-time (2s)
    const MIN_MS = 2000;
    if (!startedAt || Date.now() - startedAt < MIN_MS) {
      return NextResponse.json({ error: "Please wait a moment before sending." }, { status: 429 });
    }

    // Origin check (normalized, preview-friendly)
    if (!allowedOrigin(req)) {
      return NextResponse.json({ error: "Bad origin" }, { status: 400 });
    }

    if (!TO) {
      return NextResponse.json({ error: "CONTACT_TO not configured" }, { status: 500 });
    }

    const text = `New contact from ${name} <${email}>\n\n${message}\n`;
    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5">
        <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <pre style="white-space:pre-wrap">${escapeHtml(message)}</pre>
      </div>`;

    if (!resendKey) {
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
