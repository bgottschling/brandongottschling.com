// src/app/api/proposal/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

/* ------------------------------ Types ------------------------------ */
interface Experience {
  title?: string;
  role?: string;
  company?: string;
  org?: string;
  range?: string;
  dates?: string;
  scope?: string;
  metrics?: string[];      // NEW: numbers/impacts
  highlights?: string[];   // bullets
  bullets?: string[];      // alias
}

interface SkillGroup {
  name?: string;
  title?: string;
  items?: string[];
}

interface CvModule {
  NAME?: string; HEADLINE?: string; LOCATION?: string; EMAIL?: string; WEBSITE?: string;
  EXEC_SUMMARY?: string[];
  EXPERIENCES?: Experience[];
  SKILL_GROUPS?: SkillGroup[];
  // alt keys used in your repo
  experiences?: Experience[];
  skills?: SkillGroup[];
}

interface CvDataResolved {
  NAME: string;
  HEADLINE: string;
  LOCATION: string;
  EMAIL: string;
  WEBSITE: string;
  EXEC_SUMMARY: string[];
  EXPERIENCES: Experience[];
  SKILL_GROUPS: SkillGroup[];
}

/* ------------------------ WinAnsi-safe text ------------------------ */
function sanitizeForWinAnsi(input: string): string {
  let s = input.replace(/\r\n|\r|\n/g, " ");
  s = s.replace(/[\u200B-\u200D\u2060]/g, "");          // zero-widths
  s = s.replace(/[\u00A0\u202F\u2007]/g, " ");          // nbsp variants
  s = s
    .replace(/\u2192/g, "->").replace(/\u2190/g, "<-").replace(/\u2194/g, "<->")
    .replace(/\u21D2/g, "=>").replace(/\u21D0/g, "<=").replace(/\u21D4/g, "<=>")
    .replace(/[\u2018\u2019\u201B]/g, "'").replace(/[\u201C\u201D\u201F]/g, '"')
    .replace(/\u2013/g, "-").replace(/\u2014/g, "--").replace(/\u2026/g, "...")
    .replace(/\u2122/g, "TM").replace(/\u00AE/g, "(R)").replace(/\u00A9/g, "(C)");
  s = s.replace(/[^\u0000-\u00FF]/g, "?");
  return s;
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const safe = sanitizeForWinAnsi(text);
  const words = safe.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------------------------- Data loader -------------------------- */
async function loadCvData(): Promise<CvDataResolved> {
  try {
    const mod = (await import("@/data/cv")) as CvModule;
    return {
      NAME: mod.NAME ?? "Brandon Gottschling",
      HEADLINE: mod.HEADLINE ?? "People-first technologist and proposal developer.",
      LOCATION: mod.LOCATION ?? "Atlanta, GA (US)",
      EMAIL: mod.EMAIL ?? "hello@brandongottschling.com",
      WEBSITE: mod.WEBSITE ?? "https://brandongottschling.com",
      EXEC_SUMMARY: Array.isArray(mod.EXEC_SUMMARY) ? mod.EXEC_SUMMARY : [],
      EXPERIENCES: Array.isArray(mod.EXPERIENCES) ? mod.EXPERIENCES : (Array.isArray(mod.experiences) ? mod.experiences : []),
      SKILL_GROUPS: Array.isArray(mod.SKILL_GROUPS) ? mod.SKILL_GROUPS : (Array.isArray(mod.skills) ? mod.skills : []),
    };
  } catch {
    return {
      NAME: "Brandon Gottschling",
      HEADLINE: "People-first technologist and proposal developer.",
      LOCATION: "Atlanta, GA (US)",
      EMAIL: "hello@brandongottschling.com",
      WEBSITE: "https://brandongottschling.com",
      EXEC_SUMMARY: [],
      EXPERIENCES: [],
      SKILL_GROUPS: [],
    };
  }
}

/* --------------------------- Drawing helpers ----------------------- */
const MARGIN = 56;
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_MUTED = rgb(0.35, 0.35, 0.35);
const COLOR_RULE = rgb(0.85, 0.85, 0.85);

function drawRule(page: PDFPage, x1: number, x2: number, y: number) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 1, color: COLOR_RULE });
}

function drawHeader(page: PDFPage, text: string, helvBold: PDFFont, x: number, y: number): number {
  page.drawText(sanitizeForWinAnsi(text), { x, y, size: 14, font: helvBold, color: COLOR_TEXT });
  return y - 22;
}

