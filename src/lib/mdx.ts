import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { PluggableList } from "unified";

import { remarkMermaid } from "@theguild/remark-mermaid";

export type MdxSerializeOptions = {
  mdxOptions?: {
    remarkPlugins?: PluggableList;
    rehypePlugins?: PluggableList;
  };
  scope?: Record<string, unknown>;
};

export const mdxRemoteOptions: MdxSerializeOptions = {
  mdxOptions: {
    // Order: GFM first, then Mermaid is usually safe
    remarkPlugins: [remarkGfm, remarkMermaid],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
};