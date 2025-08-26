'use client'
export default function ContentScrim() {
  return (
    <div
      aria-hidden
      className={[
        // fixed, above canvas, below content
        'pointer-events-none fixed inset-x-0 top-0 z-10',
        // height just enough to cover hero + first cards
        'h-[42vh] min-h-[300px]',
        // soft vertical gradient; tune stops to taste
        'bg-gradient-to-b from-white via-white/95 to-white/0',
        'dark:from-zinc-950 dark:via-zinc-950/95 dark:to-transparent',
      ].join(' ')}
    />
  )
}
