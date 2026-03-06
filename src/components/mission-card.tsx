// src/components/mission-card.tsx
export default function MissionCard() {
  return (
    <section
      className="not-prose my-8 overflow-hidden rounded-md border border-black/5 bg-white shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)]
                 dark:border-white/10 dark:bg-zinc-900"
    >
      {/* Accent header stripe */}
      <div
        className="border-b border-amber-200/60 bg-amber-50/80 px-5 py-2
                   dark:border-amber-400/15 dark:bg-amber-900/20"
      >
        <h2 className="m-0 text-sm font-semibold tracking-tight text-amber-900 dark:text-amber-300">
          Mission
        </h2>
      </div>

      <div className="px-5 py-4">
        <p className="m-0 text-[15px] leading-7 text-neutral-800 dark:text-neutral-100/90">
          Build useful things, tell honest stories, and show up for people. Share what I&apos;m
          learning so others can move with more courage, clarity, and hope.
        </p>
        <p className="mt-3 text-[15px] leading-7 text-neutral-800 dark:text-neutral-100/90">
          I want this work to be more than output. I&apos;m learning to be the kind of person who
          shows up, steady at home and useful in the world. That looks like working hard, seeking
          peace, and making things that genuinely help.
        </p>
      </div>
    </section>
  );
}
