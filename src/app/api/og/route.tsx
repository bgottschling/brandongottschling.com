// app/api/og/route.tsx
import { ImageResponse } from "next/og";
import React from "react";
export const runtime = "edge";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "brandongottschling.com").slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "#111111",
          color: "white",
          padding: "64px",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 60
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 960 }}>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 28, opacity: 0.9 }}>
            Research · Unity · Crypto · Projects
          </div>
        </div>
        {/* Right: gradient flame mark */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 24,
            border: "6px solid transparent",
            background:
              "conic-gradient(from 180deg at 50% 50%, #ffffff, #f59f0a)",
            WebkitMask:
              "url(/flame-gradient-stroke.svg) center/contain no-repeat",
            mask: "url(/flame-gradient-stroke.svg) center/contain no-repeat",
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
