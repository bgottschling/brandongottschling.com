"use client";
import * as React from "react";
export function useHeaderOffset() {
  const [top, setTop] = React.useState(0);
  React.useEffect(() => {
    const header = document.querySelector("header.sticky") as HTMLElement | null;
    if (!header) return;
    const update = () => setTop(header.getBoundingClientRect().height || 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    addEventListener("resize", update);
    return () => { ro.disconnect(); removeEventListener("resize", update); };
  }, []);
  return top;
}
