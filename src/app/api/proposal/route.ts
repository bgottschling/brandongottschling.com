export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  PDFDocument, StandardFonts, rgb,
  type PDFFont, type PDFPage,
} from "pdf-lib";

/* ---------- Types ---------- */
interface Experience {
  title?: string; role?: string; company?: string; org?: string;
  range?: string; dates?: string; scope?: string;
  metrics?: string[]; highlights?: string[]; bullets?: string[];
}
interface SkillGroup { name?: string; title?: string; items?: string[]; }
interface CvModule {
  NAME?: string; HEADLINE?: string; LOCATION?: string; EMAIL?: string; WEBSITE?: string;
  EXEC_SUMMARY?: string[]; EXPERIENCES?: Experience[]; SKILL_GROUPS?: SkillGroup[];
  experiences?: Experience[]; skills?: SkillGroup[];
}
interface CvDataResolved {
  NAME: string; HEADLINE: string; LOCATION: string; EMAIL: string; WEBSITE: string;
  EXEC_SUMMARY: string[]; EXPERIENCES: Experience[]; SKILL_GROUPS: SkillGroup[];
}

/* ---------- WinAnsi-safe sanitizer ---------- */
function sanitize(input: string): string {
  let s = input.replace(/\r\n|\r|\n/g, " ");
  s = s.replace(/[\u200B-\u200D\u2060]/g, "");            // zero-width
  s = s.replace(/[\u00A0\u202F\u2007]/g, " ");            // nbsp variants
  s = s
    .replace(/\u2192/g, "->").replace(/\u2190/g, "<-").replace(/\u2194/g, "<->")
    .replace(/\u21D2/g, "=>").replace(/\u21D0/g, "<=").replace(/\u21D4/g, "<=>")
    .replace(/[\u2018\u2019\u201B]/g, "'").replace(/[\u201C\u201D\u201F]/g, '"')
    .replace(/\u2013/g, "-").replace(/\u2014/g, "--").replace(/\u2026/g, "...")
    .replace(/\u2122/g, "TM").replace(/\u00AE/g, "(R)").replace(/\u00A9/g, "(C)");
  return s.replace(/[^\u0000-\u00FF]/g, "?");
}

