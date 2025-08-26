// src/components/HorizonBackground.tsx
'use client'
import React, { useEffect, useRef } from 'react'

type Props = {
  /** 0..1 density multiplier (adaptive to viewport) */
  density?: number
  /** world speed (units/sec) — subtle by default */
  speed?: number
  /** horizon line as a fraction of height (0..1), e.g. 0.35 = top third */
  horizon?: number
  /** focal length (px) for perspective strength */
  focal?: number
  /** optional hue override; otherwise reads CSS var --accent */
  hue?: number
  /** respect prefers-reduced-motion (default true) */
  respectReducedMotion?: boolean
}

export default function HorizonBackground({
  density = 1,
  speed = 30,
  horizon = 0.35,
  focal = 600,
  hue,
  respectReducedMotion = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (respectReducedMotion && reduce) {
      canvas.style.display = 'none'
      return
    } else {
      canvas.style.display = ''
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Pull hue from --accent if available
    let accentHue = hue ?? 38
    const accentVar = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const match = /hsl\((\d+)/i.exec(accentVar)
    if (match) accentHue = Number(match[1])

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    // Vanishing point (updated on resize / slight drift)
    let w = 0, h = 0, cx = 0, cy = 0
    let zMin = 80, zMax = 2000
    let worldHalfX = 0, worldHalfY = 0

    type P = { x: number; y: number; z: number; sx: number; sy: number }
    let pts: P[] = []
    let targetCount = 0
    let animId = 0
    let last = performance.now()

    function rand(min: number, max: number) { return min + Math.random() * (max - min) }

    function project(p: P) {
      // Perspective projection toward (cx, cy)
      const k = focal / p.z
      p.sx = cx + p.x * k
      p.sy = cy + p.y * k
    }

    function spawn(p: P) {
      // Spawn at near plane so it starts larger then gently shrinks toward the horizon
      p.z = rand(zMin, zMin + 200)
      // Choose world extents so that at zMax points still project within screen
      p.x = rand(-worldHalfX, worldHalfX)
      p.y = rand(-worldHalfY, worldHalfY)
      project(p)
    }

    function ensureCount() {
      while (pts.length < targetCount) {
        const p: P = { x: 0, y: 0, z: 0, sx: 0, sy: 0 }
        spawn(p)
        pts.push(p)
      }
      if (pts.length > targetCount) pts.length = targetCount
    }

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cx = w * 0.5
      cy = h * horizon

      // Choose world extents so that points at zMax still map inside view
      worldHalfX = (w * 0.52) * (zMax / focal)
      worldHalfY = (h * 0.55) * (zMax / focal)

      // Adaptive density: ~1 dot / 18k px² at density=1
      targetCount = Math.max(40, Math.min(Math.round((w * h) / 18000 * density), 280))
      ensureCount()
    }

    function step(dt: number) {
      const dz = speed * (dt / 1000) // z increases → points converge to vanishing point
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        const prevSX = p.sx, prevSY = p.sy

        p.z += dz
        if (p.z > zMax) {
          spawn(p)
          continue
        }
        project(p)

        // If projected off-screen by a lot, respawn to keep budget where it matters
        if (p.sx < -100 || p.sx > w + 100 || p.sy < -100 || p.sy > h + 100) {
          spawn(p)
          continue
        }

        // Draw: subtle trail from last to current pos
        const t = (p.z - zMin) / (zMax - zMin) // 0 (near) → 1 (far)
        const alpha = 0.08 + (1 - t) * 0.22   // brighter when closer
        const size = 1.1 + (1 - t) * 0.9      // slightly larger when near

        // line (motion trail)
        ctx.strokeStyle = `hsl(${accentHue} 70% 40% / ${alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(prevSX, prevSY)
        ctx.lineTo(p.sx, p.sy)
        ctx.stroke()

        // point
        ctx.fillStyle = `hsl(${accentHue} 70% 47% / ${alpha + 0.05})`
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function draw() {
      // Very light fog so motion is readable but content stays clear
      ctx.clearRect(0, 0, w, h)
      // optional: faint radial haze centered slightly below horizon
      const grd = ctx.createRadialGradient(cx, cy + h * 0.25, h * 0.1, cx, cy + h * 0.25, Math.max(w, h) * 0.9)
      grd.addColorStop(0, 'rgba(0,0,0,0)')
      grd.addColorStop(1, 'rgba(0,0,0,0.08)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, w, h)
    }

    function tick(now: number) {
      const dt = Math.min(32, now - last)
      last = now

      draw()
      step(dt)

      // Subtle horizon drift for life
      const t = now * 0.00006
      cx += Math.sin(t * 1.7) * 0.15
      cy = h * horizon + Math.cos(t * 1.1) * 0.2

      animId = requestAnimationFrame(tick)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(document.documentElement)

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(animId)
      else {
        last = performance.now()
        animId = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    animId = requestAnimationFrame(tick)

    return () => {
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      cancelAnimationFrame(animId)
    }
  }, [density, speed, horizon, focal, hue, respectReducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}
