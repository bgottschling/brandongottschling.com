import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * EdgeScrim
 * A non-interactive overlay between your background and content.
 *
 * Variants:
 *  - "column-blur"  ← glassy, transparent blur in a rectangular column
 *  - "column"       ← solid tint column with soft left/right fades
 *  - "plateau"      ← radial, center-defined plateau with soft falloff
 *  - "edges-dark"   ← classic vignette (darker edges)
 */
export default function EdgeScrim({
  variant = "column-blur",
  // glass settings
  blur = 14,            // px of backdrop blur
  tint = 0.06,          // 0..1 neutral surface tint over blur (keep small)
  saturate = 1.0,       // 1.0 = neutral, >1 boosts color, <1 desaturates
  // column geometry
  columnWidth = "min(100vw - 2rem, 48rem)", // align to max-w-3xl by default
  fade = "16rem",       // width of the left/right feather
  centerX = "50%",      // horizontally center the reading lane
  // legacy radial options kept for convenience
  innerStop = 42,
  outerStop = 82,
  center = { x: "50%", y: "45%" },
  className,
  z = "z-0",
  debug = false,
}: {
  variant?: "column-blur" | "column" | "plateau" | "edges-dark";
  blur?: number;
  tint?: number;
  saturate?: number;
  columnWidth?: string;
  fade?: string;
  centerX?: string;
  innerStop?: number;
  outerStop?: number;
  center?: { x?: string; y?: string };
  className?: string;
  z?: string;
  debug?: boolean;
}) {
  // Masks
  const maskColumn = `linear-gradient(
    to right,
    rgba(0,0,0,0) 0,
    rgba(0,0,0,0) calc(${centerX} - (${columnWidth} / 2) - ${fade}),
    rgba(0,0,0,1) calc(${centerX} - (${columnWidth} / 2)),
    rgba(0,0,0,1) calc(${centerX} + (${columnWidth} / 2)),
    rgba(0,0,0,0) calc(${centerX} + (${columnWidth} / 2) + ${fade}),
    rgba(0,0,0,0) 100%
  )`;

  const maskPlateau = `radial-gradient(
    120% 88% at ${center.x ?? "50%"} ${center.y ?? "45%"},
    rgba(0,0,0,1) 0%,
    rgba(0,0,0,1) ${innerStop}%,
    rgba(0,0,0,0.65) ${innerStop + 10}%,
    rgba(0,0,0,0.30) ${innerStop + 22}%,
    rgba(0,0,0,0.08) ${outerStop - 6}%,
    rgba(0,0,0,0) ${outerStop}%
  )`;

  const maskEdges = `radial-gradient(
    135% 110% at center,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,0.08) 58%,
    rgba(0,0,0,0.28) 78%,
    rgba(0,0,0,0.5) 100%
  )`;

  const mask =
    variant === "column-blur" || variant === "column"
      ? maskColumn
      : variant === "edges-dark"
      ? maskEdges
      : maskPlateau;

  // Background layer “tint” for visibility; tiny alpha keeps it transparent.
  const backgroundColor =
    variant === "column-blur" ? `rgba(255,255,255,${tint})` : `rgba(10,10,15,${Math.min(0.75, Math.max(0, 0.9))})`;

  const style: React.CSSProperties =
    variant === "column-blur"
      ? {
          backgroundColor,
          WebkitBackdropFilter: `saturate(${saturate}) blur(${blur}px)`,
          backdropFilter: `saturate(${saturate}) blur(${blur}px)`,
          WebkitMaskImage: mask,
          maskImage: mask,
        }
      : {
          backgroundColor,
          WebkitMaskImage: mask,
          maskImage: mask,
        };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 will-change-transform",
        // no blend modes for blur; keep it clean over light/dark
        z,
        debug && "outline outline-1 outline-red-500",
        className
      )}
      style={style}
    />
  );
}
