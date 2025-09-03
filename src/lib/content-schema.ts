import { z } from "zod";
import { PRIMARY_CATEGORIES } from "./buckets";

export const blogFrontmatter = z.object({
  collection: z.literal("blog").or(z.undefined()), // tolerate missing; collection/type is normalized at runtime
  title: z.string().min(3),
  slug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string().min(10),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  primaryCategory: z.enum(PRIMARY_CATEGORIES), // REQUIRED
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatter>;