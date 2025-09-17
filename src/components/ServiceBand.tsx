import Link from "next/link";

export type Service = {
  id: string;
  title: string;
  price: string;
  blurb: string;
  bullets?: string[];
};

export default function ServiceBand({ service }: { service: Service }) {
  return (
    <details
      className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm
                 ring-1 ring-inset ring-amber-100/80 open:shadow-md
                 dark:border-white/10 dark:bg-zinc-900 dark:ring-white/10"
    >
      <summary className="list-none cursor-pointer select-none">
        {/* 3-column grid keeps price pinned right; larger tap area */}
        <div
          className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-t-2xl border-b border-black/5
                     bg-gradient-to-r from-amber-50/85 via-amber-50 to-amber-100/80 px-4 py-3
                     text-sm md:text-base
                     dark:border-white/10 dark:from-amber-200/10 dark:via-amber-200/10 dark:to-amber-200/10"
        >
          {/* Title + blurb */}
          <div className="min-w-0">
            <h3 className="m-0 truncate text-[1.05rem] md:text-[1.1rem] font-semibold leading-snug tracking-tight">
              {service.title}
            </h3>
            <p className="m-0 truncate text-neutral-700 dark:text-neutral-300">
              {service.blurb}
            </p>
          </div>

          {/* Price pinned right, never wraps into chevron column */}
          <div className="shrink-0 text-right leading-tight">
            <div className="text-[11px] md:text-xs text-neutral-500 dark:text-neutral-400">Typical</div>
            <div className="text-sm md:text-[0.95rem] font-medium">{service.price}</div>
          </div>

          {/* Chevron: bigger, obvious, 44px minimum tap area via padding */}
          <span
            aria-hidden
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-md border border-amber-200 text-base
                       transition-transform group-open:rotate-180 dark:border-white/10"
          >
            ▾
          </span>
        </div>
      </summary>

      {/* Body */}
      <div className="px-5 pb-4 pt-3">
        {service.bullets?.length ? (
          <ul className="mt-1 list-disc list-inside text-sm md:text-[0.95rem] text-neutral-800 dark:text-neutral-100/90">
            {service.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
            ☑ Included in pilot scoping
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
            À la carte deliverables available
          </span>
          <Link
            href="/services"
            className="inline-flex items-center rounded-md border px-2 py-1 text-xs hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-zinc-900/40"
          >
            View details
          </Link>
        </div>
      </div>
    </details>
  );
}
