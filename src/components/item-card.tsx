// src/components/item-card.tsx (or wherever your card lives)
import Link from 'next/link'
import type { ContentMeta } from '@/lib/content'

export default function ItemCard({ item }: { item: ContentMeta }) {
  return (
    <article className="not-prose rounded-xl border border-black/5 p-4 shadow-soft bg-white dark:bg-zinc-900">
      <header className="mb-2 flex items-center justify-between gap-3">
        <h3 className="m-0 text-base font-semibold">
          <Link href={`/${item.slug}`} className="hover:underline">
            {item.title}
          </Link>
        </h3>
        {item.status && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
            {item.status}
          </span>
        )}
      </header>
      {item.summary && <p className="m-0 text-sm text-zinc-600 dark:text-zinc-300">{item.summary}</p>}
      <footer className="mt-3 text-xs text-zinc-500">
        {item.date && <time dateTime={item.date}>{new Date(item.date).toLocaleDateString()}</time>}
      </footer>
    </article>
  )
}
