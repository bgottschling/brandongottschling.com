export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import {
  PDFDocument,
  PageSizes,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import {
  NAME, HEADLINE, LOCATION, EMAIL, WEBSITE, LINKEDIN,
  EXEC_SUMMARY, EXPERIENCES, SKILLS,
  type Experience, type Highlight, type SkillGroup,
} from "@/data/cv";
import type { NetworkSnapshot } from "@/lib/network-snapshot";

/* ------------------------------------------------------------------ */
/*  Page geometry (US Letter, points)                                  */
/* ------------------------------------------------------------------ */
const [W, H] = PageSizes.Letter;
const M = 60;                 // side margins
const CW = W - M * 2;         // content width
const BOTTOM = 60;            // keep clear of the footer
const BAND_H = 290;           // network band height on page 1
const FADE_H = 110;           // how much of the band fades into white
const PANEL_TOP = H - 70;     // open network above the identity panel
const PANEL_H = 128;
const MIN_NET_SCALE = 0.55;   // CSS px -> pt floor; wide viewports are cropped, not shrunk to dust
const ROLE_START_MIN = 96;    // room a role needs to start on the current page

const TEXT = rgb(0.10, 0.10, 0.12);
const MUTED = rgb(0.45, 0.45, 0.49);
const RULE = rgb(0.87, 0.87, 0.89);
const WHITE = rgb(1, 1, 1);

/* ------------------------------------------------------------------ */
/*  Text helpers                                                        */
/* ------------------------------------------------------------------ */
// Standard fonts are WinAnsi only; map the symbols cv.ts actually uses.
function sanitize(input: string): string {
  return input
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/[​-‍⁠]/g, "")
    .replace(/[   ]/g, " ")
    .replace(/→/g, " to ").replace(/←/g, " from ")
    .replace(/[‘’‛]/g, "'").replace(/[“”‟]/g, '"')
    .replace(/–/g, "-").replace(/—/g, ", ").replace(/…/g, "...")
    .replace(/≈/g, "~").replace(/≥/g, ">=").replace(/≤/g, "<=")
    .replace(/×/g, "x").replace(/•/g, "-")
    .replace(/[^\u0000-ÿ]/g, "");
}

