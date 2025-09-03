import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * EdgeScrim
 * - "column-blur": glassy, transparent blur with only left/right fades.
 * - "column": solid tint column with left/right fades.
 * - "plateau" / "edges-dark": legacy radial options.
 *
 * NOTE: This version is `fixed` by default so it always covers the viewport.
 */
export default function EdgeScrim({
  variant = "column-blur",
  // glass controls
  blur = 14,          // px
  tint = 0.06,        // 0..1 (keep tiny)
  saturate = 1.0,     // 1.0 neutral
  // geometry
  columnWidth = "min(100vw - 2rem, 48rem)",
  fade = "16rem",
  centerX = "50%",
  // legacy radial
  innerStop = 42,
  outerStop = 82,
  center = { x: "50%", y: "45%" },
  // positioning
  z = "z-0",
  fixed = true,       // <— default to fixed overlay
  debug = false,
  className,
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
  z?: string;
  fixed?: boolean;
  debug?: boolean;
  className?: string;
}) {
  const containerPos = fixed ? "fixed" : "absolute";

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

  const style: React.CSSProperties =
    variant === "column-blur"
      ? {
          // small neutral tint is required for backdrop-filter to render in some engines
          backgroundColor: `rgba(255,255,255,${clamp01(tint)})`,
          WebkitBackdropFilter: `saturate(${saturate}) blur(${blur}px)`,
          backdropFilter: `saturate(${saturate}) blur(${blur}px)`,
          WebkitMaskImage: mask,
          maskImage: mask,
        }
      : {
          backgroundColor: "rgba(10,10,15,0.55)",
          WebkitMaskImage: mask,
          maskImage: mask,
        };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none inset-0 will-change-transform",
        containerPos, // fixed|absolute
        z,
        debug && "outline outline-1 outline-red-500",
        className
      )}
      style={style}
      data-variant={variant}
      data-blur={blur}
      data-tint={tint}
      data-saturate={saturate}
      data-columnwidth={columnWidth}
      data-fade={fade}
    />
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
