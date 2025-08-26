import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { PluggableList } from 'unified'

export type MdxSerializeOptions = {
  mdxOptions?: {
    remarkPlugins?: PluggableList
    rehypePlugins?: PluggableList
  }
  scope?: Record<string, unknown>
}

export const mdxRemoteOptions: MdxSerializeOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
}