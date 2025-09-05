import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

/** Normalize to Uint8Array (Buffer is a Uint8Array subclass, so this covers both) */
function toUint8Array(buf: unknown): Uint8Array {
  if (buf instanceof Uint8Array) return buf;
  throw new Error("Unexpected PDF buffer type");
}

/** Minimal surface we rely on from Puppeteer Page (works for puppeteer & puppeteer-core) */
type WaitUntil = "load" | "domcontentloaded" | "networkidle0" | "networkidle2";

type MinimalPage = {
  waitForSelector: (selector: string, opts?: { timeout?: number }) => Promise<unknown>;
  waitForNetworkIdle?: (opts?: { idleTime?: number; timeout?: number }) => Promise<unknown>;
  evaluate: <T>(fn: (...fArgs: unknown[]) => T | Promise<T>, ...args: unknown[]) => Promise<T>;
  addStyleTag: (opts: { content?: string }) => Promise<unknown>;
  goto: (url: string, opts?: { waitUntil?: WaitUntil }) => Promise<unknown>;
  emulateMediaType: (type: "screen" | "print" | null) => Promise<void>;
  pdf: (opts: {
    printBackground?: boolean;
    preferCSSPageSize?: boolean;
    format?: string;
    margin?: { top?: string; right?: string; bottom?: string; left?: string };
  }) => Promise<unknown>;
  setUserAgent?: (ua: string) => Promise<void>;
};

function hasWaitForNetworkIdle(
  p: MinimalPage
): p is MinimalPage & { waitForNetworkIdle: (opts?: { idleTime?: number; timeout?: number }) => Promise<unknown> } {
  return typeof p.waitForNetworkIdle === "function";
}

/** Give the page time to finish fonts, canvas, and late network */
async function settle(page: MinimalPage): Promise<void> {
  try { await page.waitForSelector("#cv-print-root", { timeout: 8000 }); } catch {}
  try { await page.waitForSelector(".background-canvas", { timeout: 3000 }); } catch {}

  // Ensure web fonts are ready and mark print mode
  try {
    await page.evaluate(async () => {
      const fontsReady = (document as any)?.fonts?.ready;
      if (fontsReady && typeof (fontsReady as Promise<unknown>).then === "function") {
        await fontsReady;
      }
      document.documentElement.classList.add("pdf-export");
    });
  } catch {}

  if (hasWaitForNetworkIdle(page)) {
    try { await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 }); } catch {}
  }

  // Small extra settle so the canvas watermark + fonts are fully painted
  await page.evaluate((ms: number) => new Promise<void>((r) => setTimeout(r, ms)), 500);
}

/** Local dev: launch Chrome via `puppeteer` */
async function renderWithLocalPuppeteer(url: string): Promise<Uint8Array> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
  });

  try {
    const page = (await browser.newPage()) as unknown as MinimalPage;
    if (page.setUserAgent) {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
      );
    }
    await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => undefined);
    await page.emulateMediaType("screen");
    await page.addStyleTag({ content: "*{-webkit-print-color-adjust:exact;print-color-adjust:exact}" });
    await settle(page);

    const raw = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      format: "A4",
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    return toUint8Array(raw);
  } finally {
    await browser.close();
  }
}

/** Vercel prod: serverless Chrome via `@sparticuz/chromium` + `puppeteer-core` */
async function renderWithChromium(url: string): Promise<Uint8Array> {
  const chromium = await import("@sparticuz/chromium");
  const puppeteerCore = await import("puppeteer-core");

  const browser = await puppeteerCore.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
  });

  try {
    const page = (await browser.newPage()) as unknown as MinimalPage;
    if (page.setUserAgent) {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
      );
    }
    await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => undefined);
    await page.emulateMediaType("screen");
    await page.addStyleTag({ content: "*{-webkit-print-color-adjust:exact;print-color-adjust:exact}" });
    await settle(page);

    const raw = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      format: "A4",
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    return toUint8Array(raw);
  } finally {
    await browser.close();
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url || !/^https?:\/\//i.test(url)) {
    return new Response(JSON.stringify({ error: "Missing or invalid ?url=" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  try {
    const pdf = process.env.VERCEL
      ? await renderWithChromium(url)
      : await renderWithLocalPuppeteer(url);

    if (!pdf.byteLength) {
      return new Response(JSON.stringify({ error: "Renderer returned an empty PDF buffer" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Brandon-Gottschling-CV.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown PDF error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}