/* ---------- Text helpers ---------- */
function wrap(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const words = sanitize(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------- Data loader ---------- */
async function loadCv(): Promise<CvDataResolved> {
  try {
    const mod = (await import("@/data/cv")) as CvModule;
    return {
      NAME: mod.NAME ?? "Brandon Gottschling",
      HEADLINE: mod.HEADLINE ?? "People-first technologist and proposal developer.",
      LOCATION: mod.LOCATION ?? "Atlanta, GA (US)",
      EMAIL: mod.EMAIL ?? "hello@brandongottschling.com",
      WEBSITE: mod.WEBSITE ?? "https://brandongottschling.com",
      EXEC_SUMMARY: Array.isArray(mod.EXEC_SUMMARY) ? mod.EXEC_SUMMARY : [],
      EXPERIENCES: Array.isArray(mod.EXPERIENCES) ? mod.EXPERIENCES :
                   (Array.isArray(mod.experiences) ? mod.experiences : []),
      SKILL_GROUPS: Array.isArray(mod.SKILL_GROUPS) ? mod.SKILL_GROUPS :
                    (Array.isArray(mod.skills) ? mod.skills : []),
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

/* ---------- Drawing helpers ---------- */
const M = 72; // 1in margin for a premium look
const COLOR_TEXT = rgb(0, 0, 0);
const COLOR_MUTED = rgb(0.32, 0.32, 0.32);
const COLOR_RULE  = rgb(0.85, 0.85, 0.85);
const COLOR_ACCENT = rgb(0.98, 0.64, 0.18); // subtle amber accent (can tweak)

function rule(page: PDFPage, x1: number, x2: number, y: number) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 1, color: COLOR_RULE });
}
function h1(page: PDFPage, txt: string, bold: PDFFont, x: number, y: number) {
  page.drawText(sanitize(txt), { x, y, size: 26, font: bold, color: COLOR_TEXT }); return y - 28;
}
function h2(page: PDFPage, txt: string, bold: PDFFont, x: number, y: number) {
  page.drawText(sanitize(txt), { x, y, size: 14.5, font: bold, color: COLOR_TEXT }); return y - 20;
}
function label(page: PDFPage, txt: string, bold: PDFFont, x: number, y: number) {
  page.drawText(sanitize(txt), { x, y, size: 11, font: bold, color: COLOR_TEXT }); return y - 14;
}
function para(page: PDFPage, txt: string, width: number, font: PDFFont, x: number, y: number, size = 11) {
  for (const line of wrap(txt, width, font, size)) { page.drawText(line, { x, y, size, font, color: COLOR_TEXT }); y -= size + 5; }
  return y;
}
function bullets(page: PDFPage, items: string[], width: number, font: PDFFont, x: number, y: number, size = 11) {
  const tx = x + 14;
  for (const item of items) {
    page.drawCircle({ x: x + 4, y: y + size / 3, size: 1.8, color: COLOR_TEXT, borderColor: COLOR_TEXT });
    for (const line of wrap(item, width - 14, font, size)) {
      page.drawText(line, { x: tx, y, size, font }); y -= size + 3;
    }
    y -= 4;
  }
  return y;
}
function pageNum(page: PDFPage, idx: number, total: number, font: PDFFont) {
  const { width } = page.getSize();
  const text = `Page ${idx + 1} of ${total}`;
  page.drawText(text, { x: width - M - font.widthOfTextAtSize(text, 9), y: 30, size: 9, font, color: COLOR_MUTED });
}

/* ---------- Route ---------- */
export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || `${reqUrl.protocol}//${reqUrl.host}`;

  const { NAME, HEADLINE, LOCATION, EMAIL, WEBSITE, EXEC_SUMMARY, EXPERIENCES, SKILL_GROUPS } = await loadCv();

  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  /* Cover */
  {
    const page = pdf.addPage();
    const { width, height } = page.getSize();
    let y = height - M;

    // Avatar (best-effort)
    try {
      const res = await fetch(`${origin}/images/avatar.jpg`, { cache: "no-store" });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        const jpg = await pdf.embedJpg(buf);
        page.drawImage(jpg, { x: M, y: y - 96, width: 96, height: 96 });
      }
    } catch {}

    y = h1(page, NAME, helvBold, M + 120, y - 8);
    page.drawText(sanitize(HEADLINE), { x: M + 120, y: y + 6, size: 13, font: helv, color: COLOR_MUTED });
    y -= 36;

    const contact = `${LOCATION}  •  ${EMAIL}  •  ${WEBSITE}`;
    page.drawText(sanitize(contact), { x: M, y, size: 10.5, font: helv, color: COLOR_MUTED });
    y -= 14;

    rule(page, M, width - M, y); y -= 12;

    page.drawText("Proposal Package", { x: M, y, size: 12, font: helvBold, color: COLOR_TEXT }); y -= 16;
    page.drawText("A concise snapshot: mission, executive summary, experience, and skills.", {
      x: M, y, size: 10.5, font: helv, color: COLOR_MUTED,
    });
  }

  /* Pre-create a blank TOC page we’ll fill AFTER sections */
  const tocPage = pdf.addPage();
  const tocIndex = pdf.getPageCount() - 1; // should be 1 (second page)
  const tocEntries: Array<{ label: string; page: number }> = [];

  /* Mission & Executive Summary */
  {
    const pageStart = pdf.getPageCount() + 0; // first page number of this section (1-based later)
    tocEntries.push({ label: "Mission & Executive Summary", page: pageStart + 1 - 0 }); // will be fixed after numbering

    const page = pdf.addPage();
    const { width, height } = page.getSize();
    let y = height - M;

    y = h2(page, "Mission & Executive Summary", helvBold, M, y);
    rule(page, M, width - M, y); y -= 18;

    const mission =
      "Build useful things, tell honest stories, and show up for people. " +
      "Share what I'm learning so others can move with more courage, clarity, and hope. " +
      "I want this work to be more than output. I'm learning to be the kind of person who shows up—" +
      "steady at home, useful in the world. That looks like working hard, seeking peace, and " +
      "making things that genuinely help.";

    y = label(page, "Mission", helvBold, M, y);
    y = para(page, mission, width - M * 2, helv, M, y, 11.5);

    y -= 6;
    y = label(page, "Executive Summary", helvBold, M, y);
    const bulletsData = (Array.isArray(EXEC_SUMMARY) && EXEC_SUMMARY.length)
      ? EXEC_SUMMARY
      : [
          "Builder-minded marketer who translates messy needs into clear proposals and shippable artifacts.",
          "Facilitator who gets the right people in the room and keeps decisions legible.",
          "Direction of travel: reliable programs where quality execution and trust are the product.",
        ];
    bullets(page, bulletsData, width - M * 2, helv, M, y, 11.5);
  }

  /* Experience (time, scope, metrics, highlights) */
  if (Array.isArray(EXPERIENCES) && EXPERIENCES.length) {
    tocEntries.push({ label: "Experience", page: pdf.getPageCount() + 1 });

    let page = pdf.addPage();
    const { width, height } = page.getSize();
    let y = height - M;

    y = h2(page, "Experience", helvBold, M, y);
    rule(page, M, width - M, y); y -= 12;

    const contentWidth = width - M * 2;

    for (const exp of EXPERIENCES) {
      // header row: Role/Title — Company, with dates on the right
      const role = exp.title || exp.role || "";
      const company = exp.company || exp.org || "";
      const when = exp.range || exp.dates || "";

      const headerLeft = sanitize([role, company].filter(Boolean).join(" — "));
      const headerRight = sanitize(when);

      // Left
      page.drawText(headerLeft, { x: M, y, size: 12, font: helvBold, color: COLOR_TEXT });

      // Right-aligned dates
      if (headerRight) {
        const w = helv.widthOfTextAtSize(headerRight, 10);
        page.drawText(headerRight, { x: M + contentWidth - w, y: y + 1, size: 10, font: helv, color: COLOR_MUTED });
      }
      y -= 18;

      // Scope
      if (exp.scope) {
        y = label(page, "Scope", helvBold, M, y);
        y = para(page, exp.scope, contentWidth, helv, M, y, 10.5);
      }

      // Metrics
      const metrics = Array.isArray(exp.metrics) ? exp.metrics : [];
      if (metrics.length) {
        y = label(page, "Metrics", helvBold, M, y);
        y = bullets(page, metrics, contentWidth, helv, M, y, 10.5);
      }

      // Highlights
      const highlights = (Array.isArray(exp.highlights) ? exp.highlights : exp.bullets) ?? [];
      if (highlights.length) {
        y = label(page, "Highlights", helvBold, M, y);
        y = bullets(page, highlights, contentWidth, helv, M, y, 10.5);
      }

      y -= 10;
      if (y < 96) { page = pdf.addPage(); y = page.getSize().height - M; }
    }
  }

  /* Skills (after Experience) */
  if (Array.isArray(SKILL_GROUPS) && SKILL_GROUPS.length) {
    tocEntries.push({ label: "Skills", page: pdf.getPageCount() + 1 });

    const page = pdf.addPage();
    const { width, height } = page.getSize();
    let y = height - M;

    y = h2(page, "Skills", helvBold, M, y);
    rule(page, M, width - M, y); y -= 12;

    const gap = 24;
    const colW = (width - M * 2 - gap) / 2;
    let col = 0;
    let baseline = y;

    for (const group of SKILL_GROUPS) {
      const x = M + col * (colW + gap);
      page.drawText(sanitize(group.name || group.title || "Skills"), { x, y: baseline, size: 12, font: helvBold });
      let yy = baseline - 14;

      const items = Array.isArray(group.items) ? group.items : [];
      const text = items.join(" · ");
      for (const line of wrap(text, colW, helv, 10.5)) {
        page.drawText(line, { x, y: yy, size: 10.5, font: helv });
        yy -= 14;
      }

      if (col === 0) col = 1;
      else { col = 0; baseline = Math.min(yy, baseline) - 18; }
    }

    page.drawText("Thank you for your consideration.", { x: M, y: 64, size: 11, font: helv, color: COLOR_MUTED });
  }

  /* Fill TOC page now that we know page numbers */
  {
    const page = tocPage;
    const { width, height } = page.getSize();
    let y = height - M;

    y = h2(page, "Contents", helvBold, M, y);
    rule(page, M, width - M, y); y -= 18;

    const lineW = width - M * 2;

    for (const entry of tocEntries) {
      const labelTxt = sanitize(entry.label);
      const pageTxt = String(entry.page); // we added pages sequentially, already 1-based

      const leftW = helv.widthOfTextAtSize(labelTxt, 11.5);
      const rightW = helv.widthOfTextAtSize(pageTxt, 11.5);

      // label
      page.drawText(labelTxt, { x: M, y, size: 11.5, font: helv });

      // dotted leader
      const dotsStart = M + leftW + 6;
      const dotsEnd = M + lineW - rightW - 6;
      const dotWidth = helv.widthOfTextAtSize(".", 11.5);
      let dx = dotsStart;
      while (dx < dotsEnd) {
        page.drawText(".", { x: dx, y, size: 11.5, font: helv, color: COLOR_MUTED });
        dx += dotWidth + 1.5;
      }

      // page number
      page.drawText(pageTxt, { x: M + lineW - rightW, y, size: 11.5, font: helv });

      y -= 18;
    }
  }

  /* Page numbers */
  const pages = pdf.getPages();
  for (let i = 0; i < pages.length; i++) pageNum(pages[i], i, pages.length, helv);

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Brandon-Gottschling-Proposal.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
