import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

type PdfBuf = Buffer | Uint8Array;

async function settle(page: any) {
  // 1) Wait for your main content wrapper (don’t fail if missing)
  try { await page.waitForSelector("#cv-print-root", { timeout: 8000 }); } catch {}

  // 2) Give the background canvas a moment to draw if present
  try { await page.waitForSelector(".background-canvas", { timeout: 3000 }); } catch {}

  // 3) Ensure web fonts have loaded (prevents blank text)
  try {
    await page.evaluate(async () => {
      if (document && (document as any).fonts && typeof (document as any).fonts.ready?.then === "function") {
        await (document as any).fonts.ready;
      }
      // Optional: add a class so you can tweak styles for PDF only
      document.documentElement.classList.add("pdf-export");
    });
  } catch {}

  // 4) If Puppeteer exposes waitForNetworkIdle, use it
  try {
    if (typeof page.waitForNetworkIdle === "function") {
      await page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 });
    }
  } catch {}

  // 5) Final small pause to let layout settle (portable across versions)
  await page.evaluate((ms) => new Promise((r) => setTimeout(r, ms)), 500);
}

async function renderWithLocalPuppeteer(url: string): Promise<PdfBuf> {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
  } as any);

  const page = await browser.newPage();
  // A realistic UA can help some sites render fonts/backgrounds consistently
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
  );

  await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.emulateMediaType("screen");

  // Ensure exact color in print output
  await page.addStyleTag({ content: `
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  `});

  await settle(page);

  const pdf = await page.pdf({
    printBackground: true,
    preferCSSPageSize: true,         // respect @page in your CSS if any
    format: "A4",                    // fallback when no @page is set
    margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
  });

  await browser.close();
  return pdf;
}

async function renderWithChromium(url: string): Promise<PdfBuf> {
  const chromium = await import("@sparticuz/chromium");
  const puppeteerCore = await import("puppeteer-core");

  const browser = await puppeteerCore.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
  } as any);

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
  );

  await page.goto(url, { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.emulateMediaType("screen");
  await page.addStyleTag({ content: `
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  `});

  await settle(page);

  const pdf = await page.pdf({
    printBackground: true,
    preferCSSPageSize: true,
    format: "A4",
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

    // If something bizarre happened, avoid sending a zero-byte file
    if (!pdf || (Array.isArray(pdf) ? pdf.length === 0 : (pdf as any).byteLength === 0)) {
      return new Response(JSON.stringify({ error: "Renderer returned an empty PDF buffer" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    return new Response(pdf as any, {
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
