// src/components/ThemeSync.tsx
"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Invisible component that sets `data-theme` on <html>
 * based on the current route prefix. CSS @property transitions
 * handle the smooth accent-color crossfade.
 */
const ROUTE_THEME: [string, string][] = [
  ["/blog", "blog"],
  ["/projects", "project"],
  ["/research", "research"],
];

export default function ThemeSync() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const match = ROUTE_THEME.find(([prefix]) => pathname.startsWith(prefix));
    const el = document.documentElement;

    if (match) {
      el.setAttribute("data-theme", match[1]);
    } else {
      el.removeAttribute("data-theme");
    }
  }, [pathname]);

  return null;
}
