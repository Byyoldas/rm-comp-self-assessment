import type { Lang, Level } from "../../../shared/types";

export const LEVELS: Level[] = ["Foundational", "Intermediate", "Advanced", "Expert"];

export const LEVEL_BG: Record<Level, string> = {
  Foundational: "bg-slate-200 text-slate-700",
  Intermediate: "bg-sky-200 text-sky-800",
  Advanced: "bg-indigo-300 text-indigo-900",
  Expert: "bg-brand-600 text-white",
};

export const LEVEL_SOLID: Record<Level, string> = {
  Foundational: "#cbd5e1",
  Intermediate: "#7dd3fc",
  Advanced: "#a5b4fc",
  Expert: "#4f46e5",
};

export const LEVEL_INDEX: Record<Level, number> = { Foundational: 0, Intermediate: 1, Advanced: 2, Expert: 3 };

export function levelBadgeClass(level: Level | null): string {
  if (!level) return "bg-white text-slate-400 border border-dashed border-slate-300";
  return LEVEL_BG[level];
}

const LEVEL_LABEL_TR: Record<Level, string> = { Foundational: "Temel", Intermediate: "Orta", Advanced: "İleri", Expert: "Uzman" };

/** Level enum values stay canonical English everywhere internally (comparisons, form values); only display swaps. */
export function levelLabel(level: Level, lang: Lang): string {
  return lang === "tr" ? LEVEL_LABEL_TR[level] : level;
}
