export type BasicMeta = {
  title?: string;
  summary?: string;
  date?: string;
  updated?: string;
  slug?: string;
  tags?: string[];
  collection?: string; // e.g. "blog" | "projects"
};

export function makeUrl(origin: string, slug: string) {
  const base = origin.replace(/\/+$/, "");
  const path = slug.startsWith("/") ? slug : `/${slug}`;
  return `${base}${path}`;
}

export function articleJsonLd(meta: BasicMeta, url: string) {
  const published = meta.date || new Date().toISOString();
  const modified = meta.updated || meta.date || published;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title || "Untitled",
    description: meta.summary || "",
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Person", name: "Brandon Gottschling" },
    url,
    inLanguage: "en",
  };
}

export function collectionPageJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function creativeWorkJsonLd(meta: BasicMeta, url: string) {
  const modified = meta.updated || meta.date || new Date().toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: meta.title || "Untitled",
    description: meta.summary || "",
    url,
    dateModified: modified,
    author: { "@type": "Person", name: "Brandon Gottschling" },
    keywords: (meta.tags || []).join(", "),
    inLanguage: "en",
  };
}
