export const RESEARCH_AREAS = [
  "macro",
  "tech",
  "unity",
  "design",
  "faithphilo",
  "other",
] as const;

export type ResearchArea = typeof RESEARCH_AREAS[number];

export const RESEARCH_AREA_INFO: Record<ResearchArea, { label: string; description: string }> = {
  macro: { label: "Macro & Markets", description: "Economy, cycles, crypto, and market structure." },
  tech: { label: "Technology & Tools", description: "Next.js, MDX, Supabase, infra & workflows." },
  unity: { label: "Unity / Game", description: "Gameplay, shaders, tooling, Subject 33." },
  design: { label: "Design & UX", description: "Interfaces, content patterns, systems." },
  faithphilo: { label: "Faith & Philosophy", description: "Spiritual notes, worldview, first principles." },
  other: { label: "Other", description: "Topics that don’t fit elsewhere—yet." },
};

const TAGS: Record<ResearchArea, string[]> = {
  macro: ["macro", "economics", "finance", "markets", "investing", "crypto", "bitcoin"],
  tech: ["tech", "technology", "next.js", "nextjs", "mdx", "supabase", "typescript", "vercel", "tailwind"],
  unity: ["unity", "shader", "game", "gamedev", "subject33"],
  design: ["design", "ux", "ui", "content", "product"],
  faithphilo: ["faith", "spiritual", "philosophy"],
  other: [],
};

export function inferAreaFromTags(tags?: string[]): ResearchArea {
  const t = (tags ?? []).map((s) => s.toLowerCase());
  for (const key of RESEARCH_AREAS) {
    if (TAGS[key].some((tag) => t.includes(tag))) return key;
  }
  return "other";
}
