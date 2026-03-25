/**
 * Per-content-type color palettes for canvas thumbnails.
 */

export type ContentTheme = {
  name: string;
  hue: number;
  /** Sky gradient: [top, bottom] */
  sky: [string, string];
  /** Ridge fill colors per layer, back-to-front. Each is [topRGBA, bottomRGBA]. */
  ridgeFills: [string, string][];
  /** Ridge stroke RGBA per layer, back-to-front. */
  ridgeStrokes: string[];
  /** Horizon glow color (radial gradient center). */
  glow: string;
};

const blogTheme: ContentTheme = {
  name: "blog",
  hue: 38,
  sky: ["rgb(255,248,235)", "rgb(245,222,179)"],
  ridgeFills: [
    ["rgba(217,170,100,0.12)", "rgba(200,140,60,0.18)"],
    ["rgba(210,155,70,0.18)", "rgba(190,120,45,0.25)"],
    ["rgba(200,140,50,0.25)", "rgba(180,100,30,0.35)"],
    ["rgba(185,120,40,0.35)", "rgba(160,80,20,0.50)"],
  ],
  ridgeStrokes: [
    "rgba(200,160,80,0.15)",
    "rgba(190,140,60,0.25)",
    "rgba(180,120,40,0.40)",
    "rgba(170,100,30,0.55)",
  ],
  glow: "rgba(255,200,100,0.12)",
};

const projectTheme: ContentTheme = {
  name: "project",
  hue: 210,
  sky: ["rgb(235,245,255)", "rgb(190,215,240)"],
  ridgeFills: [
    ["rgba(100,150,200,0.12)", "rgba(70,130,190,0.18)"],
    ["rgba(80,140,195,0.18)", "rgba(55,115,180,0.25)"],
    ["rgba(60,125,185,0.25)", "rgba(40,100,170,0.35)"],
    ["rgba(45,110,175,0.35)", "rgba(25,80,150,0.50)"],
  ],
  ridgeStrokes: [
    "rgba(100,160,210,0.15)",
    "rgba(80,140,200,0.25)",
    "rgba(60,120,190,0.40)",
    "rgba(40,100,180,0.55)",
  ],
  glow: "rgba(130,190,255,0.12)",
};

const researchTheme: ContentTheme = {
  name: "research",
  hue: 165,
  sky: ["rgb(235,250,248)", "rgb(190,230,220)"],
  ridgeFills: [
    ["rgba(80,170,150,0.12)", "rgba(60,150,130,0.18)"],
    ["rgba(65,160,140,0.18)", "rgba(45,140,120,0.25)"],
    ["rgba(50,145,125,0.25)", "rgba(30,120,100,0.35)"],
    ["rgba(35,130,110,0.35)", "rgba(15,100,80,0.50)"],
  ],
  ridgeStrokes: [
    "rgba(80,180,160,0.15)",
    "rgba(60,160,140,0.25)",
    "rgba(40,140,120,0.40)",
    "rgba(20,120,100,0.55)",
  ],
  glow: "rgba(100,210,190,0.12)",
};

const themes: Record<string, ContentTheme> = {
  blog: blogTheme,
  project: projectTheme,
  research: researchTheme,
};

export function getContentTheme(
  type?: "blog" | "project" | "research" | string
): ContentTheme {
  return themes[type ?? "blog"] ?? blogTheme;
}
