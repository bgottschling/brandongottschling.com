// next.config.ts
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  transpilePackages: ["framer-motion"],

  /* Pin the workspace root so git worktrees (which carry their own lockfile
     and node_modules) don't resolve modules against the parent checkout. */
  turbopack: { root: process.cwd() },

  /* Hide "X-Powered-By: Next.js" — minor security hygiene */
  poweredByHeader: false,

  /* Serve AVIF (smaller) before WebP for next/image */
  images: { formats: ["image/avif", "image/webp"] },

  /* Allow preview tools to reach /_next/* without cross-origin warnings */
  allowedDevOrigins: ["127.0.0.1"],

  async headers() {
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: https:",
      `script-src 'self' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : "'unsafe-inline'"}`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://brandongottschling.com https://www.brandongottschling.com",
      // If you later register a service worker, you can add: "worker-src 'self'"
    ].join("; ");

    return [
      // Global security headers (you already had these)
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Hard noindex for APIs
      {
        source: "/api/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      // Hard noindex for private card area
      {
        source: "/card(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
