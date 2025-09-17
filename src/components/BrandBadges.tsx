import Image from "next/image";

type Brand = {
  name: string;
  src?: string;          // "/logos/wbd.svg" | "/logos/wbd.png" | "/logos/wbd.webp" | ...
  initials?: string;     // fallback letters if image missing
  mono?: boolean;        // force grayscale/mono for this brand
  invertDark?: boolean;  // force invert in dark mode (useful for dark logos)
  filtersOnSvg?: boolean;// apply filters to SVG too (off by default)
};

function isSvgPath(src?: string) {
  if (!src) return false;
  const q = src.split("?")[0].toLowerCase();
  return q.endsWith(".svg");
}

export default function BrandBadges({
  brands,
  height = 28,      // logo box height (px)
  boxWidth = 120,   // per-badge width for a tidy row
  gap = 12,         // spacing between badges
  mono = true,      // grayscale by default
  autoDarkInvert = true,
  bordered = true,
  priority = false, // set true on homepage
}: {
  brands: Brand[];
  height?: number;
  boxWidth?: number;
  gap?: number;
  mono?: boolean;
  autoDarkInvert?: boolean;
  bordered?: boolean;
  priority?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center" style={{ gap }}>
      <span className="uppercase tracking-wide text-xs text-zinc-500">Trusted by teams at:</span>

      {brands.map((b) => {
        const svg = isSvgPath(b.src);
        const useMono = b.mono ?? mono;
        const useInvert = b.invertDark ?? autoDarkInvert;

        // By default, skip filters on SVG to avoid weird color inversions.
        const applyFilters = svg ? !!b.filtersOnSvg : true;

        const filterClasses = [
          applyFilters && useMono ? "grayscale opacity-90" : "",
          applyFilters && useInvert ? "dark:invert" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={b.name}
            className={[
              "relative overflow-hidden rounded-xl",
              bordered ? "border border-black/10 bg-white/70 dark:border-white/10 dark:bg-zinc-900/60" : "",
            ].join(" ")}
            style={{ width: boxWidth, height }}
            title={b.name}
            aria-label={b.name}
          >
            {b.src ? (
              <div className="absolute inset-0 p-2">
                <div className="relative h-full w-full">
                  <Image
                    src={b.src}
                    alt={b.name}
                    fill
                    sizes={`${boxWidth}px`}
                    className={["object-contain", filterClasses].join(" ")}
                    priority={priority}
                    // Note: Next/Image handles svg/png/webp/jpg seamlessly for local files in /public.
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  {b.initials ?? b.name}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
