import { getAllContent, getBySlug, type ContentMeta } from '@/lib/content'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { mdxRemoteOptions } from '@/lib/mdx'
import { mdxComponents } from '@/components/mdx-components'

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const all = await getAllContent()
  return all.map((p: ContentMeta) => ({ slug: p.slug.split('/') }))
}

export default async function ContentPage({ params }: { params: { slug: string[] } }) {
  const { slug } = await params                         // <- await before using
  const joined = slug.join('/')
  const entry = await getBySlug(joined)
  if (!entry || entry.meta.draft) return <div>Not found.</div>

  const { meta, source } = entry

  console.log(mdxComponents);
  return (
    <article>
      <h1>{meta.title}</h1>
      {meta.summary && <p className="lead">{meta.summary}</p>}
      <MDXRemote
        source={source}
        options={mdxRemoteOptions}
        // one-time widen: element-keyed map -> generic MDX map
        components={mdxComponents as unknown as Record<string, React.ComponentType>}
      />
    </article>
  )
}
