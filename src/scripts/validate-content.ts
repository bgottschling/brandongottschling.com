import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { blogFrontmatter } from "@/lib/content-schema";

const ROOT = process.cwd();
const BLOG_DIRS = [
  path.join(ROOT, "content", "blog"),
  path.join(ROOT, "src", "content", "blog"),
];

function list(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...list(full));
    else if (ent.isFile() && (full.endsWith(".mdx") || full.endsWith(".md"))) out.push(full);
  }
  return out;
}

let errors = 0;
for (const dir of BLOG_DIRS) {
  for (const file of list(dir)) {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    // Keystatic writes dates unquoted (YAML parses them as Date) and derives the
    // slug from the filename instead of frontmatter — normalize both before validating.
    const date =
      data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
    const slug = data.slug ?? path.basename(file).replace(/\.(mdx|md)$/, "");
    const res = blogFrontmatter.safeParse({
      ...data,
      date,
      slug,
      collection: data.collection ?? "blog",
    });
    if (!res.success) {
      console.error("❌ Frontmatter error:", path.relative(ROOT, file));
      console.error(JSON.stringify(res.error.format(), null, 2));
      errors++;
    }
  }
}

if (errors) {
  console.error(`\n${errors} file(s) failed frontmatter validation`);
  process.exit(1);
} else {
  console.log("✅ All blog frontmatter validated");
}