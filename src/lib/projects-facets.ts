export const PROJECT_STAGES = [
  "idea",
  "prototype",
  "beta",
  "live",
  "archived",
] as const;

export type ProjectStage = typeof PROJECT_STAGES[number];

export const PROJECT_STAGE_INFO: Record<ProjectStage, { label: string; description: string }> = {
  idea: { label: "Idea", description: "Concepts and early exploration." },
  prototype: { label: "Prototype", description: "Working demos and MVPs in progress." },
  beta: { label: "Beta", description: "Feature-complete but not final." },
  live: { label: "Live", description: "Shipped and in use." },
  archived: { label: "Archived", description: "Paused or retired." },
};

// Optional: map free-form status/tags into a stage
export function inferStageFromMeta(status?: string, tags?: string[]): ProjectStage {
  const s = (status ?? "").toLowerCase();
  const t = new Set((tags ?? []).map((x) => x.toLowerCase()));

  if (/(live|launched|prod|production|public)/.test(s) || t.has("live")) return "live";
  if (/(beta)/.test(s) || t.has("beta")) return "beta";
  if (/(proto|prototype|wip|in[-\s]?progress|alpha)/.test(s) || t.has("prototype") || t.has("alpha") || t.has("wip"))
    return "prototype";
  if (/(idea|concept|spec)/.test(s) || t.has("idea")) return "idea";
  if (/(archived|retired|abandoned)/.test(s) || t.has("archived")) return "archived";

  // Default if unknown
  return "prototype";
}
