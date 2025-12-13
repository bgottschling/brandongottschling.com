// src/components/mission-card.tsx
export default function MissionCard() {
  return (
    <section
      className="not-prose my-8 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)]
                 ring-1 ring-inset ring-amber-100/80 dark:border-white/10 dark:bg-zinc-900 dark:ring-white/10"
    >
      {/* Accent header (mirrors FancyCard summary band) */}
      <div
        className="rounded-t-2xl border-b border-black/5 bg-gradient-to-r from-amber-50/85 via-amber-50 to-amber-100/80 px-4 py-2
                   dark:border-white/10 dark:from-amber-200/10 dark:via-amber-200/10 dark:to-amber-200/10"
      >
        <h2 className="m-0 text-sm font-semibold tracking-tight text-amber-900 dark:text-amber-300">
          Mission
        </h2>
      </div>

      <div className="px-5 py-4">
        <p className="m-0 text-[15px] leading-7 text-neutral-800 dark:text-neutral-100/90">
          Build useful things, tell honest stories, and show up for people. Share what I’m
          learning so others can move with more courage, clarity, and hope.
        </p>
        <p className="mt-3 text-[15px] leading-7 text-neutral-800 dark:text-neutral-100/90">
          I want this work to be more than output. I’m learning to be the kind of person who
          shows up, steady at home and useful in the world. That looks like working hard, seeking
          peace, and making things that genuinely help.
        </p>
      </div>
    </section>
  );
}
