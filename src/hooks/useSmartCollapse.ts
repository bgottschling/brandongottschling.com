"use client";

import * as React from "react";

/** simple hook to read a media query (SSR-safe) */
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}

/**
 * Mobile header collapse with hysteresis + RAF throttle.
 * - collapse after scrolling down MIN_DOWN px
 * - expand after scrolling up   MIN_UP   px
 * - manual toggle locks state for LOCK_MS to avoid ping-pong
 */
export function useSmartCollapse({
  minDown = 64,
  minUp = 48,
  lockMs = 600,
}: { minDown?: number; minUp?: number; lockMs?: number } = {}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [collapsed, setCollapsed] = React.useState(false);

  const lastY = React.useRef(0);
  const accDown = React.useRef(0);
  const accUp = React.useRef(0);
  const raf = React.useRef<number | null>(null);
  const lockedUntil = React.useRef<number>(0);

  React.useEffect(() => {
    if (!isMobile) {
      setCollapsed(false);
      return;
    }
    lastY.current = window.scrollY || 0;
    accDown.current = 0;
    accUp.current = 0;

    const onScroll = () => {
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const now = Date.now();
        if (now < lockedUntil.current) return;

        const y = window.scrollY || 0;
        const delta = y - lastY.current;
        lastY.current = y;

        if (delta > 0) {         // scrolling down
          accDown.current += delta;
          accUp.current = 0;
          if (!collapsed && accDown.current >= minDown) {
            setCollapsed(true);
            accDown.current = 0;
          }
        } else if (delta < 0) {  // scrolling up
          accUp.current += -delta;
          accDown.current = 0;
          if (collapsed && accUp.current >= minUp) {
            setCollapsed(false);
            accUp.current = 0;
          }
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [isMobile, minDown, minUp]);

  const toggle = React.useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    lockedUntil.current = Date.now() + lockMs;
  }, [collapsed, lockMs]);

  return { collapsed, toggle, isMobile };
}
