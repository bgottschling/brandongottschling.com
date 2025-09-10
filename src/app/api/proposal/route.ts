export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

/* ------------------------------ Types ------------------------------ */

interface Experience {
  title?: string;
  role?: string;
  company?: string;
  org?: string;
  range?: string;
  dates?: string;
  highlights?: string[];
  bullets?: string[];
}

interface SkillGroup {
  name?: string;
  title?: string;
  items?: string[];
}

interface CvModule {
  NAME?: string;
  HEADLINE?: string;
  LOCATION?: string;
  EMAIL?: string;
  EXEC_SUMMARY?: string[];
  EXPERIENCES?: Experience[];
  SKILL_GROUPS?: SkillGroup[];
  WEBSITE?: string;

  // common alt field names in your repo
  experiences?: Experience[];
  skills?: SkillGroup[];
}

interface CvDataResolved {
  NAME: string;
  HEADLINE: string;
  LOCATION: string;
  EMAIL: string;
  EXEC_SUMMARY: string[];
  EXPERIENCES: Experience[];
  SKILL_GROUPS: SkillGroup[];
  WEBSITE: string;
}

/* ------------------------ Text Sanitization ------------------------ */
/**
 * Convert text into a subset safely encodable with PDF WinAnsi (Helvetica).
 * - Replaces arrows and common symbols with ASCII equivalents
 * - Converts smart quotes/dashes/ellipsis
 * - Removes zero-width & exotic spaces
 * - Any remaining codepoints > 0xFF are replaced with '?'
 */
function sanitizeForWinAnsi(input: string): string {
  let s = input;

  // Normalize line breaks to spaces for drawText use
  s = s.replace(/\r\n|\r|\n/g, " ");

  // Remove zero-width & narrow spaces
  s = s.replace(/[\u200B-\u200D\u2060]/g, ""); // zero-width, joiners, word-joiner
  s = s.replace(/[\u00A0\u202F\u2007]/g, " "); // nbsp, narrow-nbsp, figure space

  // Arrows and similar
  s = s
    .replace(/\u2192/g, "->")   // →
    .replace(/\u2190/g, "<-")   // ←
    .replace(/\u2194/g, "<->")  // ↔
    .replace(/\u21D2/g, "=>")   // ⇒
    .replace(/\u21D0/g, "<=")   // ⇐
    .replace(/\u21D4/g, "<=>"); // ⇔

  // Smart quotes → ASCII
  s = s
    .replace(/[\u2018\u2019\u201B]/g, "'") // ‘ ’ ’
    .replace(/[\u201C\u201D\u201F]/g, '"'); // “ ” ‟

  // Dashes / ellipsis
  s = s
    .replace(/\u2013/g, "-")    // – en dash
    .replace(/\u2014/g, "--")   // — em dash
    .replace(/\u2026/g, "..."); // … ellipsis

  // Misc symbols often seen
  s = s
    .replace(/\u2122/g, "TM")      // ™
    .replace(/\u00AE/g, "(R)")     // ®
    .replace(/\u00A9/g, "(C)");    // ©

  // Finally, replace any remaining non-WinAnsi codepoints (> 0xFF)
  s = s.replace(/[^\u0000-\u00FF]/g, "?");

  return s;
}

/* --------------------------- Text Helpers -------------------------- */

