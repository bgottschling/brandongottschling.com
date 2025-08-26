// src/components/BackgroundNetworkPolyrhythm.tsx
'use client'
import React, { useEffect, useRef } from 'react'

type Props = {
  density?: number
  hue?: number
  respectReducedMotion?: boolean
  // mesh controls
  triangles?: boolean
  triangleStrength?: number      // overall intensity of fills
  triSmoothing?: number          // 0..1 EMA factor for triangle alpha
  fadeOut?: number               // 0..1 decay when triangle disappears
  // polyrhythm controls
  polyAmp?: number               // px amplitude of sinusoidal offsets
  harmonyStrength?: number       // 0..1 how strongly lattice pulls at beat crest
  gridStep?: number              // px lattice spacing (tri/hex grid)
}

export default function BackgroundNetworkPolyrhythm({
  density = 1,
  hue,
  respectReducedMotion = true,
  triangles = true,
  triangleStrength = 0.8,
  triSmoothing = 0.12,
  fadeOut = 0.08,
  polyAmp = 12,              // gentle mechanical sway
  harmonyStrength = 0.18,    // how strongly we “snap” toward lattice on the beat
  gridStep = 140,            // hex cell size; smaller = tighter lattice
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none'
      return
    } else {
      canvas.style.display = ''
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Accent hue from CSS var --accent (fallback amber 38)
    let accentHue = hue ?? 38
    const accentVar = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const m = /hsl\((\d+)/i.exec(accentVar); if (m) accentHue = Number(m[1])

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    // ----- state -----
    let w = 0, h = 0
    type P = {
      bx: number; by: number;   // base position (slow drift)
      vx: number; vy: number;   // tiny random drift velocity
      sx: number; sy: number;   // screen position (with offsets)
      φ1: number; φ2: number; φ3: number; // per-point phases
    }
    let pts: P[] = []
    let targetCount = 0
    let maxDist = 120
    let maxD2 = maxDist * maxDist
    let animId = 0
    let paused = false

    // FPS guard (auto disable triangles if needed)
    let frames = 0
    let lastFpsSample = performance.now()
    let fps = 60
    let trianglesEnabled = triangles

    // Triangle alpha cache: "i,j,k" -> alpha
    const triAlpha = new Map<string, number>()
    const triKey = (i: number, j: number, k: number) => `${i},${j},${k}`

    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // adaptive density; clamp so O(n^2) neighbor work stays fast
      targetCount = Math.max(40, Math.min(Math.round((w * h) / 12000 * density), 160))
      maxDist = Math.max(80, Math.min(140, Math.sqrt(w * h) / 18))
      maxD2 = maxDist * maxDist

      if (pts.length > targetCount) pts.length = targetCount
      while (pts.length < targetCount) {
        pts.push({
          bx: rand(0, w),
          by: rand(0, h),
          vx: rand(-0.05, 0.05),
          vy: rand(-0.05, 0.05),
          sx: 0, sy: 0,
          φ1: rand(0, Math.PI * 2),
          φ2: rand(0, Math.PI * 2),
          φ3: rand(0, Math.PI * 2),
        })
      }
    }

    // --- Polyrhythmic offset field ---
    // Three incommensurate angular frequencies (radians/sec).
    // Ratios ~ 3:4:5 with a slight detune → slow beats (emergent symmetry).
    //const ω1 = 0.42, ω2 = 0.56 * 0.995, ω3 = 0.70 * 1.006
    const τ = Math.PI * 2
    const ω = (T: number) => τ / T
    // Slow global “beat envelope” that periodically promotes symmetry.
    // Product of two slow sines (very long period) with a ramp-up (first ~30s).
   /* function harmonyEnvelope(t: number) {
      const a = 0.5 * (1 + Math.sin(t * 0.06))
      const b = 0.5 * (1 + Math.sin(t * 0.041))
      const base = a * b // 0..1 with slow, interesting beats
      const ramp = Math.min(1, t / 30) // ease in over 30s
      return 0.15 + 0.85 * base * ramp // keep some motion always present
    }*/
    // ω from periods 33s, 44s, 55s (slight detune to avoid exact repeats)
    const [ω1, ω2, ω3] = [ω(55), ω(89) * 0.999, ω(144) * 1.004]
    function harmonyEnvelope(t: number) {
    const a = 0.5 * (1 + Math.sin(t * ω(89)))
    const b = 0.5 * (1 + Math.sin(t * ω(144)))
    const base = a * b
    const ramp = Math.min(1, t / 34)     // φ-ish ramp-in
    return 0.18 + 0.82 * base * ramp
    }

    // Hex/triangular lattice target near a point (q,r axial-ish)
    function hexTarget(x: number, y: number, step: number) {
      const rowH = step * 0.866025403784 // sqrt(3)/2
      const row = Math.round(y / rowH)
      const offset = (row % 2) ? step / 2 : 0
      const col = Math.round((x - offset) / step)
      const tx = col * step + offset
      const ty = row * rowH
      return { tx, ty }
    }

    function step(tSec: number, dtMs: number) {
      const env = harmonyEnvelope(tSec)
      const gridPull = harmonyStrength * env   // 0..~0.18 default
      const amp = polyAmp * (0.6 + 0.4 * env)  // slightly larger amplitude on the crest

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]

        // very slow random drift of base position
        p.bx += p.vx * dtMs * 0.05
        p.by += p.vy * dtMs * 0.05
        if (p.bx < 0 || p.bx > w) p.vx *= -1
        if (p.by < 0 || p.by > h) p.vy *= -1

        // polyrhythmic offset (mechanical feel)
        const ox =
          amp * Math.sin(ω1 * tSec + p.φ1) +
          amp * 0.6 * Math.sin(ω2 * tSec + p.φ2) +
          amp * 0.4 * Math.sin(ω3 * tSec + p.φ3 + p.bx * 0.002)
        const oy =
          amp * Math.cos(ω1 * tSec + p.φ1 * 1.1) +
          amp * 0.6 * Math.cos(ω2 * tSec + p.φ2 * 1.3 + p.by * 0.002) +
          amp * 0.4 * Math.cos(ω3 * tSec + p.φ3)

        // gentle pull toward nearest hex lattice point during envelope crest
        const { tx, ty } = hexTarget(p.bx, p.by, gridStep)
        const gx = (tx - p.bx) * gridPull
        const gy = (ty - p.by) * gridPull

        p.sx = p.bx + ox + gx
        p.sy = p.by + oy + gy
      }
    }

    // Build neighbor lists (indices of nearby points)
    function buildNeighbors(): number[][] {
      const n = pts.length
      const neighbors: number[][] = Array.from({ length: n }, () => [])
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = pts[i].sx - pts[j].sx
          const dy = pts[i].sy - pts[j].sy
          const d2 = dx * dx + dy * dy
          if (d2 < maxD2) {
            neighbors[i].push(j)
            neighbors[j].push(i)
          }
        }
      }
      for (let i = 0; i < n; i++) neighbors[i].sort((a, b) => a - b)
      return neighbors
    }

    const dist01 = (a: number, b: number) => {
      const dx = pts[a].sx - pts[b].sx
      const dy = pts[a].sy - pts[b].sy
      const d2 = dx * dx + dy * dy
      return 1 - d2 / maxD2 // 1 when close, 0 at threshold
    }

    function updateTriangles(neighbors: number[][]) {
      const n = pts.length
      const mark = new Uint8Array(n)
      const present = new Set<string>()

      for (let i = 0; i < n; i++) {
        for (const j of neighbors[i]) if (j > i) mark[j] = 1

        for (const j of neighbors[i]) {
          if (j <= i) continue
          for (const k of neighbors[j]) {
            if (k <= j) continue
            if (!mark[k]) continue

            const t = (dist01(i, j) + dist01(j, k) + dist01(k, i)) / 3
            const target = (0.05 + 0.22 * t) * triangleStrength
            const key = triKey(i, j, k)
            present.add(key)

            const prev = triAlpha.get(key) ?? 0
            const next = prev + (target - prev) * triSmoothing // EMA toward target
            triAlpha.set(key, next)
          }
        }
        for (const j of neighbors[i]) if (j > i) mark[j] = 0
      }

      // decay old triangles
      for (const [key, a] of triAlpha) {
        if (!present.has(key)) {
          const decayed = a * (1 - fadeOut)
          if (decayed <= 0.003) triAlpha.delete(key)
          else triAlpha.set(key, decayed)
        }
      }
    }

    function drawTrianglesFromCache() {
      const entries = Array.from(triAlpha.entries())
      entries.sort((a, b) => a[1] - b[1]) // faint first
      for (const [key, alpha] of entries) {
        if (alpha <= 0.003) continue
        const [is, js, ks] = key.split(',')
        const i = Number(is), j = Number(js), k = Number(ks)
        const t = (dist01(i, j) + dist01(j, k) + dist01(k, i)) / 3
        const light = 45 + (1 - t) * 8
        ctx.beginPath()
        ctx.moveTo(pts[i].sx, pts[i].sy)
        ctx.lineTo(pts[j].sx, pts[j].sy)
        ctx.lineTo(pts[k].sx, pts[k].sy)
        ctx.closePath()
        ctx.fillStyle = `hsl(${accentHue} 75% ${light}% / ${alpha})`
        ctx.fill()
      }
    }

    function drawEdges(neighbors: number[][]) {
      for (let i = 0; i < pts.length; i++) {
        for (const j of neighbors[i]) {
          if (j <= i) continue
          const t = dist01(i, j)
          ctx.strokeStyle = `hsl(${accentHue} 70% 45% / ${0.10 + 0.28 * t})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pts[i].sx, pts[i].sy)
          ctx.lineTo(pts[j].sx, pts[j].sy)
          ctx.stroke()
        }
      }
    }

    function drawPoints() {
      ctx.fillStyle = `hsl(${accentHue} 70% 50% / 0.75)`
      for (const p of pts) {
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function updateFps(now: number) {
      frames++
      if (now - lastFpsSample >= 1000) {
        fps = frames
        frames = 0
        lastFpsSample = now
        if (fps < 45) {
          trianglesEnabled = false
          if (pts.length > 40) pts.length = Math.floor(pts.length * 0.9)
        } else if (fps > 55) {
          trianglesEnabled = triangles
        }
      }
    }

    // main loop
    let last = performance.now()
    function tick(now: number) {
      if (paused) return
      const dt = Math.min(32, now - last)
      last = now

      const tSec = now * 0.001
      step(tSec, dt)

      ctx.clearRect(0, 0, w, h)
      const neighbors = buildNeighbors()
      if (trianglesEnabled) {
        updateTriangles(neighbors)
        drawTrianglesFromCache()
      }
      drawEdges(neighbors)
      drawPoints()

      updateFps(now)
      animId = requestAnimationFrame(tick)
    }

    function onVis() {
      paused = document.hidden
      if (!paused) {
        last = performance.now()
        animId = requestAnimationFrame(tick)
      } else {
        cancelAnimationFrame(animId)
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(document.documentElement)
    document.addEventListener('visibilitychange', onVis)
    animId = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      cancelAnimationFrame(animId)
    }
  }, [
    density, hue, respectReducedMotion,
    triangles, triangleStrength, triSmoothing, fadeOut,
    polyAmp, harmonyStrength, gridStep,
  ])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}
