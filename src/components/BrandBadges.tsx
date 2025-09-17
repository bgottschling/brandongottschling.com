// src/components/BrandBadges.tsx
import Image from "next/image";

type Brand = {
  name: string;
  src?: string;      // e.g., "/logos/wbd.svg"
  initials?: string; // fallback if no src
};

export default function BrandBadges({
  brands,
  tone = "auto",
}: {
  brands: Brand[];
  tone?: "auto" | "light" | "dark";
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="uppercase tracking-wide text-xs text-zinc-500">Trusted by teams at:</span>
      {brands.map((b) => (
        <div
          key={b.name}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/70 px-3 py-2
                     dark:border-white/10 dark:bg-zinc-900/60"
          style={{ height: 36 }}
          title={b.name}
          aria-label={b.name}
        >
          {b.src ? (
            <Image
              src={b.src}
              alt={b.name}
              width={80}
              height={20}
              className={`object-contain ${tone === "dark" ? "invert" : tone === "light" ? "" : "dark:invert"}`}
              priority
            />
          ) : (
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {b.initials ?? b.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
