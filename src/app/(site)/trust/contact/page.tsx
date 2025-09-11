// src/app/(site)/trust/contact/page.tsx
"use client";

import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const Schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(20).max(2000),
  website: z.string().optional(),      // honeypot
  startedAt: z.number().int().optional(), // dwell-time guard
});

export default function ContactPage() {
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const startedAt = React.useMemo(() => Date.now(), []);

async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      setBusy(true);
      setErr(null);
      setOk(null);

      // 1) Collect + validate (client-side)
      const fd = new FormData(e.currentTarget);
      const payload = {
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        message: String(fd.get("message") || ""),
        website: String(fd.get("website") || ""), // honeypot
        startedAt, // from useMemo(Date.now())
      };

      const parsed = Schema.safeParse(payload);
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        setErr(first?.message || "Please check your entries and try again.");
        setBusy(false);
        return;
      }

      // 2) POST with a safety timeout
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000); // 15s

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
          signal: controller.signal,
        });

        const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({} as any));

        if (!res.ok) {
          // Helpful messaging for common cases
          if (res.status === 429) {
            throw new Error(data.error || "Please wait a moment before sending.");
          }
          if (res.status === 400 && (data.error || "").toLowerCase().includes("origin")) {
            throw new Error(
              "Bad origin: please submit from the site’s contact page (don’t post the API URL directly)."
            );
          }
          throw new Error(data.error || "Send failed. Please try again.");
        }

        setOk("Thanks — I’ll get back to you soon.");
        (e.target as HTMLFormElement).reset();
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setErr("Network timeout — please try again.");
        } else {
          setErr(err instanceof Error ? err.message : "Send failed. Please try again.");
        }
      } finally {
        clearTimeout(t);
        setBusy(false);
      }
}

  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="text-3xl/tight font-semibold tracking-tight">Contact</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Short intro + what you’re looking for. I’ll reply as soon as possible.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* Honeypot */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
        <input type="hidden" name="startedAt" value={String(startedAt)} />

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" type="email" required className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea name="message" required rows={6} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={busy} className="h-10 px-4">
            {busy ? "Sending…" : "Send message"}
          </Button>
          {ok && <div className="text-sm text-green-600">{ok}</div>}
          {err && <div className="text-sm text-red-600">{err}</div>}
        </div>
      </form>
    </main>
  );
}
