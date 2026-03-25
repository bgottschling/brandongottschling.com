"use client";

import { useRef, useEffect } from "react";
import { createRng } from "@/lib/seeded-random";
import { getContentTheme, type ContentTheme } from "@/lib/content-colors";

/* ── Catmull-Rom spline through seeded control points ── */

function generateRidgeLine(
  rng: () => number,
  length: number,
  amplitude: number,
  baseY: number
): number[] {
  const controlCount = 10 + Math.floor(rng() * 5);
  const controls: number[] = [];
  for (let i = 0; i <= controlCount; i++) {
    controls.push(baseY + (rng() - 0.45) * amplitude);
  }
  // wrap for seamless looping
  const wrapped = [...controls, controls[0], controls[1], controls[2]];
  const points: number[] = [];
  const segments = wrapped.length - 3;

  for (let i = 0; i < length; i++) {
    const t = (i / length) * segments;
    const seg = Math.floor(t);
    const frac = t - seg;
    const p0 = wrapped[seg];
    const p1 = wrapped[seg + 1];
    const p2 = wrapped[seg + 2];
    const p3 = wrapped[seg + 3];
    const v =
      0.5 *
      (2 * p1 +
        (-p0 + p2) * frac +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * frac * frac +
        (-p0 + 3 * p1 - 3 * p2 + p3) * frac * frac * frac);
    points.push(v);
  }
  return points;
}

function sampleSmooth(pts: number[], pos: number): number {
  const len = pts.length;
  const idx = ((pos % len) + len) % len;
  const i0 = Math.floor(idx);
  const i1 = (i0 + 1) % len;
  const frac = idx - i0;
  return pts[i0] * (1 - frac) + pts[i1] * frac;
}

/* ── Layer data ── */

interface Layer {
  points: number[];
  speed: number;
  depth: number; // 0 = farthest, 1 = closest
}

function initLayers(
  seed: string,
  w: number,
  h: number,
  layerCount: number
): Layer[] {
  const rng = createRng(seed);
  const layers: Layer[] = [];
  const pointCount = Math.ceil(w * 4);

  for (let i = 0; i < layerCount; i++) {
    const depth = i / (layerCount - 1);
    const baseY = h * 0.25 + depth * h * 0.55;
    const amplitude = 8 + depth * 22;
    const speed = 0.04 + depth * 0.18;
    layers.push({
      points: generateRidgeLine(rng, pointCount, amplitude, baseY),
      speed,
      depth,
    });
  }
  return layers;
}

/* ── Component ── */

interface Props {
  seed: string;
  contentType?: "blog" | "project" | "research" | string;
  className?: string;
}

export default function CardThumbnailCanvas({
  seed,
  contentType = "blog",
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const offsetRef = useRef(0);
  const layersRef = useRef<Layer[] | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect reduced motion
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    // Use 1x DPR for performance (multiple canvases on screen)
    canvas.width = w;
    canvas.height = h;

    const theme = getContentTheme(contentType);
    const layerCount = theme.ridgeFills.length;

    if (!layersRef.current) {
      layersRef.current = initLayers(seed, w, h, layerCount);
    }
    const layers = layersRef.current;

    // Pre-build sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, theme.sky[0]);
    skyGrad.addColorStop(1, theme.sky[1]);

    // Pre-build per-layer fill gradients
    const layerGrads: CanvasGradient[] = layers.map((layer, li) => {
      const ridgeY = h * 0.25 + layer.depth * h * 0.55;
      const g = ctx.createLinearGradient(0, ridgeY - 15, 0, h);
      const [top, bottom] = theme.ridgeFills[li];
      g.addColorStop(0, top);
      g.addColorStop(1, bottom);
      return g;
    });

    let paused = false;

    function drawFrame() {
      if (!ctx) return;
      // Sky
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Horizon glow
      const glowY = h * 0.28;
      const horizonGrad = ctx.createRadialGradient(
        w / 2,
        glowY,
        0,
        w / 2,
        glowY,
        w * 0.45
      );
      horizonGrad.addColorStop(0, theme.glow);
      horizonGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw layers back to front
      for (let li = 0; li < layers.length; li++) {
        const layer = layers[li];
        const pts = layer.points;
        const scroll = offsetRef.current * layer.speed;

        // Build path
        const step = 3;
        ctx.beginPath();
        ctx.moveTo(0, h);
        let firstY = sampleSmooth(pts, scroll);
        ctx.lineTo(0, firstY);

        for (let x = step; x <= w; x += step) {
          const y = sampleSmooth(pts, x + scroll);
          ctx.lineTo(x, y);
        }
        const lastY = sampleSmooth(pts, w + scroll);
        ctx.lineTo(w, lastY);
        ctx.lineTo(w, h);
        ctx.closePath();

        ctx.fillStyle = layerGrads[li];
        ctx.fill();

        // Stroke the ridge
        ctx.beginPath();
        ctx.moveTo(0, firstY);
        for (let x = step; x <= w; x += step) {
          ctx.lineTo(x, sampleSmooth(pts, x + scroll));
        }
        ctx.lineTo(w, lastY);
        ctx.strokeStyle = theme.ridgeStrokes[li];
        ctx.lineWidth = 0.8 + layer.depth * 0.4;
        ctx.stroke();
      }
    }

    // Draw initial frame
    drawFrame();

    if (reducedMotion) return; // static frame only

    // Animation loop
    function animate() {
      if (paused) return;
      offsetRef.current += 0.3;
      drawFrame();
      rafRef.current = requestAnimationFrame(animate);
    }

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !paused) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(rafRef.current);
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Pause on tab hidden
    function onVisibility() {
      paused = document.hidden;
      if (!paused) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(rafRef.current);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [seed, contentType]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0 h-full w-full"}
      style={{ display: "block" }}
    />
  );
}
