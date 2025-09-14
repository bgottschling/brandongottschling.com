// src/lib/content.ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { inferFromTags, type PrimaryCategory } from "./buckets";

export type ContentMeta = {
  title: string;
  date?: string;
  summary?: string;
  status?: string;
  stage?: string;
  tags?: string[];
  /** Accepted content collections */
  type?: "blog" | "research" | "project" | "page" | "now";
  draft?: boolean;
  collection?: string;
  seeAlso?: string[];
  slug: string;
  filepath: string;
  image?: string;

  /** Preferred bucket for UI. */
  primaryCategory?: PrimaryCategory;

  /** Publish switch (defaults to true if absent). */
  published?: boolean;
};

// ------------------------------
// Collection/type detection
// ------------------------------
const KNOWN_TYPES = ["blog", "research", "project", "page", "now"] as const;
type KnownType = (typeof KNOWN_TYPES)[number];

function detectTypeFromSlug(rel: string): KnownType {
  const head = rel.split("/")[0] || "";
  return (KNOWN_TYPES as readonly string[]).includes(head) ? (head as KnownType) : "blog";
}

// ------------------------------
// Content roots
// ------------------------------
// support /content, /src/content, or CONTENT_DIR
const CANDIDATE_DIRS = [
  path.join(process.cwd(), "content"),
  path.join(process.cwd(), "src", "content"),
];
const ENV_DIR = process.env.CONTENT_DIR;
if (ENV_DIR) CANDIDATE_DIRS.unshift(path.join(process.cwd(), ENV_DIR));

async function firstExistingDir(): Promise<string | null> {
  for (const dir of CANDIDATE_DIRS) {
    try {
      const st = await fs.stat(dir);
      if (st.isDirectory()) return dir;
    } catch {}
  }
  return null;
}

// ------------------------------
// Date helpers
// ------------------------------
function toMs(d: unknown): number {
  if (!d) return 0;
  if (d instanceof Date) return d.getTime() || 0;
  if (typeof d === "number") return Number.isFinite(d) ? d : 0;
  if (typeof d === "string") {
    const t = Date.parse(d);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}
function toIso(d: unknown): string | undefined {
  const ms = toMs(d);
  return ms ? new Date(ms).toISOString() : undefined;
}

function devWarn(msg: string) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(msg);
  }
}

// ------------------------------
// Load all content
// ------------------------------
export async function getAllContent(): Promise<ContentMeta[]> {
  const base = await firstExistingDir();
  if (!base) return [];

  const files = await walk(base);
  const mdx = files.filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  const items: ContentMeta[] = [];

  for (const file of mdx) {
    const raw = await fs.readFile(file, "utf8");
    const { data } = matter(raw);
    if (!data?.title) continue;

    const rel = path
      .relative(base, file)
      .replace(/\\/g, "/")
      .replace(/\.(mdx|md)$/, "");

    // Accept both `type` and `collection`; fall back to slug detection
    const frontType = (data.type ?? data.collection) as ContentMeta["type"] | undefined;
    const resolvedType: KnownType = (frontType as KnownType | undefined) ?? detectTypeFromSlug(rel);

    const primaryCategory =
      (data.primaryCategory as PrimaryCategory | undefined) ?? inferFromTags(data.tags);
    if (!data.primaryCategory)
      devWarn(`⚠ content: missing primaryCategory → inferred "${primaryCategory}" (${rel})`);

    const published = data.published === undefined ? true : Boolean(data.published);

    items.push({
      title: String(data.title),
      date: toIso(data.date),
      summary: data.summary,
      status: data.status,
      stage: data.stage,
      tags: data.tags ?? [],
      type: resolvedType,
      draft: Boolean(data.draft),
      seeAlso: data.seeAlso ?? [],
      slug: rel,
      filepath: file,
      image: typeof data.image === "string" ? data.image : undefined,
      primaryCategory,
      published,
    });
  }

  return items.sort((a, b) => toMs(b.date) - toMs(a.date));
}

// ------------------------------
// Load a single entry by slug
// ------------------------------
export async function getBySlug(
  slug: string
): Promise<{ meta: ContentMeta; source: string } | null> {
  const base = await firstExistingDir();
  if (!base) return null;

  const candidates = [path.join(base, `${slug}.mdx`), path.join(base, `${slug}.md`)];
  for (const file of candidates) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const { data, content } = matter(raw);

      const frontType = (data.type ?? data.collection) as ContentMeta["type"] | undefined;
      const resolvedType: KnownType =
        (frontType as KnownType | undefined) ?? detectTypeFromSlug(slug);

      const primaryCategory =
        (data.primaryCategory as PrimaryCategory | undefined) ?? inferFromTags(data.tags);
      if (!data.primaryCategory)
        devWarn(`⚠ content: missing primaryCategory in getBySlug → inferred "${primaryCategory}" (${slug})`);

      const published = data.published === undefined ? true : Boolean(data.published);

      const meta: ContentMeta = {
        title: String(data.title ?? slug.split("/").pop()),
        date: toIso(data.date),
        summary: data.summary,
        tags: data.tags ?? [],
        type: resolvedType,
        draft: Boolean(data.draft),
        seeAlso: data.seeAlso ?? [],
        slug,
        filepath: file,
        image: typeof data.image === "string" ? data.image : undefined,
        primaryCategory,
        published,
      };
      return { meta, source: content };
    } catch {
      // try next candidate
    }
  }
  return null;
}

// ------------------------------
// Walk directory tree
// ------------------------------
async function walk(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (d) => {
      const res = path.resolve(dir, d.name);
      return d.isDirectory() ? await walk(res) : res;
    })
  );
  return files.flat();
}

// ------------------------------
// Visibility helper
// ------------------------------
export function filterVisible(items: ContentMeta[]) {
  const now = Date.now();
  return items
    .filter((i) => !i.draft)
    .filter((i) => i.published !== false)
    .filter((i) => !i.date || toMs(i.date) <= now);
}
