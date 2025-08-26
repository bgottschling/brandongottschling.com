// src/components/BackgroundNetworkMesh.tsx
'use client'
import React, { useEffect, useRef } from 'react'

type Props = {
  density?: number            // 0..1 density multiplier
  hue?: number                // override; otherwise read from --accent
  respectReducedMotion?: boolean
  triangles?: boolean         // enable shaded triangles
  triangleStrength?: number   // 0..1 overall intensity of fills
  triSmoothing?: number       // 0..1 EMA factor (fade speed), e.g., 0.12
  fadeOut?: number            // 0..1 extra decay for triangles not present, e.g., 0.08
}

export default function BackgroundNetworkMesh({
  density = 1,
  hue,
  respectReducedMotion = true,
  triangles = true,
  triangleStrength = 0.8,
  triSmoothing = 0.12,
  fadeOut = 0.08,
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

    // Accent hue from CSS variable if available
    let accentHue = hue ?? 38
    const accentVar = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const m = /hsl\((\d+)/i.exec(accentVar)
    if (m) accentHue = Number(m[1])

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    // ----- state -----
    let w = 0, h = 0
    let pts: { x: number; y: number; vx: number; vy: number; sx: number; sy: number }[] = []
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

    function triKey(i: number, j: number, k: number) {
      // i<j<k always
      return `${i},${j},${k}`
    }

    function rand(min: number, max: number) { return min + Math.random() * (max - min) }

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // adaptive density; clamp so triangle step stays fast
      targetCount = Math.max(36, Math.min(Math.round((w * h) / 12000 * density), 160))
      maxDist = Math.max(80, Math.min(140, Math.sqrt(w * h) / 18))
      maxD2 = maxDist * maxDist

      // seed/trim particles
      if (pts.length > targetCount) pts.length = targetCount
      while (pts.length < targetCount) {
        pts.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.4, 0.4),
          vy: rand(-0.4, 0.4),
          sx: 0, sy: 0,
        })
      }
    }

    function step(dt: number) {
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        p.sx = p.x; p.sy = p.y
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

    // distance closeness 0..1
    function dist01(a: number, b: number) {
      const dx = pts[a].sx - pts[b].sx
      const dy = pts[a].sy - pts[b].sy
      const d2 = dx * dx + dy * dy
      return 1 - d2 / maxD2
    }

    function updateTriangles(neighbors: number[][]) {
      const n = pts.length
      const mark = new Uint8Array(n)
      const present = new Set<string>() // triangles seen this frame

      for (let i = 0; i < n; i++) {
        for (const j of neighbors[i]) if (j > i) mark[j] = 1

        for (const j of neighbors[i]) {
          if (j <= i) continue
          for (const k of neighbors[j]) {
            if (k <= j) continue
            if (!mark[k]) continue // not connected to i

            // Strength based on average edge "closeness"
            const t = (dist01(i, j) + dist01(j, k) + dist01(k, i)) / 3 // 0..1
            const target = (0.05 + 0.22 * t) * triangleStrength
            const key = triKey(i, j, k)
            present.add(key)

            const prev = triAlpha.get(key) ?? 0
            // Exponential smoothing toward target (fade in/out)
            const next = prev + (target - prev) * triSmoothing
            triAlpha.set(key, next)
          }
        }
        for (const j of neighbors[i]) if (j > i) mark[j] = 0
      }

      // Decay triangles not present this frame
      for (const [key, a] of triAlpha) {
        if (!present.has(key)) {
          const decayed = a * (1 - fadeOut)
          if (decayed <= 0.003) triAlpha.delete(key)
          else triAlpha.set(key, decayed)
        }
      }
    }

    function drawTrianglesFromCache() {
      // Draw back-to-front-ish: low alpha first (optional)
      const entries = Array.from(triAlpha.entries())
      entries.sort((a, b) => a[1] - b[1])

      for (const [key, alpha] of entries) {
        if (alpha <= 0.003) continue
        const [is, js, ks] = key.split(',')
        const i = Number(is), j = Number(js), k = Number(ks)

        // Recompute closeness to slightly vary color/lightness with geometry
        const t = (dist01(i, j) + dist01(j, k) + dist01(k, i)) / 3
        const light = 45 + (1 - t) * 8   // closer = slightly brighter
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
          if (pts.length > 36) pts.length = Math.floor(pts.length * 0.9)
        } else if (fps > 55) {
          trianglesEnabled = triangles
        }
      }
    }

    let last = performance.now()
    function tick(now: number) {
      if (paused) return
      const dt = Math.min(32, now - last)
      last = now

      step(dt * 0.06)
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
  }, [density, hue, respectReducedMotion, triangles, triangleStrength, triSmoothing, fadeOut])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}
