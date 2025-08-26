'use client'
import React, { useEffect, useRef } from 'react'

type Props = {
  density?: number
  hue?: number
  /** if true, disable animation when user prefers reduced motion (default: true) */
  respectReducedMotion?: boolean
}

export default function BackgroundNetwork({
  density = 1,
  hue,
  respectReducedMotion = true,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    // 1) Only disable if you actually want to respect reduced motion
    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none'
      return
    } else {
      canvas.style.display = '' // ensure visible if you disabled earlier
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    // Accent hue fallback from CSS var
    let accentHue = hue ?? 38
    const accentVar = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const m = /hsl\((\d+)/i.exec(accentVar)
    if (m) accentHue = Number(m[1])

    // ---- state ----
    let w = 0, h = 0
    let pts: { x: number; y: number; vx: number; vy: number }[] = []
    let maxDist = 120
    let targetCount = 0
    let animId = 0
    let paused = false

    function rand(min: number, max: number) { return min + Math.random() * (max - min) }

    function seed() {
      while (pts.length < targetCount) {
        pts.push({ x: rand(0, w), y: rand(0, h), vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4) })
      }
      if (pts.length > targetCount) pts = pts.slice(0, targetCount)
    }

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      targetCount = Math.max(24, Math.min(Math.round((w * h) / 12000 * density), 220))
      maxDist = Math.max(80, Math.min(140, Math.sqrt(w * h) / 18))
      seed()
    }

    function step(dt: number) {
      for (const p of pts) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)

      // 2) Slightly stronger points for visibility
      ctx.fillStyle = `hsl(${accentHue} 70% 45% / 0.75)`
      for (const p of pts) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }

      // 3) Slightly stronger lines
      const maxD2 = maxDist * maxDist
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < maxD2) {
            const t = 1 - d2 / maxD2
            ctx.strokeStyle = `hsl(${accentHue} 70% 40% / ${0.12 + 0.30 * t})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }
    }

    let last = performance.now()
    function tick(now: number) {
      if (paused) return
      const dt = Math.min(32, now - last)
      last = now
      step(dt * 0.06)
      draw()
      animId = requestAnimationFrame(tick)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(document.documentElement)

    const onVis = () => {
      paused = document.hidden
      if (!paused) {
        last = performance.now()
        animId = requestAnimationFrame(tick)
      } else {
        cancelAnimationFrame(animId)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    animId = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      cancelAnimationFrame(animId)
    }
  }, [density, hue, respectReducedMotion])

  return (
    <canvas
      ref={ref}
      aria-hidden
      // ↓ z-0 instead of -z-10 so it isn't behind the body background
      className="pointer-events-none fixed inset-0 z-0"
    />
  )
}
