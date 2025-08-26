import Link from 'next/link'
import { Card, CardBody } from './card'
import Thumb from './thumb'
import type { ContentMeta } from '@/lib/content'

export default function ItemCard({ item }: { item: ContentMeta }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <Link href={`/${item.slug}`} aria-label={item.title}>
        <Thumb title={item.title} slug={item.slug} image={item.image} />
      </Link>
      <CardBody>
        <h3 className="m-0 text-base font-semibold">
          <Link href={`/${item.slug}`} className="hover:underline underline-offset-4">
            {item.title}
          </Link>
        </h3>
        {item.summary && <p className="m-0 mt-1 text-sm text-zinc-600">{item.summary}</p>}
        {item.date && (
          <p className="m-0 mt-2 text-xs text-zinc-500">
            {new Date(item.date).toLocaleDateString()}
          </p>
        )}
      </CardBody>
    </Card>
  )
}