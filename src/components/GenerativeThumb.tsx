// src/components/GenerativeThumb.tsx
"use client";

import React from "react";
import { hash32, seededRng } from "@/lib/hash";

type Variant = "blog" | "project" | "research";

type Props = {
  title: string;
  variant: Variant;
  className?: string;
};

const W = 400;
const H = 240;

/* ── colour palettes per variant (last 2 are contrasting accents) ── */
const PALETTES: Record<Variant, string[]> = {
  blog: [
    "hsl(38, 90%, 58%)",
    "hsl(28, 85%, 52%)",
    "hsl(15, 75%, 55%)",
    "hsl(48, 95%, 65%)",
    "hsl(345, 65%, 55%)",   // rose contrast
    "hsl(280, 50%, 58%)",   // plum accent
  ],
  project: [
    "hsl(192, 80%, 50%)",
    "hsl(210, 70%, 55%)",
    "hsl(175, 65%, 45%)",
    "hsl(225, 60%, 60%)",
    "hsl(50, 80%, 55%)",    // warm gold contrast
    "hsl(320, 55%, 55%)",   // magenta accent
  ],
  research: [
    "hsl(245, 55%, 58%)",
    "hsl(260, 50%, 52%)",
    "hsl(230, 45%, 55%)",
    "hsl(275, 40%, 60%)",
    "hsl(170, 60%, 45%)",   // teal contrast
    "hsl(35, 70%, 55%)",    // copper accent
  ],
};

const BG: Record<Variant, string> = {
  blog: "hsl(38, 40%, 97%)",
  project: "hsl(200, 30%, 97%)",
  research: "hsl(245, 30%, 97%)",
};

const BG_DARK: Record<Variant, string> = {
  blog: "hsl(38, 15%, 10%)",
  project: "hsl(200, 15%, 10%)",
  research: "hsl(245, 15%, 10%)",
};

/* ── Blog: precise flat-top honeycomb grid ── */
function BlogPattern({ rng, colors }: { rng: () => number; colors: string[] }) {
  const elements: React.ReactNode[] = [];

  // Flat-top hexagon geometry
  const r = 16; // hex radius (center to vertex)
  const hexW = r * 2;               // width of flat-top hex
  const hexH = r * Math.sqrt(3);    // height of flat-top hex
  const colStep = hexW * 0.75;      // horizontal spacing (3/4 width for tessellation)
  const rowStep = hexH;             // vertical spacing

  // Pre-compute the 6 vertices of a unit flat-top hexagon
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i;
    return { dx: Math.cos(angle) * r, dy: Math.sin(angle) * r };
  });

  const cols = Math.ceil(W / colStep) + 2;
  const rows = Math.ceil(H / rowStep) + 2;

  for (let col = -1; col < cols; col++) {
    for (let row = -1; row < rows; row++) {
      const cx = col * colStep;
      const cy = row * rowStep + (col % 2 === 1 ? rowStep * 0.5 : 0);

      const pts = hexPoints.map(p => `${cx + p.dx},${cy + p.dy}`).join(" ");

      // Seed determines color and opacity — shapes are perfectly uniform
      const fill = colors[Math.floor(rng() * colors.length)];
      const fillOpacity = 0.04 + rng() * 0.14;
      const strokeOpacity = 0.08 + rng() * 0.1;

      elements.push(
        <polygon
          key={`h${col}-${row}`}
          points={pts}
          fill={fill}
          opacity={fillOpacity}
          stroke={fill}
          strokeWidth={0.5}
          strokeOpacity={strokeOpacity}
        />
      );
    }
  }

  return <>{elements}</>;
}

