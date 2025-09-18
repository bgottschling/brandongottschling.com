import Image, { StaticImageData } from "next/image";

type Brand = {
  name: string;
  src?: string | StaticImageData; // svg/png/webp/jpg or static import
  initials?: string;
  // Per-brand visual tweaks to counter different aspect ratios / baked whitespace:
  pad?: number;   // inner padding in px (default 8)
  scale?: number; // 0.8–1.3 visual scale (default 1)
  align?: "center" | "top" | "bottom"; // default center
  mono?: boolean;        // opt-in grayscale
  invertDark?: boolean;  // opt-in dark-mode invert
  filtersOnSvg?: boolean;// opt-in filters for SVG
};

function isSvg(src?: string | StaticImageData) {
  if (!src || typeof src !== "string") return false;
  const q = src.split("?")[0].toLowerCase();
  return q.endsWith(".svg");
}

export default function BrandBadges({
  brands,
  // Responsive size via CSS vars (override on parent via className if you like)
  className,
  bordered = true,
  priority = false,
  mono = false,
  autoDarkInvert = false,
}: {
  brands: Brand[];
  className?: string;
  bordered?: boolean;
  priority?: boolean;
  mono?: boolean;
  autoDarkInvert?: boolean;
}) {
  return (
    <div className={`not-prose ${className ?? ""}`}>
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
        Trusted by teams at:
      </div>

      {/* Responsive grid keeps the row tidy on mobile */}
      <div
        className="
          grid gap-3
          grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:auto-cols-max md:grid-flow-col
        "
        style={{
          // default sizes; override via parent: [--bb-h:28px] [--bb-w:112px]
          // example: className="[--bb-h:28px] [--bb-w:112px] sm:[--bb-h:32px] sm:[--bb-w:136px]"
          // (Tailwind arbitrary props)
          // @ts-ignore CSS var fallback
          ["--bb-h" as any]: "32px",
          // @ts-ignore
          ["--bb-w" as any]: "136px",
        }}
      >
        {brands.map((b) => {
          const svg = isSvg(b.src as any);
          const allowFilters = svg ? !!b.filtersOnSvg : true;
          const useMono = b.mono ?? mono;
          const useInvert = b.invertDark ?? autoDarkInvert;

          const pad = (b.pad ?? 8) + "px";
          const scale = b.scale ?? 1;
          const align = b.align ?? "center";
          const objectPosition =
            align === "top" ? "center top" : align === "bottom" ? "center bottom" : "center";

          return (
            <div
              key={b.name}
              className={[
                "relative flex items-center justify-center rounded-xl",
                bordered ? "border border-black/10 bg-white/70 dark:border-white/10 dark:bg-zinc-900/60" : "",
              ].join(" ")}
              style={{
                width: "var(--bb-w, 136px)",
                height: "var(--bb-h, 32px)",
              }}
              title={b.name}
              aria-label={b.name}
            >
              {b.src ? (
                <Image
                  src={b.src}
                  alt={b.name}
                  fill
                  sizes="(min-width:768px) 136px, 33vw"
                  className={[
                    "object-contain",
                    allowFilters && useMono ? "grayscale" : "",
                    allowFilters && useInvert ? "dark:invert" : "",
                  ].join(" ")}
                  style={{
                    padding: pad,
                    transform: `scale(${scale})`,
                    transformOrigin: "center",
                    objectPosition,
                  }}
                  priority={priority}
                />
              ) : (
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  {b.initials ?? b.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