function wrap(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const words = sanitize(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return rgb(r + m, g + m, b + m);
}

/** Rounded rectangle as an SVG path in page coordinates (y-down from the top-left). */
function roundedRectPath(x: number, yTop: number, w: number, h: number, r: number): string {
  return [
    `M ${x + r} ${yTop}`,
    `H ${x + w - r}`,
    `A ${r} ${r} 0 0 1 ${x + w} ${yTop + r}`,
    `V ${yTop + h - r}`,
    `A ${r} ${r} 0 0 1 ${x + w - r} ${yTop + h}`,
    `H ${x + r}`,
    `A ${r} ${r} 0 0 1 ${x} ${yTop + h - r}`,
    `V ${yTop + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${yTop}`,
    "Z",
  ].join(" ");
}

/* ------------------------------------------------------------------ */
/*  Layout cursor                                                       */
/* ------------------------------------------------------------------ */
type Fonts = { reg: PDFFont; bold: PDFFont };

/** Type scale. `tight` is tried automatically when the normal scale leaves a mostly empty last page. */
type Scale = { body: number; skill: number; lead: number; gap: number };
const SCALES: Record<"normal" | "tight", Scale> = {
  normal: { body: 10, skill: 9.5, lead: 1.42, gap: 3.5 },
  tight: { body: 9.7, skill: 9.3, lead: 1.37, gap: 2.5 },
};

type Ctx = {
  pdf: PDFDocument;
  page: PDFPage;
  y: number;                 // top of the remaining space
  fonts: Fonts;
  accent: RGB;
  accentDeep: RGB;
  continuation: string | null;
  T: Scale;
};

function addPage(ctx: Ctx) {
  ctx.page = ctx.pdf.addPage(PageSizes.Letter);
  ctx.y = H - M;
  if (ctx.continuation) {
    ctx.page.drawText(sanitize(`${ctx.continuation} (continued)`), {
      x: M, y: ctx.y - 9, size: 9, font: ctx.fonts.reg, color: MUTED,
    });
    ctx.y -= 24;
  }
}

function ensure(ctx: Ctx, height: number) {
  if (ctx.y - height < BOTTOM) addPage(ctx);
}

/** Draw wrapped text; advances ctx.y. */
function paragraph(
  ctx: Ctx, text: string, x: number, width: number,
  size: number, font: PDFFont, color: RGB, lineHeight = size * ctx.T.lead,
) {
  for (const line of wrap(text, width, font, size)) {
    ensure(ctx, lineHeight);
    ctx.page.drawText(line, { x, y: ctx.y - size, size, font, color });
    ctx.y -= lineHeight;
  }
}

const BULLET_INDENT = 12;

function bulletList(
  ctx: Ctx, items: string[], x: number, width: number,
  size: number, font: PDFFont, color: RGB, dot: RGB,
) {
  const lh = size * ctx.T.lead;
  for (const item of items) {
    const lines = wrap(item, width - BULLET_INDENT, font, size);
    for (let i = 0; i < lines.length; i++) {
      ensure(ctx, lh);
      if (i === 0) {
        ctx.page.drawCircle({ x: x + 3, y: ctx.y - size * 0.62, size: 1.6, color: dot, borderWidth: 0 });
      }
      ctx.page.drawText(lines[i], { x: x + BULLET_INDENT, y: ctx.y - size, size, font, color });
      ctx.y -= lh;
    }
    ctx.y -= ctx.T.gap;
  }
}

function sectionHeading(ctx: Ctx, title: string, keepWith = 0) {
  // Reserve room for the heading plus the start of its first block so a
  // heading is never stranded at the bottom of a page.
  ensure(ctx, 46 + keepWith);
  ctx.y -= 8;
  ctx.page.drawRectangle({ x: M, y: ctx.y - 12, width: 3, height: 12, color: ctx.accent, borderWidth: 0 });
  ctx.page.drawText(sanitize(title.toUpperCase()), {
    x: M + 11, y: ctx.y - 11, size: 10, font: ctx.fonts.bold, color: TEXT,
  });
  ctx.y -= 18;
  ctx.page.drawLine({ start: { x: M, y: ctx.y }, end: { x: W - M, y: ctx.y }, thickness: 0.75, color: RULE });
  ctx.y -= 14;
}

/** Small uppercase label that introduces a block inside a role. */
function blockLabel(ctx: Ctx, text: string) {
  ensure(ctx, 36);
  ctx.page.drawText(text.toUpperCase(), { x: M, y: ctx.y - 8, size: 7.5, font: ctx.fonts.bold, color: ctx.accentDeep });
  ctx.y -= 15;
}

/* ------------------------------------------------------------------ */
/*  Stat tiles                                                          */
/* ------------------------------------------------------------------ */
const TILE_GAP = 16;
const TILE_VALUE = 20;
const TILE_LABEL = 8.5;
const TILE_LABEL_LH = 11;

function tileWidth(count: number) {
  return (CW - TILE_GAP * (count - 1)) / Math.max(1, count);
}
function statsHeight(items: Highlight[], fonts: Fonts): number {
  const tw = tileWidth(items.length);
  const lines = Math.max(...items.map((h) => wrap(h.label, tw - 4, fonts.reg, TILE_LABEL).length));
  return 10 + TILE_VALUE + 6 + lines * TILE_LABEL_LH + 10;
}
function drawStats(ctx: Ctx, items: Highlight[]) {
  if (!items.length) return;
  const total = statsHeight(items, ctx.fonts);
  ensure(ctx, total);
  const tw = tileWidth(items.length);
  items.forEach((h, i) => {
    const x = M + i * (tw + TILE_GAP);
    let y = ctx.y;
    // short accent rule over each tile
    ctx.page.drawRectangle({ x, y: y - 2, width: 26, height: 2, color: ctx.accent, borderWidth: 0 });
    y -= 10;
    ctx.page.drawText(sanitize(h.value), { x, y: y - TILE_VALUE + 2, size: TILE_VALUE, font: ctx.fonts.bold, color: ctx.accentDeep });
    y -= TILE_VALUE + 6;
    for (const line of wrap(h.label, tw - 4, ctx.fonts.reg, TILE_LABEL)) {
      ctx.page.drawText(line, { x, y: y - TILE_LABEL, size: TILE_LABEL, font: ctx.fonts.reg, color: MUTED });
      y -= TILE_LABEL_LH;
    }
  });
  ctx.y -= total;
}

/* ------------------------------------------------------------------ */
/*  Measurement (dry runs so roles don't orphan at page bottoms)        */
/* ------------------------------------------------------------------ */
function linesHeight(text: string, width: number, font: PDFFont, size: number, T: Scale) {
  return wrap(text, width, font, size).length * size * T.lead;
}
function bulletsHeight(items: string[], width: number, font: PDFFont, size: number, T: Scale) {
  return items.reduce((acc, it) => acc + linesHeight(it, width - BULLET_INDENT, font, size, T) + T.gap, 0);
}
function experienceHeight(exp: Experience, fonts: Fonts, T: Scale, withStats: boolean): number {
  let h = 18 + 16; // role line + company line
  if (exp.scope) h += linesHeight(exp.scope, CW, fonts.reg, T.body, T) + 6;
  if (withStats && exp.highlights?.length) h += statsHeight(exp.highlights, fonts) + 4;
  const metrics = exp.metrics ?? [];
  if (metrics.length) h += 15 + bulletsHeight(metrics, CW, fonts.reg, T.body, T);
  if (exp.bullets.length) h += 15 + bulletsHeight(exp.bullets, CW, fonts.reg, T.body, T);
  return h + 18;
}
function skillGroupHeight(group: SkillGroup, width: number, fonts: Fonts, T: Scale): number {
  return 17 + bulletsHeight(group.items, width, fonts.reg, T.skill, T) + 8;
}

/* ------------------------------------------------------------------ */
/*  Dates and the career timeline                                       */
/* ------------------------------------------------------------------ */
const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};
function toDecimalYear(s: string | undefined, now: number): number {
  if (!s || /present|current/i.test(s)) return now;
  const m = s.match(/([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{4})/);
  if (m) return Number(m[2]) + (MONTHS[m[1].toLowerCase()] ?? 0) / 12;
  const y = s.match(/(\d{4})/);
  return y ? Number(y[1]) : now;
}
function shortCompany(company: string): string {
  const paren = company.match(/\(([^)]+)\)/);
  if (paren) return paren[1];
  if (/warner bros/i.test(company)) return "WBD";
  return company.split(/\s+/).slice(0, 1).join(" ");
}
function dateRange(exp: Experience): string {
  return `${exp.start} to ${exp.end ?? "Present"}`;
}

