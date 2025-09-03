export const PRIMARY_CATEGORIES = [
  "faith",
  "life",
  "fitness",
  "relationships",
  "work",
  "technology",
  "travel",
  "economics",
  "civics",
  "projects",
  "research",
  "other",
] as const;

export type PrimaryCategory = typeof PRIMARY_CATEGORIES[number];

export const BUCKET_LABEL: Record<PrimaryCategory, string> = {
  faith: "Faith",
  life: "Life",
  fitness: "Fitness",
  relationships: "Relationships",
  work: "Work",
  technology: "Technology",
  travel: "Travel",
  economics: "Economics",
  civics: "Civics",
  projects: "Projects",
  research: "Research",
  other: "Other",
};

// Curated set for the Blog
export const BLOG_BUCKETS: PrimaryCategory[] = [
  "faith",
  "life",
  "fitness",
  "relationships",
  "work",
  "technology",
  "travel",
  "economics",
  "civics",
  "other",
];

// Short explanations for tooltips (Blog grid uses this)
export const BLOG_CATEGORY_INFO: Record<
  (typeof BLOG_BUCKETS)[number],
  { label: string; description: string }
> = {
  faith: { label: "Faith", description: "Devotionals, testimony, and spiritual notes." },
  life: { label: "Life", description: "Personal reflections and day-to-day lessons." },
  fitness: { label: "Fitness", description: "Training logs, health habits, and nutrition." },
  relationships: { label: "Relationships", description: "Marriage, friendship, and family dynamics." },
  work: { label: "Work", description: "Professional craft, process, and career notes." },
  technology: { label: "Technology", description: "Code, tools, Unity, Next.js, dashboards." },
  travel: { label: "Travel", description: "Trips, itineraries, and field notes." },
  economics: { label: "Economics", description: "Macro views, markets, and cycles." },
  civics: { label: "Civics", description: "Policy, culture, and free-speech oriented takes." },
  projects: { label: "Projects", description: "Project case studies and app development." },
  research: { label: "Research", description: "Research briefings, notes, and comparisons." },
  other: { label: "Other", description: "Uncategorized or cross-topic posts." },
};

export const TAG_MAP: Record<PrimaryCategory, string[]> = {
  faith: ["faith", "spiritual", "christianity", "devotional"],
  life: ["life", "reflection", "personal", "family"],
  fitness: ["fitness", "training", "workout", "nutrition", "health"],
  relationships: ["relationships", "marriage", "friendship", "dating"],
  work: ["work", "career", "day-job", "marketing", "sales", "rfp", "proposal", "leadership"],
  technology: ["tech", "technology", "next.js", "mdx", "unity", "shader", "supabase", "vercel", "typescript"],
  travel: ["travel", "trip", "itinerary"],
  economics: ["economics", "macro", "markets", "investing", "crypto", "bitcoin", "finance"],
  civics: ["politics", "policy", "election", "civic", "civics", "freedom", "society"],
  projects: ["project", "case-study", "app"],
  research: ["research", "briefing", "notes", "comparison"],
  other: [],
};

export function inferFromTags(tags?: string[]): PrimaryCategory {
  const t = (tags ?? []).map((s) => s.toLowerCase());
  for (const key of PRIMARY_CATEGORIES) if (TAG_MAP[key].some((tag) => t.includes(tag))) return key;
  return "other";
}