function drawLabel(page: PDFPage, label: string, helvBold: PDFFont, x: number, y: number): number {
  page.drawText(sanitizeForWinAnsi(label), { x, y, size: 11, font: helvBold, color: COLOR_TEXT });
  return y - 14;
}

function drawParagraph(page: PDFPage, text: string, width: number, helv: PDFFont, x: number, y: number, size = 11): number {
  for (const line of wrapText(text, width, helv, size)) {
    page.drawText(line, { x, y, size, font: helv, color: COLOR_TEXT });
    y -= size + 5;
  }
  return y;
}

function drawBulletList(
  page: PDFPage, items: string[], width: number, helv: PDFFont, x: number, y: number, size = 11
): number {
  const bulletX = x;
  const textX = x + 12;
  for (const raw of items) {
    const lines = wrapText(raw, width - 12, helv, size);
    // draw a tiny circle bullet (no encoding needed)
    page.drawCircle({ x: bulletX + 3, y: y + size / 3, size: 1.75, color: COLOR_TEXT, borderColor: COLOR_TEXT });
    for (const line of lines) {
      page.drawText(line, { x: textX, y, size, font: helv });
      y -= size + 3;
    }
    y -= 3;
  }
  return y;
}

function addPageNumber(page: PDFPage, index: number, total: number, helv: PDFFont) {
  const { width } = page.getSize();
  const text = `Page ${index + 1} of ${total}`;
  page.drawText(text, { x: width - MARGIN - helv.widthOfTextAtSize(text, 9), y: 28, size: 9, font: helv, color: COLOR_MUTED });
}

