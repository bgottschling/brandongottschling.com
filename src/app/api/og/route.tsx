// app/api/og/route.ts
import { ImageResponse } from "next/og";

export const runtime = "edge"; // keep edge for speed (also works in node)

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const title = (searchParams.get("title") ?? "brandongottschling.com").slice(0, 120);

  // Absolute URL to the flame PNG in /public
  const flame = new URL("/flame-master-1024.png", origin).toString();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#f59f0a"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
      </defs>
      <g
        id="g1">
        <path
          style="fill:#000000"
          d="M 0,512 C 0,341.33333 0,170.66667 0,0 c 341.33333,0 682.66667,0 1024,0 0,341.33333 0,682.66667 0,1024 -341.33333,0 -682.66667,0 -1024,0 C 0,853.33333 0,682.66667 0,512 Z M 539.51189,744.48777 C 623.494,733.38944 689.96399,640.06204 656.83985,558.08531 638.53075,514.4402 604.18959,469.51816 588.06258,430.53175 c -39.26928,48.79658 5.77536,109.53793 -15.56296,161.436 -37.40399,74.18211 -140.88992,-4.34789 -89.28991,-64.32735 32.87429,-45.19937 79.29011,-91.9011 68.78894,-153.16256 -6.38097,-46.24739 -34.75338,-92.19267 -73.45494,-116.38789 15.96235,48.86283 -2.67844,101.35395 -34.13793,140.35706 -45.77235,57.46466 -101.15437,120.60014 -91.76434,199.86199 5.04285,91.08272 97.90902,161.73345 186.87045,146.17877 z M 492,733.46231 C 408.02134,722.19549 346.71287,633.57998 367.2416,550.89226 c 17.01565,-95.86472 126.33492,-148.63616 129.21227,-249.142 3.92115,-29.26965 44.05496,50.71725 43.12914,72.26407 11.71228,60.11714 -36.71006,103.70744 -67.51644,148.20791 -29.81189,39.7599 -7.74161,108.36072 44.99258,111.49116 52.90811,7.17305 86.80447,-52.89252 72.22142,-99.21869 -9.8167,-24.50868 -8.53015,-109.8453 14.35,-46.50636 33.56138,47.09806 67.37264,107.77965 38.80581,165.71731 C 617.44653,710.79977 552.85937,743.25478 492,733.46231 Z"
          id="path1" />
      </g>
    </svg>`;
const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "#111111",
          color: "white",
          padding: 64,
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 60,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          <div style={{ fontSize: 28, opacity: 0.9 }}>
            Research · Unity · Crypto · Projects
          </div>
        </div>
        <img src={dataUrl} width={220} height={220} />  
        {/* Right-side brand mark as an <img> 
        <img
          src={flame}
          width={220}
          height={220}
          style={{
            objectFit: "contain",
            borderRadius: 24,
          }}
        />*/}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