/* ── Projects: Uniform Flower of Life — perfect geometry, only color varies ── */
function ProjectPattern({ rng, colors }: { rng: () => number; colors: string[] }) {
  const elements: React.ReactNode[] = [];

  const r = 20;                          // fixed circle radius — every circle identical
  const spacingX = r * Math.sqrt(3);     // exact hex-lattice horizontal spacing
  const spacingY = r * 1.5;             // exact hex-lattice vertical spacing
  const tilt = (rng() - 0.5) * 10;      // subtle seed-based global tilt (±5°)
  const tiltRad = (tilt * Math.PI) / 180;
  const cosT = Math.cos(tiltRad);
  const sinT = Math.sin(tiltRad);
  const pivotX = W / 2;
  const pivotY = H / 2;

  // Apply global tilt around viewport center
  function tiltPt(x: number, y: number): [number, number] {
    const dx = x - pivotX, dy = y - pivotY;
    return [pivotX + dx * cosT - dy * sinT, pivotY + dx * sinT + dy * cosT];
  }

  const cols = Math.ceil(W / spacingX) + 3;
  const rows = Math.ceil(H / spacingY) + 3;
  const petalR = r * 0.5;

  for (let row = -2; row < rows; row++) {
    for (let col = -2; col < cols; col++) {
      const offsetX = row % 2 === 0 ? 0 : spacingX * 0.5;
      const rawX = col * spacingX + offsetX;
      const rawY = row * spacingY;
      const [cx, cy] = tiltPt(rawX, rawY);

      // Seed drives only color + opacity — geometry is uniform
      const color = colors[Math.floor(rng() * colors.length)];
      const opacity = 0.08 + rng() * 0.1;

      // Outer circle
      elements.push(
        <circle key={`o${row}-${col}`} cx={cx} cy={cy} r={r}
          fill="none" stroke={color} strokeWidth={0.5} opacity={opacity} />
      );

      // 6 inner petals — always present, perfectly symmetric
      for (let p = 0; p < 6; p++) {
        const angle = (p / 6) * Math.PI * 2 + tiltRad;
        const px = cx + Math.cos(angle) * petalR;
        const py = cy + Math.sin(angle) * petalR;
        elements.push(
          <circle key={`p${row}-${col}-${p}`} cx={px} cy={py} r={petalR}
            fill="none" stroke={color} strokeWidth={0.35}
            opacity={opacity * 0.55} />
        );
      }
    }
  }

  return <>{elements}</>;
}