const TIMELINE_H = 66;

function drawTimeline(ctx: Ctx, items: Experience[]) {
  const now = new Date();
  const nowY = now.getFullYear() + now.getMonth() / 12;
  const spans = items.map((e) => ({
    label: shortCompany(e.company),
    a: toDecimalYear(e.start, nowY),
    b: toDecimalYear(e.end, nowY),
    current: !e.end || /present/i.test(e.end),
  }));
  const minY = Math.floor(Math.min(...spans.map((s) => s.a)));
  const maxY = Math.ceil(Math.max(...spans.map((s) => s.b)));
  const scale = CW / Math.max(1, maxY - minY);
  const xOf = (year: number) => M + (year - minY) * scale;

  ensure(ctx, TIMELINE_H);
  const axisY = ctx.y - 42;      // baseline of the bars
  const barH = 11;

  // Year axis
  ctx.page.drawLine({ start: { x: M, y: axisY - 5 }, end: { x: W - M, y: axisY - 5 }, thickness: 0.6, color: RULE });
  for (let year = minY; year <= maxY; year++) {
    const x = xOf(year);
    ctx.page.drawLine({ start: { x, y: axisY - 5 }, end: { x, y: axisY - 9 }, thickness: 0.6, color: RULE });
    const label = String(year);
    const lw = ctx.fonts.reg.widthOfTextAtSize(label, 7.5);
    if (year < maxY) {
      ctx.page.drawText(label, { x: x + 2, y: axisY - 19, size: 7.5, font: ctx.fonts.reg, color: MUTED });
    } else {
      ctx.page.drawText(label, { x: x - lw, y: axisY - 19, size: 7.5, font: ctx.fonts.reg, color: MUTED });
    }
  }

  // Bars + labels
  for (const s of spans) {
    const x0 = xOf(s.a);
    const x1 = Math.max(x0 + 2, xOf(s.b));
    const bw = x1 - x0;
    ctx.page.drawRectangle({
      x: x0, y: axisY, width: bw, height: barH,
      color: ctx.accent, opacity: s.current ? 0.95 : 0.5, borderWidth: 0,
    });
    const tw = ctx.fonts.bold.widthOfTextAtSize(s.label, 8);
    if (tw + 10 <= bw) {
      ctx.page.drawText(s.label, {
        x: x0 + (bw - tw) / 2, y: axisY + 2.5, size: 8, font: ctx.fonts.bold, color: WHITE,
      });
    } else {
      // Narrow tenure: float the label above with a thin leader
      const cx = x0 + bw / 2;
      ctx.page.drawLine({ start: { x: cx, y: axisY + barH }, end: { x: cx, y: axisY + barH + 7 }, thickness: 0.5, color: MUTED });
      ctx.page.drawText(s.label, {
        x: cx - tw / 2, y: axisY + barH + 10, size: 8, font: ctx.fonts.bold, color: MUTED,
      });
    }
  }
  ctx.y -= TIMELINE_H;
}

