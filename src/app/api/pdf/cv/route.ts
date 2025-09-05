import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

type PdfBuf = Buffer | Uint8Array;

async function settle(page: any) {
  try { await page.waitForSelector(".background-canvas", { timeout: 3000 }); } catch {}
  try { await page.waitForSelector("#cv-print-root", { timeout: 4000 }); } catch {}
  try {
    if (typeof page.waitForNetworkIdle === "function") {
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 });
    }
  } catch {}
  await page.evaluate((ms) => new Promise((r) => setTimeout(r, ms)), 700);
}

async function renderWithLocalPuppeteer(url: string): Promise<PdfBuf> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
  } as any);
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" }).catch(() => {});
  await page.emulateMediaType("screen");
  await settle(page);
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
  });
  await browser.close();
  return pdf;
}

async function renderWithChromium(url: string): Promise<PdfBuf> {
  const chromium = await import("@sparticuz/chromium");
  const puppeteerCore = await import("puppeteer-core");
  const executablePath = await chromium.executablePath();
  const browser = await puppeteerCore.launch({
    args: chromium.args,
    executablePath,
    headless: chromium.headless,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
  } as any);
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" }).catch(() => {});
  await page.emulateMediaType("screen");
  await settle(page);
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
  });
  await browser.close();
  return pdf;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    if (!url || !/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: "Missing or invalid ?url=" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const pdf: PdfBuf = process.env.VERCEL
      ? await renderWithChromium(url)
      : await renderWithLocalPuppeteer(url);

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Brandon-Gottschling-CV.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    const msg = err?.message || String(err) || "Unknown PDF error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}
