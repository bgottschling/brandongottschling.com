// app/api/og/route.ts
import { ImageResponse } from "next/og";

export const runtime = "edge"; // keep edge for speed (also works in node)

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const title = (searchParams.get("title") ?? "brandongottschling.com").slice(0, 120);

  // Absolute URL to the flame PNG in /public
  const flame = new URL("/flame-master-1024.png", origin).toString();

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

        {/* Right-side brand mark as an <img> */}
        <img
          src={flame}
          width={220}
          height={220}
          style={{
            objectFit: "contain",
            borderRadius: 24,
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
