import Image, { StaticImageData } from "next/image";

type Brand = {
  name: string;
  src?: string | StaticImageData;
  initials?: string;
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
  mono = false,            // full color by default
  autoDarkInvert = false,  // no invert by default
  bordered = true,
  priority = false,
  className,
}: {
  brands: Brand[];
  mono?: boolean;
  autoDarkInvert?: boolean;
  bordered?: boolean;
  priority?: boolean;
  className?: string;      // to set responsive size vars from parent
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      <span className="uppercase tracking-wide text-xs text-zinc-500">
        Trusted by teams at:
      </span>

      {brands.map((b) => {
        const svg = isSvg(b.src as any);
        const useMono = b.mono ?? mono;
        const useInvert = b.invertDark ?? autoDarkInvert;
        const allowFilters = svg ? !!b.filtersOnSvg : true;

        const filters = [
          allowFilters && useMono ? "grayscale" : "",
          allowFilters && useInvert ? "dark:invert" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={b.name}
            className={[
              "relative flex items-center justify-center rounded-xl",
              bordered ? "border border-black/10 bg-white/70 dark:border-white/10 dark:bg-zinc-900/60" : "",
            ].join(" ")}
            style={{
              // Size via CSS vars (set on parent with Tailwind arbitrary properties)
              width: "var(--bb-w, 128px)",
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
                className={`object-contain p-2 ${filters}`.trim()}
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
  );
}
