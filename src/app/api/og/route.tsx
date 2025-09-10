// app/api/og/route.ts
import { ImageResponse } from "next/og";
export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Brandon Gottschling").slice(0, 120);

  // Use the TRANSPARENT master so there's no visible box
  const flame = new URL("/flame-transparent-4k-4096.png", origin).toString();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "#111111",
          color: "#fff",
          padding: 64,
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 60,
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 880 }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          <div style={{ fontSize: 28, opacity: 0.9 }}>
            Research · Projects · Applications · Crypto
          </div>
        </div>

        {/* Right-side brand mark (bigger) */}
        <div
          style={{
            width: 450,
            height: 450,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // optional: subtle tile so it always looks intentional on any platform UI

            borderRadius: 24
          }}
        >
          <img
            src={flame}
            width={666}
            height={666}
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
