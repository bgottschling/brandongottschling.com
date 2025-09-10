export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url");
  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const target = raw && raw.startsWith(site) ? raw : `${site}/cv`;

  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    // defaultViewport: chromium.defaultViewport, // Removed because it does not exist on chromium
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.goto(target, { waitUntil: "networkidle0", timeout: 60_000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Brandon-Gottschling-CV.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  } finally {
    await browser.close();
  }
}