/* ------------------------------- Route ----------------------------- */
export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || `${reqUrl.protocol}//${reqUrl.host}`;

  const { NAME, HEADLINE, LOCATION, EMAIL, WEBSITE, EXEC_SUMMARY, EXPERIENCES, SKILL_GROUPS } =
    await loadCvData();

  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  /* ------------------------------- Cover ---------------------------- */
  {
    const page = pdf.addPage();
    const { width, height } = page.getSize();
    let y = height - MARGIN;

    // Avatar (best-effort)
    try {
      const imgRes = await fetch(`${origin}/images/avatar.jpg`, { cache: "no-store" });
      if (imgRes.ok) {
        const img = await imgRes.arrayBuffer();
        const jpg = await pdf.embedJpg(img);
        const size = 96;
        page.drawImage(jpg, { x: MARGIN, y: y - size, width: size, height: size });
      }
    } catch {}

    page.drawText(sanitizeForWinAnsi(NAME), { x: MARGIN + 112, y: y - 24, size: 26, font: helvBold });
    page.drawText(sanitizeForWinAnsi(HEADLINE), { x: MARGIN + 112, y: y - 50, size: 12.5, font: helv, color: COLOR_MUTED });
    y -= 120;

    const contact = `${LOCATION}  -  ${EMAIL}  -  ${WEBSITE}`;
    page.drawText(sanitizeForWinAnsi(contact), { x: MARGIN, y, size: 10.5, font: helv, color: COLOR_MUTED });
    y -= 18;

    drawRule(page, MARGIN, width - MARGIN, y); y -= 6;

    page.drawText("Proposal Package", { x: MARGIN, y, size: 12, font: helvBold }); y -= 16;
    page.drawText(
      "A concise snapshot: mission, executive summary, experience, and skills.",
      { x: MARGIN, y, size: 10.5, font: helv, color: COLOR_MUTED }
    );
  }

  /* ------------------- Mission & Executive Summary ------------------ */
  {
    const page = pdf.addPage();
    const { width, height } = page.getSize();
    let y = height - MARGIN;

    y = drawHeader(page, "Mission & Executive Summary", helvBold, MARGIN, y);
    drawRule(page, MARGIN, width - MARGIN, y); y -= 18;

    const mission =
      "Build useful things, tell honest stories, and show up for people. " +
      "Share what I'm learning so others can move with more courage, clarity, and hope. " +
      "I want this work to be more than output. I'm learning to be the kind of person who shows up—" +
      "steady at home, useful in the world. That looks like working hard, seeking peace, and making " +
      "things that genuinely help.";

    y = drawLabel(page, "Mission", helvBold, MARGIN, y);
    y = drawParagraph(page, mission, width - MARGIN * 2, helv, MARGIN, y, 11);

    y -= 6;
    y = drawLabel(page, "Executive Summary", helvBold, MARGIN, y);
    const bullets = (Array.isArray(EXEC_SUMMARY) && EXEC_SUMMARY.length) ? EXEC_SUMMARY : [
      "Builder-minded marketer who translates messy needs into clear proposals and shippable artifacts.",
      "Facilitator who gets the right people in the room and keeps decisions legible.",
      "Direction of travel: reliable programs where quality execution and trust are the product.",
    ];
    y = drawBulletList(page, bullets.map(sanitizeForWinAnsi), width - MARGIN * 2, helv, MARGIN, y, 11);
  }

  /* ----------------------------- Experience ------------------------- */
  if (Array.isArray(EXPERIENCES) && EXPERIENCES.length) {
    let page = pdf.addPage();
    const { width, height } = page.getSize();
    let y = height - MARGIN;

    y = drawHeader(page, "Experience", helvBold, MARGIN, y);
    drawRule(page, MARGIN, width - MARGIN, y); y -= 16;

    const lineWidth = width - MARGIN * 2;

    for (const exp of EXPERIENCES) {
      const role = exp.title || exp.role || "";
      const company = exp.company || exp.org || "";
      const header = [role, company].filter(Boolean).join(" - ");
      const when = exp.range || exp.dates || "";

      // Header
      page.drawText(sanitizeForWinAnsi(header), { x: MARGIN, y, size: 12, font: helvBold }); y -= 15;
      if (when) { page.drawText(sanitizeForWinAnsi(when), { x: MARGIN, y, size: 10, font: helv, color: COLOR_MUTED }); y -= 12; }

      // Scope
      if (exp.scope) {
        y = drawLabel(page, "Scope", helvBold, MARGIN, y);
        y = drawParagraph(page, exp.scope, lineWidth, helv, MARGIN, y, 10.5);
      }

      // Metrics
      const metrics = Array.isArray(exp.metrics) ? exp.metrics : [];
      if (metrics.length) {
        y = drawLabel(page, "Metrics", helvBold, MARGIN, y);
        y = drawBulletList(page, metrics, lineWidth, helv, MARGIN, y, 10.5);
      }

      // Highlights (or bullets alias)
      const highlights = (Array.isArray(exp.highlights) ? exp.highlights : exp.bullets) ?? [];
      if (highlights.length) {
        y = drawLabel(page, "Highlights", helvBold, MARGIN, y);
        y = drawBulletList(page, highlights, lineWidth, helv, MARGIN, y, 10.5);
      }

      y -= 8;
      if (y < 96) {
        page = pdf.addPage();
        y = page.getSize().height - MARGIN;
      }
    }
  }

  /* -------------------------------- Skills -------------------------- */
  if (Array.isArray(SKILL_GROUPS) && SKILL_GROUPS.length) {
    const page = pdf.addPage();
    const { width, height } = page.getSize();
    let y = height - MARGIN;

    y = drawHeader(page, "Skills", helvBold, MARGIN, y);
    drawRule(page, MARGIN, width - MARGIN, y); y -= 16;

    const colGap = 24;
    const colWidth = (width - MARGIN * 2 - colGap) / 2;
    let col = 0;
    let topY = y;

    for (const g of SKILL_GROUPS) {
      const x = MARGIN + (col * (colWidth + colGap));
      page.drawText(sanitizeForWinAnsi(g.name || g.title || "Skills"), { x, y: topY, size: 12, font: helvBold });

      let yy = topY - 14;
      const items = Array.isArray(g.items) ? g.items : [];
      const text = items.join(" · "); // separator shown; drawText is WinAnsi-safe

      for (const line of wrapText(text, colWidth, helv, 10.5)) {
        page.drawText(line, { x, y: yy, size: 10.5, font: helv });
        yy -= 14;
      }

      if (col === 0) col = 1; else { col = 0; topY = Math.min(yy, topY) - 18; }
    }

    page.drawText("Thank you for your consideration.", {
      x: MARGIN, y: 56, size: 11, font: helv, color: COLOR_MUTED,
    });
  }

  /* ---------------------------- Page numbers ------------------------ */
  const pages = pdf.getPages();
  for (let i = 0; i < pages.length; i++) addPageNumber(pages[i], i, pages.length, helv);

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Brandon-Gottschling-Proposal.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