/* ------------------------------------------------------------------ */
/*  Network band (vector re-draw of the live canvas frame)              */
/* ------------------------------------------------------------------ */
function drawNetworkBand(page: PDFPage, snap: NetworkSnapshot, accent: RGB, accentDeep: RGB) {
  // Never shrink the network below its on-screen size: a wide viewport would
  // otherwise collapse into a dense sprinkle of tiny dots. Take a centered
  // slice at (at least) screen scale; narrow viewports scale up to cover.
  const s = Math.max(MIN_NET_SCALE, W / Math.max(1, snap.width), BAND_H / Math.max(1, snap.height));
  const offY = Math.max(0, (snap.height * s - BAND_H) / 2);   // scaled px trimmed from the top
  const offX = Math.max(0, (snap.width * s - W) / 2);
  const px = (x: number) => x * s - offX;
  const svgY = (y: number) => y * s - offY;                   // y-down, from the page's top edge
  const py = (y: number) => H - svgY(y);                      // PDF y runs upward
  const bandBottom = H - BAND_H;
  const visible = (i: number) => {
    const n = snap.nodes[i];
    if (!n) return false;
    const y = py(n[1]);
    const x = px(n[0]);
    return y > bandBottom - 16 && y < H + 16 && x > -16 && x < W + 16;
  };

  // Triangle fills carry the "shading" of the live network. The canvas draws
  // them at alpha 0.05..0.27 over a dark/light page background; on white paper
  // they need roughly double that to read.
  for (const [i, j, k, a] of snap.triangles) {
    if (!(visible(i) && visible(j) && visible(k))) continue;
    const [ni, nj, nk] = [snap.nodes[i], snap.nodes[j], snap.nodes[k]];
    const d = `M ${px(ni[0])} ${svgY(ni[1])} L ${px(nj[0])} ${svgY(nj[1])} L ${px(nk[0])} ${svgY(nk[1])} Z`;
    // drawSvgPath flips y (SVG is y-down) around the given origin, so anchor it
    // at the page's top-left; left at the default (0,0) the path lands below the page.
    page.drawSvgPath(d, { x: 0, y: H, color: accent, opacity: Math.min(0.6, 0.14 + a * 2.4), borderWidth: 0 });
  }
  for (const [i, j, t] of snap.links) {
    if (!(visible(i) && visible(j))) continue;
    const a = snap.nodes[i], b = snap.nodes[j];
    page.drawLine({
      start: { x: px(a[0]), y: py(a[1]) }, end: { x: px(b[0]), y: py(b[1]) },
      thickness: 1, color: accentDeep, opacity: 0.28 + 0.45 * t,
    });
  }
  snap.nodes.forEach((n, i) => {
    if (!visible(i)) return;
    const x = px(n[0]), y = py(n[1]);
    page.drawCircle({ x, y, size: 5, color: accent, opacity: 0.16, borderWidth: 0 });  // soft halo
    page.drawCircle({ x, y, size: 2.3, color: accentDeep, opacity: 0.95, borderWidth: 0 });
  });

  // Mask anything that spilled past the band (links and fills are not clipped),
  // then fade the bottom of the band into the white page.
  page.drawRectangle({ x: 0, y: 0, width: W, height: bandBottom + 0.6, color: WHITE, borderWidth: 0 });
  const steps = 18;
  const stepH = FADE_H / steps;
  for (let k = 0; k < steps; k++) {
    const t = k / steps;
    page.drawRectangle({
      x: 0, y: bandBottom + k * stepH, width: W, height: stepH + 0.6,
      color: WHITE, opacity: 1 - t * t, borderWidth: 0,   // ease-in so the fade starts gently
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Render                                                              */
/* ------------------------------------------------------------------ */
async function renderCv(
  opts: { snapshot: NetworkSnapshot | null; hue: number },
  scaleName: keyof typeof SCALES = "normal",
): Promise<{ bytes: Uint8Array; pages: number; lastPageFill: number }> {
  const T = SCALES[scaleName];
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${NAME}: CV`);
  pdf.setAuthor(NAME);
  pdf.setSubject("Curriculum Vitae");
  pdf.setCreator(WEBSITE);
  pdf.setCreationDate(new Date());

  const fonts: Fonts = {
    reg: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };
  const accent = hslToRgb(opts.hue, 0.75, 0.50);
  const accentDeep = hslToRgb(opts.hue, 0.72, 0.40);

  const ctx: Ctx = {
    pdf, page: pdf.addPage(PageSizes.Letter), y: H - M, fonts, accent, accentDeep, continuation: null, T,
  };

  /* ---- Page 1 header: network band + translucent identity panel ---- */
  if (opts.snapshot) drawNetworkBand(ctx.page, opts.snapshot, accent, accentDeep);

  ctx.page.drawSvgPath(roundedRectPath(M, H - PANEL_TOP, CW, PANEL_H, 10), {
    x: 0, y: H, color: WHITE, opacity: 0.9, borderColor: RULE, borderWidth: 0.6, borderOpacity: 0.9,
  });
  const pad = 22;
  let y = PANEL_TOP - pad;
  ctx.page.drawText(sanitize(NAME), { x: M + pad, y: y - 24, size: 26, font: fonts.bold, color: TEXT });
  y -= 38;
  for (const line of wrap(HEADLINE, CW - pad * 2, fonts.reg, 10.5).slice(0, 2)) {
    ctx.page.drawText(line, { x: M + pad, y: y - 10, size: 10.5, font: fonts.reg, color: MUTED });
    y -= 15;
  }
  y -= 8;
  // Contact line with accent separators
  const parts = [
    EMAIL,
    WEBSITE.replace(/^https?:\/\//, ""),
    LINKEDIN.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    LOCATION,
  ].map(sanitize);
  let cx = M + pad;
  parts.forEach((p, i) => {
    ctx.page.drawText(p, { x: cx, y: y - 9, size: 9, font: fonts.reg, color: TEXT });
    cx += fonts.reg.widthOfTextAtSize(p, 9);
    if (i < parts.length - 1) {
      ctx.page.drawCircle({ x: cx + 9, y: y - 6, size: 1.3, color: accent, borderWidth: 0 });
      cx += 18;
    }
  });

  ctx.y = H - BAND_H + 26;

  /* ---- Summary ---- */
  if (EXEC_SUMMARY.length) {
    sectionHeading(ctx, "Summary");
    bulletList(ctx, EXEC_SUMMARY, M, CW, T.body, fonts.reg, TEXT, accent);
    ctx.y -= 4;
  }

  /* ---- Highlights: headline numbers from the current role ---- */
  const current = EXPERIENCES[0];
  const currentStats = current?.highlights ?? [];
  if (currentStats.length) {
    sectionHeading(ctx, "Highlights", statsHeight(currentStats, fonts) + 14);
    const caption = sanitize(`${current.role}, ${shortCompany(current.company)}  ·  ${dateRange(current)}`);
    ctx.page.drawText(caption, { x: M, y: ctx.y - 9, size: 9, font: fonts.reg, color: MUTED });
    ctx.y -= 20;
    drawStats(ctx, currentStats);
  }

  /* ---- Timeline ---- */
  sectionHeading(ctx, "Career at a glance", TIMELINE_H);
  drawTimeline(ctx, EXPERIENCES);

  /* ---- Experience ---- */
  sectionHeading(ctx, "Experience", ROLE_START_MIN);
  EXPERIENCES.forEach((exp, idx) => {
    const withStats = idx > 0;   // the current role's numbers already lead page 1
    const need = experienceHeight(exp, fonts, T, withStats);
    if (ctx.y - Math.min(need, ROLE_START_MIN) < BOTTOM) addPage(ctx);
    ctx.continuation = `${exp.role}, ${shortCompany(exp.company)}`;

    // Role line with right-aligned dates
    const when = sanitize(dateRange(exp));
    const whenW = fonts.reg.widthOfTextAtSize(when, 9);
    ctx.page.drawText(sanitize(exp.role), { x: M, y: ctx.y - 12.5, size: 12.5, font: fonts.bold, color: TEXT });
    ctx.page.drawText(when, { x: W - M - whenW, y: ctx.y - 11, size: 9, font: fonts.reg, color: MUTED });
    ctx.y -= 18;

    const companyLine = [exp.company, exp.org, exp.location].filter(Boolean).join("  ·  ");
    ctx.page.drawText(sanitize(companyLine), { x: M, y: ctx.y - 9.5, size: 9.5, font: fonts.reg, color: MUTED });
    ctx.y -= 18;

    if (exp.scope) {
      paragraph(ctx, exp.scope, M, CW, T.body, fonts.reg, TEXT);
      ctx.y -= 8;
    }
    if (withStats && exp.highlights?.length) {
      drawStats(ctx, exp.highlights);
      ctx.y -= 4;
    }
    const metrics = exp.metrics ?? [];
    if (metrics.length) {
      blockLabel(ctx, "Results");
      bulletList(ctx, metrics, M, CW, T.body, fonts.reg, TEXT, accent);
      ctx.y -= 2;
    }
    if (exp.bullets.length) {
      blockLabel(ctx, "Scope of work");
      bulletList(ctx, exp.bullets, M, CW, T.body, fonts.reg, TEXT, accent);
    }
    ctx.continuation = null;
    ctx.y -= 8;
    ensure(ctx, 10);
    ctx.page.drawLine({ start: { x: M, y: ctx.y }, end: { x: W - M, y: ctx.y }, thickness: 0.5, color: RULE });
    ctx.y -= 12;
  });

  /* ---- Skills: two balanced columns ---- */
  {
    const gap = 28;
    const colW = (CW - gap) / 2;
    sectionHeading(ctx, "Skills", SKILLS.length ? skillGroupHeight(SKILLS[0], colW, fonts, T) : 0);
    const colX = [M, M + colW + gap];
    let colY = [ctx.y, ctx.y];

    const drawGroup = (g: SkillGroup, col: number) => {
      let gy = colY[col];
      ctx.page.drawText(sanitize(g.name), { x: colX[col], y: gy - 10.5, size: 10.5, font: fonts.bold, color: TEXT });
      gy -= 17;
      for (const item of g.items) {
        const sz = T.skill;
        const lines = wrap(item, colW - BULLET_INDENT, fonts.reg, sz);
        for (let i = 0; i < lines.length; i++) {
          if (i === 0) {
            ctx.page.drawCircle({ x: colX[col] + 3, y: gy - sz * 0.62, size: 1.5, color: accent, borderWidth: 0 });
          }
          ctx.page.drawText(lines[i], { x: colX[col] + BULLET_INDENT, y: gy - sz, size: sz, font: fonts.reg, color: TEXT });
          gy -= sz * T.lead;
        }
        gy -= T.gap;
      }
      colY[col] = gy - 8;
    };

    for (const g of SKILLS) {
      const h = skillGroupHeight(g, colW, fonts, T);
      // Shortest column first; new page when neither column has room
      let col = colY[0] >= colY[1] ? 0 : 1;
      if (colY[col] - h < BOTTOM) {
        const other = col === 0 ? 1 : 0;
        if (colY[other] - h >= BOTTOM) col = other;
        else {
          addPage(ctx);
          colY = [ctx.y, ctx.y];
          col = 0;
        }
      }
      drawGroup(g, col);
    }
    ctx.y = Math.min(colY[0], colY[1]);
  }

  /* ---- Footer on every page ---- */
  const pages = pdf.getPages();
  pages.forEach((page, i) => {
    const left = sanitize(`${NAME}  ·  Curriculum Vitae`);
    const right = `Page ${i + 1} of ${pages.length}`;
    const site = WEBSITE.replace(/^https?:\/\//, "");
    page.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.5, color: RULE });
    page.drawText(left, { x: M, y: 32, size: 8, font: fonts.reg, color: MUTED });
    const sw = fonts.reg.widthOfTextAtSize(site, 8);
    page.drawText(site, { x: (W - sw) / 2, y: 32, size: 8, font: fonts.reg, color: MUTED });
    const rw = fonts.reg.widthOfTextAtSize(right, 8);
    page.drawText(right, { x: W - M - rw, y: 32, size: 8, font: fonts.reg, color: MUTED });
  });

  const lastPageFill = (H - M - ctx.y) / (H - M - BOTTOM);
  return { bytes: await pdf.save(), pages: pages.length, lastPageFill };
}

/** Render at the normal scale; if that strands a nearly empty last page, re-render tighter. */
async function renderBestFit(opts: { snapshot: NetworkSnapshot | null; hue: number }): Promise<Uint8Array> {
  const normal = await renderCv(opts, "normal");
  if (normal.pages > 1 && normal.lastPageFill < 0.45) {
    const tight = await renderCv(opts, "tight");
    if (tight.pages < normal.pages) return tight.bytes;
  }
  return normal.bytes;
}

/* ------------------------------------------------------------------ */
/*  Request handling                                                    */
/* ------------------------------------------------------------------ */
const LIMITS = { nodes: 400, links: 6000, triangles: 6000 };

function isFiniteNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Accept only a well-formed snapshot; anything odd degrades to "no network". */
function parseSnapshot(raw: unknown): NetworkSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!isFiniteNum(o.width) || !isFiniteNum(o.height) || o.width <= 0 || o.height <= 0) return null;
  if (!Array.isArray(o.nodes) || !Array.isArray(o.links) || !Array.isArray(o.triangles)) return null;
  if (o.nodes.length > LIMITS.nodes || o.links.length > LIMITS.links || o.triangles.length > LIMITS.triangles) return null;

  const nodes: NetworkSnapshot["nodes"] = [];
  for (const n of o.nodes) {
    if (!Array.isArray(n) || !isFiniteNum(n[0]) || !isFiniteNum(n[1])) return null;
    nodes.push([n[0], n[1]]);
  }
  const idxOk = (i: unknown): i is number => isFiniteNum(i) && Number.isInteger(i) && i >= 0 && i < nodes.length;

  const links: NetworkSnapshot["links"] = [];
  for (const l of o.links) {
    if (!Array.isArray(l) || !idxOk(l[0]) || !idxOk(l[1]) || !isFiniteNum(l[2])) return null;
    links.push([l[0], l[1], Math.min(1, Math.max(0, l[2]))]);
  }
  const triangles: NetworkSnapshot["triangles"] = [];
  for (const t of o.triangles) {
    if (!Array.isArray(t) || !idxOk(t[0]) || !idxOk(t[1]) || !idxOk(t[2]) || !isFiniteNum(t[3])) return null;
    triangles.push([t[0], t[1], t[2], Math.min(1, Math.max(0, t[3]))]);
  }
  return { width: o.width, height: o.height, nodes, links, triangles };
}

function pdfResponse(bytes: Uint8Array) {
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Brandon-Gottschling-CV.pdf"',
      "Cache-Control": "no-store",
    },
  });
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Direct link / fallback: the CV without the network band. */
export async function GET() {
  try {
    return pdfResponse(await renderBestFit({ snapshot: null, hue: 38 }));
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "PDF render failed", 500);
  }
}

/** The page posts the live network geometry and the current accent hue. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Body must be JSON", 400);
  }
  const o = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const hue = isFiniteNum(o.hue) ? ((o.hue % 360) + 360) % 360 : 38;
  const snapshot = parseSnapshot(o.snapshot);

  try {
    return pdfResponse(await renderBestFit({ snapshot, hue }));
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "PDF render failed", 500);
  }
}