/* ── Research: isometric data-block grid with circuit traces ── */
function ResearchPattern({ rng, colors }: { rng: () => number; colors: string[] }) {
  const elements: React.ReactNode[] = [];

  const hw = 14;                    // half-cell width
  const hh = hw * 0.577;           // half-cell height (30° isometric)
  const gridSize = 14;

  // Seed-based offset so each article's grid is positioned differently
  const offsetX = W / 2 + (rng() - 0.5) * 30;
  const offsetY = H * 0.25 + (rng() - 0.5) * 15;

  // Convert grid coords → screen coords (isometric projection)
  function toScreen(gx: number, gy: number): [number, number] {
    return [
      offsetX + (gx - gy) * hw,
      offsetY + (gx + gy) * hh,
    ];
  }

  // 1. Base grid lines
  for (let i = 0; i <= gridSize; i++) {
    const [x1, y1] = toScreen(0, i);
    const [x2, y2] = toScreen(gridSize, i);
    elements.push(
      <line key={`gx${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={colors[0]} strokeWidth={0.25} opacity={0.05} />
    );
    const [x3, y3] = toScreen(i, 0);
    const [x4, y4] = toScreen(i, gridSize);
    elements.push(
      <line key={`gy${i}`} x1={x3} y1={y3} x2={x4} y2={y4}
        stroke={colors[0]} strokeWidth={0.25} opacity={0.05} />
    );
  }

  // Pre-generate block map for connection traces
  const hasBlock: boolean[][] = [];
  const blockH: number[][] = [];
  for (let gy = 0; gy < gridSize; gy++) {
    hasBlock[gy] = [];
    blockH[gy] = [];
    for (let gx = 0; gx < gridSize; gx++) {
      hasBlock[gy][gx] = rng() < 0.40;
      blockH[gy][gx] = hasBlock[gy][gx] ? 3 + rng() * 20 : 0;
      rng(); // burn one for color consistency
    }
  }

  // 2. Circuit traces — connect nearby blocks along grid axes
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      if (!hasBlock[gy][gx]) continue;
      const [sx, sy] = toScreen(gx, gy);
      const color = colors[Math.floor(rng() * colors.length)];

      // Look right (+gx) and down (+gy) for neighbours
      for (let d = 1; d <= 3; d++) {
        if (gx + d < gridSize && hasBlock[gy][gx + d]) {
          const [ex, ey] = toScreen(gx + d, gy);
          elements.push(
            <line key={`cx${gx}-${gy}-${d}`} x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={color} strokeWidth={0.4} opacity={0.07} />
          );
          break; // only connect to nearest
        }
      }
      for (let d = 1; d <= 3; d++) {
        if (gy + d < gridSize && hasBlock[gy + d][gx]) {
          const [ex, ey] = toScreen(gx, gy + d);
          elements.push(
            <line key={`cy${gx}-${gy}-${d}`} x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={color} strokeWidth={0.4} opacity={0.07} />
          );
          break;
        }
      }
    }
  }

  // 3. Data blocks — draw back-to-front (sorted by gx+gy for correct occlusion)
  const cells: { gx: number; gy: number }[] = [];
  for (let gy = 0; gy < gridSize; gy++)
    for (let gx = 0; gx < gridSize; gx++)
      if (hasBlock[gy][gx]) cells.push({ gx, gy });
  cells.sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));

  for (const { gx, gy } of cells) {
    const [sx, sy] = toScreen(gx, gy);
    const bh = blockH[gy][gx];
    const color = colors[Math.floor(rng() * colors.length)];
    const op = 0.07 + rng() * 0.11;

    // Top face (diamond)
    const top = `${sx},${sy - bh - hh} ${sx + hw},${sy - bh} ${sx},${sy - bh + hh} ${sx - hw},${sy - bh}`;
    // Left face
    const left = `${sx - hw},${sy - bh} ${sx},${sy - bh + hh} ${sx},${sy + hh} ${sx - hw},${sy}`;
    // Right face
    const right = `${sx},${sy - bh + hh} ${sx + hw},${sy - bh} ${sx + hw},${sy} ${sx},${sy + hh}`;

    elements.push(
      <polygon key={`bt${gx}-${gy}`} points={top}
        fill={color} opacity={op * 1.3}
        stroke={color} strokeWidth={0.3} strokeOpacity={op * 0.4} />
    );
    elements.push(
      <polygon key={`bl${gx}-${gy}`} points={left}
        fill={color} opacity={op * 0.65}
        stroke={color} strokeWidth={0.3} strokeOpacity={op * 0.4} />
    );
    elements.push(
      <polygon key={`br${gx}-${gy}`} points={right}
        fill={color} opacity={op}
        stroke={color} strokeWidth={0.3} strokeOpacity={op * 0.4} />
    );

    // Node dot at block base
    elements.push(
      <circle key={`bn${gx}-${gy}`} cx={sx} cy={sy} r={1}
        fill={color} opacity={op * 1.5} />
    );
  }

  return <>{elements}</>;
}

/* ── Main component (memoized) ── */
const GenerativeThumb = React.memo(function GenerativeThumb({
  title,
  variant,
  className,
}: Props) {
  const content = React.useMemo(() => {
    const seed = hash32(title);
    const rng = seededRng(seed);
    const colors = PALETTES[variant];

    const Pattern = variant === "blog"
      ? BlogPattern
      : variant === "project"
      ? ProjectPattern
      : ResearchPattern;

    return <Pattern rng={rng} colors={colors} />;
  }, [title, variant]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width={W} height={H} fill={BG[variant]} className="dark:hidden" />
      <rect width={W} height={H} fill={BG_DARK[variant]} className="hidden dark:block" />
      {content}
    </svg>
  );
});

GenerativeThumb.displayName = "GenerativeThumb";
export default GenerativeThumb;