function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  size: number
): string[] {
  const safe = sanitizeForWinAnsi(text);
  const words = safe.split(/\s+/).filter(Boolean);
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

/* --------------------------- Data Loading -------------------------- */

async function loadCvData(): Promise<CvDataResolved> {
  try {
    const mod = (await import("@/data/cv")) as CvModule;
    return {
      NAME: mod.NAME ?? "Brandon Gottschling",
      HEADLINE: mod.HEADLINE ?? "People-first technologist and proposal developer.",
      LOCATION: mod.LOCATION ?? "Atlanta, GA (US)",
      EMAIL: mod.EMAIL ?? "hello@brandongottschling.com",
      EXEC_SUMMARY: Array.isArray(mod.EXEC_SUMMARY) ? mod.EXEC_SUMMARY : [],
      EXPERIENCES: Array.isArray(mod.EXPERIENCES) ? mod.EXPERIENCES : (Array.isArray(mod.experiences) ? mod.experiences : []),
      SKILL_GROUPS: Array.isArray(mod.SKILL_GROUPS) ? mod.SKILL_GROUPS : (Array.isArray(mod.skills) ? mod.skills : []),
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

/* ------------------------------ Route ------------------------------ */

export async function GET(req: Request) {
  const reqUrl = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || `${reqUrl.protocol}//${reqUrl.host}`;

  const { NAME, HEADLINE, LOCATION, EMAIL, EXEC_SUMMARY, EXPERIENCES, SKILL_GROUPS, WEBSITE } =
    await loadCvData();

  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  /* ---------------------------- Cover Page ---------------------------- */
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
    } catch {
      // ignore avatar errors; PDF still renders
    }

    // Name & headline
    page.drawText(sanitizeForWinAnsi(NAME), {
      x: margin + 112, y: y - 24, size: 24, font: helvBold, color: rgb(0, 0, 0),
    });
    page.drawText(sanitizeForWinAnsi(HEADLINE), {
      x: margin + 112, y: y - 48, size: 12, font: helv, color: rgb(0.2, 0.2, 0.2),
    });
    y -= 120;

    // Contact row
    const contact = `${LOCATION}  -  ${EMAIL}  -  ${WEBSITE}`; // use ASCII dashes
    page.drawText(sanitizeForWinAnsi(contact), {
      x: margin, y, size: 10, font: helv, color: rgb(0.25, 0.25, 0.25),
    });
    y -= 22;

    // Divider
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 28;

    // Mission & Exec Summary
    page.drawText("Mission & Executive Summary", {
      x: margin, y, size: 14, font: helvBold,
    });
    y -= 22;

    const bulletLeft = margin + 12;
    const contentWidth = width - margin - bulletLeft;

    const bulletItems = Array.isArray(EXEC_SUMMARY) && EXEC_SUMMARY.length > 0
      ? EXEC_SUMMARY
      : [
          "Builder-minded marketer: synthesize market, product, and GTM into clear proposals.",
          "Own the loop from idea -> prototype -> narrative -> shipped artifact.", // ASCII arrows
        ];

    for (const item of bulletItems) {
      // draw an ASCII bullet to avoid encoding concerns
      const lines = wrapText(item, contentWidth, helv, 11);
      page.drawText("-", { x: margin, y, size: 12, font: helv }); // ASCII bullet
      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i], { x: bulletLeft, y, size: 11, font: helv });
        y -= 16;
      }
      y -= 4;
      if (y < 80) break;
    }

    // Footer
    page.drawText("Proposal Package", {
      x: margin, y: 36, size: 9, font: helv, color: rgb(0.45, 0.45, 0.45),
    });
  }

  /* ------------------------- Experience Pages ------------------------ */
  if (Array.isArray(EXPERIENCES) && EXPERIENCES.length) {
    let page = pdf.addPage();
    const { width, height } = page.getSize();
    const margin = 56;
    let y = height - margin;

    page.drawText("Experience", { x: margin, y, size: 14, font: helvBold });
    y -= 26;

    for (const exp of EXPERIENCES) {
      const role = exp.title || exp.role || "";
      const company = exp.company || exp.org || "";
      const range = exp.range || exp.dates || "";

      const headerRaw = [role, company].filter(Boolean).join(" - "); // ASCII dash
      const header = sanitizeForWinAnsi(headerRaw);
      page.drawText(header, { x: margin, y, size: 12, font: helvBold }); y -= 16;

      if (range) {
        page.drawText(sanitizeForWinAnsi(range), {
          x: margin, y, size: 10, font: helv, color: rgb(0.35, 0.35, 0.35),
        });
        y -= 14;
      }

      const bullets = (Array.isArray(exp.highlights) ? exp.highlights : exp.bullets) ?? [];
      for (const b of bullets.slice(0, 6)) {
        const lines = wrapText(b, width - margin * 2 - 12, helv, 10.5);
        page.drawText("-", { x: margin, y, size: 11, font: helv }); // ASCII bullet
        for (const line of lines) {
          page.drawText(line, { x: margin + 12, y, size: 10.5, font: helv });
          y -= 14;
        }
        y -= 2;
        if (y < 80) { page = pdf.addPage(); y = page.getSize().height - margin; }
      }

      y -= 10;
      if (y < 80) { page = pdf.addPage(); y = page.getSize().height - margin; }
    }
  }

  /* ---------------------------- Skills Page -------------------------- */
  if (Array.isArray(SKILL_GROUPS) && SKILL_GROUPS.length) {
    const page = pdf.addPage();
    const { width, height } = page.getSize();
    const margin = 56;
    let y = height - margin;

    page.drawText("Skills", { x: margin, y, size: 14, font: helvBold });
    y -= 22;

    const colGap = 24;
    const colWidth = (width - margin * 2 - colGap) / 2;
    let col = 0;
    let topY = y;

    for (const g of SKILL_GROUPS) {
      const groupTitle = sanitizeForWinAnsi(g.name || g.title || "Skills");
      const x = margin + (col * (colWidth + colGap));
      page.drawText(groupTitle, { x, y: topY, size: 12, font: helvBold });

      let yy = topY - 16;
      const items = Array.isArray(g.items) ? g.items : [];
      const text = sanitizeForWinAnsi(items.join(" • ")).replace(/•/g, "·"); // ensure safe mid-dot
      for (const line of wrapText(text, colWidth, helv, 10.5)) {
        page.drawText(line, { x, y: yy, size: 10.5, font: helv });
        yy -= 14;
      }

      // Next column / update top baseline
      if (col === 0) {
        col = 1;
      } else {
        col = 0;
        topY = Math.min(yy, topY) - 20;
      }
    }

    page.drawText("Thank you for your consideration.", {
      x: margin, y: 56, size: 11, font: helv, color: rgb(0.35, 0.35, 0.35),
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
