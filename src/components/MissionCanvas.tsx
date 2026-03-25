"use client";

import { useRef, useEffect } from "react";
import { createRng } from "@/lib/seeded-random";

/**
 * A tranquil, minimalistic canvas animation for the mission card.
 * Renders 2-3 very soft, slowly undulating wave lines in amber tones.
 */

function generateWave(
  rng: () => number,
  length: number,
  amplitude: number,
  baseY: number
): number[] {
  const controlCount = 8 + Math.floor(rng() * 4);
  const controls: number[] = [];
  for (let i = 0; i <= controlCount; i++) {
    controls.push(baseY + (rng() - 0.5) * amplitude);
  }
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

interface WaveLayer {
  points: number[];
  speed: number;
  color: string;
  lineWidth: number;
}

export default function MissionCanvas({
  className,
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const offsetRef = useRef(0);
  const layersRef = useRef<WaveLayer[] | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w;
    canvas.height = h;

    if (!layersRef.current) {
      const rng = createRng("mission-tranquil");
      const pointCount = Math.ceil(w * 3);
      layersRef.current = [
        {
          points: generateWave(rng, pointCount, 10, h * 0.35),
          speed: 0.015,
          color: "rgba(217,170,100,0.10)",
          lineWidth: 1.2,
        },
        {
          points: generateWave(rng, pointCount, 14, h * 0.55),
          speed: 0.025,
          color: "rgba(200,150,70,0.14)",
          lineWidth: 1.0,
        },
        {
          points: generateWave(rng, pointCount, 8, h * 0.75),
          speed: 0.035,
          color: "rgba(185,130,50,0.10)",
          lineWidth: 0.8,
        },
      ];
    }
    const layers = layersRef.current;

    // Soft amber gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "rgba(255,248,235,0.6)");
    bgGrad.addColorStop(1, "rgba(255,243,220,0.3)");

    let paused = false;

    function drawFrame() {
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      for (const layer of layers) {
        const scroll = offsetRef.current * layer.speed;
        const step = 3;

        // Subtle filled area below the wave
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += step) {
          ctx.lineTo(x, sampleSmooth(layer.points, x + scroll));
        }
        ctx.lineTo(w, sampleSmooth(layer.points, w + scroll));
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();

        // Stroke the wave line
        ctx.beginPath();
        ctx.moveTo(0, sampleSmooth(layer.points, scroll));
        for (let x = step; x <= w; x += step) {
          ctx.lineTo(x, sampleSmooth(layer.points, x + scroll));
        }
        ctx.strokeStyle = layer.color.replace(/[\d.]+\)$/, "0.25)");
        ctx.lineWidth = layer.lineWidth;
        ctx.stroke();
      }
    }

    drawFrame();

    if (reducedMotion) return;

    function animate() {
      if (paused) return;
      offsetRef.current += 0.2;
      drawFrame();
      rafRef.current = requestAnimationFrame(animate);
    }

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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "h-[100px] w-full"}
      style={{ display: "block" }}
    />
  );
}
