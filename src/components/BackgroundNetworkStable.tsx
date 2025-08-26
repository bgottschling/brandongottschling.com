'use client'
import React, { useEffect, useRef } from 'react'

type Props = {
  density?: number            // 0..1 density multiplier
  hue?: number                // override; otherwise reads --accent
  respectReducedMotion?: boolean
  triangles?: boolean         // shaded triangles on/off
  triangleStrength?: number   // 0..1 overall triangle opacity
  triSmoothing?: number       // 0..1 EMA factor for triangle alpha
  fadeOut?: number            // 0..1 decay for triangles that disappear
  maxLinksPx?: number         // link distance in px (auto-adaptive if omitted)
  // “Snap harmony” controls (periodic lattice attraction)
  harmonyStrength?: number    // pull strength at peak (0.1–0.25 is tasteful)
  snapEvery?: [number, number]// seconds range between snaps [min,max]
  snapRise?: number           // seconds to rise into snap
  snapHold?: number           // seconds to hold the snap peak
  snapFall?: number           // seconds to release from snap
}

export default function BackgroundNetworkStable({
  density = 1,
  hue,
  respectReducedMotion = true,
  triangles = true,
  triangleStrength = 0.8,
  triSmoothing = 0.12,
  fadeOut = 0.08,
  maxLinksPx,
  harmonyStrength = 0.18,
  snapEvery = [25, 60],
  snapRise = 3,
  snapHold = 4,
  snapFall = 5,
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

    // ---- Theme hue (from --accent) ----
    let accentHue = hue ?? 38
    const m = /hsl\((\d+)/i.exec(
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    )
    if (m) accentHue = Number(m[1])

    // ---- Rendering + math guards ----
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const τ = Math.PI * 2
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
    const wrapTau = (a: number) => {
      // keep angle inside [-π, π] to avoid precision loss
      if (!Number.isFinite(a)) return 0
      a %= τ
      return a > Math.PI ? a - τ : a < -Math.PI ? a + τ : a
    }

    // ---- State ----
    let w = 0, h = 0
    let N = 0
    let linkDist = 120
    let linkDist2 = linkDist * linkDist
    let animId = 0
    let paused = false

    // Deterministic PRNG (xorshift32) to avoid weird clustering on refresh
    let seed = 0x9e3779b9
    const rnd = () => {
      // eslint-disable-next-line no-bitwise
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5
      // eslint-disable-next-line no-bitwise
      return ((seed >>> 0) / 0xffffffff)
    }
    const rr = (a: number, b: number) => a + rnd() * (b - a)

    // Typed arrays for speed & stability
    let bx!: Float32Array, by!: Float32Array // base positions
    let vx!: Float32Array, vy!: Float32Array // slow drift
    let sx!: Float32Array, sy!: Float32Array // screen positions
    let p1!: Float32Array, p2!: Float32Array, p3!: Float32Array // phases

    // Spatial grid (uniform buckets) to avoid O(N^2) explosion
    let cellSize = 100
    let cols = 0, rows = 0
    let buckets: Int32Array[] = []

    function rebuildBuckets() {
      buckets = Array.from({ length: cols * rows }, () => new Int32Array(0))
      const counts = new Int32Array(cols * rows)
      // First pass: count
      for (let i = 0; i < N; i++) {
        const cx = clamp(Math.floor(sx[i] / cellSize), 0, cols - 1)
        const cy = clamp(Math.floor(sy[i] / cellSize), 0, rows - 1)
        counts[cy * cols + cx]++
      }
      // Allocate
      const offsets = new Int32Array(cols * rows)
      for (let i = 0; i < counts.length; i++) {
        buckets[i] = new Int32Array(counts[i])
        offsets[i] = 0
      }
      // Second pass: fill
      for (let i = 0; i < N; i++) {
        const cx = clamp(Math.floor(sx[i] / cellSize), 0, cols - 1)
        const cy = clamp(Math.floor(sy[i] / cellSize), 0, rows - 1)
        const idx = cy * cols + cx
        buckets[idx][offsets[idx]++] = i
      }
    }

    function neighborsOf(i: number, out: number[]) {
      out.length = 0
      const cx = clamp(Math.floor(sx[i] / cellSize), 0, cols - 1)
      const cy = clamp(Math.floor(sy[i] / cellSize), 0, rows - 1)
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const x = cx + ox, y = cy + oy
          if (x < 0 || x >= cols || y < 0 || y >= rows) continue
          const arr = buckets[y * cols + x]
          for (let k = 0; k < arr.length; k++) {
            const j = arr[k]
            if (j === i) continue
            const dx = sx[i] - sx[j]
            const dy = sy[i] - sy[j]
            const d2 = dx * dx + dy * dy
            if (d2 < linkDist2) out.push(j)
          }
        }
      }
      // sort so i<j<k triangle keys are consistent
      out.sort((a, b) => a - b)
    }

    // Triangle alpha cache: "i,j,k" -> alpha
    const triAlpha = new Map<string, number>()
    const triKey = (i: number, j: number, k: number) => `${i},${j},${k}`

    function resize() {
      w = Math.max(1, window.innerWidth)
      h = Math.max(1, window.innerHeight)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Adaptive link length + density
      linkDist = maxLinksPx ?? Math.max(80, Math.min(140, Math.sqrt(w * h) / 18))
      linkDist2 = linkDist * linkDist

      const target = clamp(Math.round((w * h) / 12000 * density), 36, 180)
      if (target !== N) {
        N = target
        bx = new Float32Array(N); by = new Float32Array(N)
        vx = new Float32Array(N); vy = new Float32Array(N)
        sx = new Float32Array(N); sy = new Float32Array(N)
        p1 = new Float32Array(N); p2 = new Float32Array(N); p3 = new Float32Array(N)
        for (let i = 0; i < N; i++) {
          bx[i] = rr(0, w); by[i] = rr(0, h)
          vx[i] = rr(-0.05, 0.05); vy[i] = rr(-0.05, 0.05)
          sx[i] = bx[i]; sy[i] = by[i]
          p1[i] = rr(0, τ); p2[i] = rr(0, τ); p3[i] = rr(0, τ)
        }
      }

      // Grid sized to link distance
      cellSize = Math.max(24, Math.floor(linkDist))
      cols = Math.max(1, Math.ceil(w / cellSize))
      rows = Math.max(1, Math.ceil(h / cellSize))
    }

    // --- “Snap harmony” scheduler ---
    const snapStart = performance.now() * 0.001 // seconds
    let nextSnapAt = snapStart + rr(snapEvery[0], snapEvery[1])
    const baselinePull = 0.02 // always-on subtle coherence

    function snapEnvelope(t: number) {
      // Rises → holds → falls. Smoothstep each phase.
      if (t < nextSnapAt) return baselinePull
      const T = snapRise + snapHold + snapFall
      const phase = (t - nextSnapAt) / T
      if (phase <= 0) return baselinePull
      if (phase < snapRise / T) {
        const x = phase / (snapRise / T)
        const e = x * x * (3 - 2 * x)
        return baselinePull + (harmonyStrength - baselinePull) * e
      } else if (phase < (snapRise + snapHold) / T) {
        return harmonyStrength
      } else if (phase < 1) {
        const x = (phase - (snapRise + snapHold) / T) / (snapFall / T)
        const e = 1 - (x * x * (3 - 2 * x))
        return baselinePull + (harmonyStrength - baselinePull) * e
      } else {
        // schedule next window
        nextSnapAt = performance.now() * 0.001 + rr(snapEvery[0], snapEvery[1])
        return baselinePull
      }
    }

    // Hex lattice target (for the snap pull)
    const rowH = (step: number) => step * 0.866025403784 // sqrt(3)/2
    function hexTarget(x: number, y: number, step: number) {
      const rh = rowH(step)
      const row = Math.round(y / rh)
      const off = (row & 1) ? step / 2 : 0
      const col = Math.round((x - off) / step)
      return { tx: col * step + off, ty: row * rh }
    }

    // Polyrhythmic angles (wrapped)
    const ω1 = τ / 36, ω2 = (τ / 54) * 0.999, ω3 = (τ / 81) * 1.004
    const polyAmp = 12

    function step(tSec: number, dtMs: number) {
      const dt = clamp(dtMs, 0, 32)
      const pull = snapEnvelope(tSec)
      const gStep = clamp(Math.min(w, h) / 8, 96, 160) // lattice spacing by viewport

      for (let i = 0; i < N; i++) {
        // very slow drift of base positions
        bx[i] += vx[i] * dt * 0.05
        by[i] += vy[i] * dt * 0.05
        if (bx[i] < 0 || bx[i] > w) vx[i] = -vx[i]
        if (by[i] < 0 || by[i] > h) vy[i] = -vy[i]

        // polyrhythmic offsets (keep angles bounded)
        const a1 = wrapTau(ω1 * tSec + p1[i])
        const a2 = wrapTau(ω2 * tSec + p2[i])
        const a3 = wrapTau(ω3 * tSec + p3[i])

        const ox = polyAmp * (Math.sin(a1) + 0.6 * Math.sin(a2) + 0.4 * Math.sin(a3 + bx[i] * 0.002))
        const oy = polyAmp * (Math.cos(a1 * 1.07) + 0.6 * Math.cos(a2 * 1.13 + by[i] * 0.002) + 0.4 * Math.cos(a3))

        // snap pull toward nearest hex cell center
        const { tx, ty } = hexTarget(bx[i], by[i], gStep)
        const gx = (tx - bx[i]) * pull
        const gy = (ty - by[i]) * pull

        sx[i] = clamp(bx[i] + ox + gx, -64, w + 64)
        sy[i] = clamp(by[i] + oy + gy, -64, h + 64)
        if (!Number.isFinite(sx[i]) || !Number.isFinite(sy[i])) { sx[i] = bx[i]; sy[i] = by[i] }
      }
    }

    function dist01(i: number, j: number) {
      const dx = sx[i] - sx[j]
      const dy = sy[i] - sy[j]
      const d2 = dx * dx + dy * dy
      return 1 - d2 / linkDist2 // 1 near, 0 at threshold
    }

    function drawFrame() {
      ctx.clearRect(0, 0, w, h)
      // rebuild spatial grid after positions change
      rebuildBuckets()

      // Build neighbor lists from buckets
      const neigh: number[][] = Array.from({ length: N }, () => [])
      const tmp: number[] = []
      for (let i = 0; i < N; i++) {
        neighborsOf(i, tmp)
        // cap neighbors to avoid worst-case triangles
        if (tmp.length > 16) tmp.length = 16
        neigh[i] = tmp.slice()
      }

      // Update triangle alpha cache and draw fills
      if (trianglesEnabled) {
        const present = new Set<string>()
        const mark = new Uint8Array(N)

        for (let i = 0; i < N; i++) {
          for (const j of neigh[i]) if (j > i) mark[j] = 1
          for (const j of neigh[i]) {
            if (j <= i) continue
            const nj = neigh[j]
            for (let idx = 0; idx < nj.length; idx++) {
              const k = nj[idx]
              if (k <= j) continue
              if (!mark[k]) continue

              const t = (dist01(i, j) + dist01(j, k) + dist01(k, i)) / 3
              const target = (0.05 + 0.22 * t) * triangleStrength
              const key = triKey(i, j, k)
              present.add(key)
              const prev = triAlpha.get(key) ?? 0
              const next = prev + (target - prev) * triSmoothing
              triAlpha.set(key, next)
            }
          }
          for (const j of neigh[i]) if (j > i) mark[j] = 0
        }

        // decay missing triangles
        for (const [key, a] of triAlpha) {
          if (!present.has(key)) {
            const decayed = a * (1 - fadeOut)
            if (decayed <= 0.003) triAlpha.delete(key)
            else triAlpha.set(key, decayed)
          }
        }

        // draw triangles faint→strong
        const entries = Array.from(triAlpha.entries())
        entries.sort((a, b) => a[1] - b[1])
        for (const [key, alpha] of entries) {
          if (alpha <= 0.003) continue
          const [is, js, ks] = key.split(',')
          const i = Number(is), j = Number(js), k = Number(ks)
          const t = (dist01(i, j) + dist01(j, k) + dist01(k, i)) / 3
          const light = 45 + (1 - t) * 8
          ctx.beginPath()
          ctx.moveTo(sx[i], sy[i]); ctx.lineTo(sx[j], sy[j]); ctx.lineTo(sx[k], sy[k])
          ctx.closePath()
          ctx.fillStyle = `hsl(${accentHue} 75% ${light}% / ${alpha})`
          ctx.fill()
        }
      }

      // edges
      for (let i = 0; i < N; i++) {
        const ni = neigh[i]
        for (let idx = 0; idx < ni.length; idx++) {
          const j = ni[idx]
          if (j <= i) continue
          const t = dist01(i, j)
          ctx.strokeStyle = `hsl(${accentHue} 70% 45% / ${0.10 + 0.28 * t})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(sx[i], sy[i]); ctx.lineTo(sx[j], sy[j])
          ctx.stroke()
        }
      }

      // points
      ctx.fillStyle = `hsl(${accentHue} 70% 50% / 0.75)`
      for (let i = 0; i < N; i++) {
        ctx.beginPath()
        ctx.arc(sx[i], sy[i], 1.6, 0, τ)
        ctx.fill()
      }
    }

    // FPS guard (auto disable triangles if needed)
    let frames = 0
    let lastFpsSample = performance.now()
    let trianglesEnabled = triangles

    function updateFps(now: number) {
      frames++
      if (now - lastFpsSample >= 1000) {
        const fps = frames
        frames = 0
        lastFpsSample = now
        if (fps < 45) {
          trianglesEnabled = false
          // also relax neighbor cap slightly by lowering N
          if (N > 36) N = Math.floor(N * 0.9)
        } else if (fps > 55) {
          trianglesEnabled = triangles
        }
      }
    }

    // Main loop (bounded dt, wrapped time)
    let last = performance.now()
    function tick(now: number) {
      if (paused) return
      const dt = Math.min(32, now - last)
      last = now
      const tSec = (now * 0.001) % 3600 // wrap each hour for numeric stability

      step(tSec, dt)
      drawFrame()
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
  },[
    density, hue, respectReducedMotion,
    triangles, triangleStrength, triSmoothing, fadeOut,
    maxLinksPx, harmonyStrength,
    snapRise, snapHold, snapFall,
    // note: snap window range is stable for the lifetime of the component
  ])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}
