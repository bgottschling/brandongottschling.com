import { getAllContent } from '@/lib/content'
import Link from 'next/link'

export default async function BlogIndex() {
  const items = (await getAllContent()).filter((p) => p.type === 'research' && !p.draft)
  return (
    <div>
      <h1>Research</h1>
      <ul>
        {items.map((p) => (
          <li key={p.slug}>
            <Link href={`/${p.slug}`}>{p.title}</Link>{' '}
            {p.summary ? <span className="text-sm opacity-70">— {p.summary}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}