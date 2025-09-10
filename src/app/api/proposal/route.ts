export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Try to load your CV data; fall back safely if fields are named differently.
async function loadCvData() {
  try {
    const mod: any = await import("@/data/cv");
    return {
      NAME: mod.NAME ?? "Brandon Gottschling",
      HEADLINE: mod.HEADLINE ?? "People-first technologist and proposal developer.",
      LOCATION: mod.LOCATION ?? "Atlanta, GA (US)",
      EMAIL: mod.EMAIL ?? "hello@brandongottschling.com",
      EXEC_SUMMARY: mod.EXEC_SUMMARY ?? [],
      EXPERIENCES: mod.EXPERIENCES ?? mod.experiences ?? [],
      SKILL_GROUPS: mod.SKILL_GROUPS ?? mod.skills ?? [],
      WEBSITE: mod.WEBSITE ?? "https://brandongottschling.com",
    };
  } catch {
    return {
      NAME: "Brandon Gottschling",
      HEADLINE: "People-first technologist and proposal developer.",
      LOCATION: "Atlanta, GA (US)",
      EMAIL: "hello@brandongottschling.com",
      EXEC_SUMMARY: [],
      EXPERIENCES: [],
      SKILL_GROUPS: [],
      WEBSITE: "https://brandongottschling.com",
    };
  }
}

function wrapText(text: string, maxWidth: number, font: any, size: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || `${reqUrl.protocol}//${reqUrl.host}`;

  const { NAME, HEADLINE, LOCATION, EMAIL, EXEC_SUMMARY, EXPERIENCES, SKILL_GROUPS, WEBSITE } =
    await loadCvData();

  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // ---- Cover Page ----
  {
    const page = pdf.addPage();
    const { width, height } = page.getSize();
    const margin = 56;
    let y = height - margin;

    // Avatar
    try {
      const imgRes = await fetch(`${origin}/images/avatar.jpg`, { cache: "no-store" });
      if (imgRes.ok) {
        const imgBytes = await imgRes.arrayBuffer();
        const jpg = await pdf.embedJpg(imgBytes);
        const size = 96;
        page.drawImage(jpg, { x: margin, y: y - size, width: size, height: size, opacity: 1 });
      }
    } catch {}

    // Name & headline
    page.drawText(NAME, { x: margin + 112, y: y - 24, size: 24, font: helvBold, color: rgb(0, 0, 0) });
    page.drawText(HEADLINE, { x: margin + 112, y: y - 48, size: 12, font: helv, color: rgb(0.2, 0.2, 0.2) });
    y -= 120;

    // Contact row
    const contact = `${LOCATION}  •  ${EMAIL}  •  ${WEBSITE}`;
    page.drawText(contact, { x: margin, y, size: 10, font: helv, color: rgb(0.25, 0.25, 0.25) });
    y -= 22;

    // Divider
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
    y -= 28;

    // “Mission” + Exec Summary as bullets
    page.drawText("Mission & Executive Summary", { x: margin, y, size: 14, font: helvBold }); y -= 22;

    const bulletLeft = margin + 12;
    const contentWidth = width - margin - bulletLeft;
    const bullets = Array.isArray(EXEC_SUMMARY) ? EXEC_SUMMARY : [];
    const bulletItems = bullets.length ? bullets : [
      "Builder-minded marketer: synthesize market, product, and GTM into clear proposals.",
      "Own the loop from idea → prototype → narrative → shipped artifact.",
    ];
    for (const item of bulletItems) {
      const lines = wrapText(item, contentWidth, helv, 11);
      page.drawText("•", { x: margin, y, size: 12, font: helv });
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], { x: bulletLeft, y, size: 11, font: helv });
        y -= 16;
      }
      y -= 4;
      if (y < 80) break;
    }

    // Footer
    page.drawText("Proposal Package", { x: margin, y: 36, size: 9, font: helv, color: rgb(0.45,0.45,0.45) });
  }

  // ---- Experience Page(s) ----
  if (Array.isArray(EXPERIENCES) && EXPERIENCES.length) {
    let page = pdf.addPage();
    const { width, height } = page.getSize();
    const margin = 56;
    let y = height - margin;

    page.drawText("Experience", { x: margin, y, size: 14, font: helvBold }); y -= 26;

    for (const exp of EXPERIENCES) {
      const role = exp.title || exp.role || "";
      const company = exp.company || exp.org || "";
      const range = exp.range || exp.dates || "";
      const header = [role, company].filter(Boolean).join(" — ");
      page.drawText(header, { x: margin, y, size: 12, font: helvBold }); y -= 16;
      if (range) { page.drawText(range, { x: margin, y, size: 10, font: helv, color: rgb(0.35,0.35,0.35) }); y -= 14; }

      const bullets: string[] = (exp.highlights || exp.bullets || []).slice(0, 6);
      for (const b of bullets) {
        const lines = wrapText(b, width - margin*2 - 12, helv, 10.5);
        page.drawText("•", { x: margin, y, size: 11, font: helv });
        for (const line of lines) { page.drawText(line, { x: margin + 12, y, size: 10.5, font: helv }); y -= 14; }
        y -= 2;
        if (y < 80) { page = pdf.addPage(); y = page.getSize().height - margin; }
      }
      y -= 10;
      if (y < 80) { page = pdf.addPage(); y = page.getSize().height - margin; }
    }
  }

  // ---- Skills Page ----
  if (Array.isArray(SKILL_GROUPS) && SKILL_GROUPS.length) {
    const page = pdf.addPage();
    const { width, height } = page.getSize();
    const margin = 56;
    let y = height - margin;

    page.drawText("Skills", { x: margin, y, size: 14, font: helvBold }); y -= 22;

    const colGap = 24;
    const colWidth = (width - margin*2 - colGap) / 2;
    let col = 0;
    let topY = y;

    for (const g of SKILL_GROUPS) {
      const x = margin + (col * (colWidth + colGap));
      page.drawText(g.name || g.title || "Skills", { x, y: topY, size: 12, font: helvBold });
      let yy = topY - 16;

      const items = Array.isArray(g.items) ? g.items : [];
      const text = items.join(" • ");
      for (const line of wrapText(text, colWidth, helv, 10.5)) {
        page.drawText(line, { x, y: yy, size: 10.5, font: helv });
        yy -= 14;
      }

      // Next column / row
      if (col === 0) {
        col = 1;
      } else {
        col = 0; topY = Math.min(yy, topY) - 20;
      }
    }

    // Closing line
    page.drawText("Thank you for your consideration.", {
      x: margin, y: 56, size: 11, font: helv, color: rgb(0.35,0.35,0.35)
    });
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Brandon-Gottschling-Proposal.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
