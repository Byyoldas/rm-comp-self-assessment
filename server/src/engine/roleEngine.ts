// Turns role-profile answers into per-competency relevance (High/Medium/Low) and
// a starting active-competency set for each assessment mode. Relevance here is an
// application-layer construct (see roleProfiles.json disclaimer) — it decides how
// many questions a competency gets, never whether the RM Comp descriptors apply.
import type { AssessmentMode, Competency, DomainId, Relevance, UserRoleAnswers } from "../../../shared/types.js";
import { allCompetencies, roleProfilesFile } from "../lib/framework.js";

const RELEVANCE_RANK: Record<Relevance, number> = { High: 3, Medium: 2, Low: 1 };
const RANK_TO_RELEVANCE: Relevance[] = ["Low", "Low", "Low", "Medium", "High"]; // index by rounded rank, defensive fallback

function maxRelevance(a: Relevance, b: Relevance): Relevance {
  return RELEVANCE_RANK[a] >= RELEVANCE_RANK[b] ? a : b;
}

export function relevanceForCompetency(competency: Competency, profileIds: string[]): Relevance {
  if (profileIds.length === 0) return "Medium"; // no role info yet: don't under- or over-weight
  let best: Relevance = "Low";
  for (const pid of profileIds) {
    const profile = roleProfilesFile.profiles.find((p) => p.id === pid);
    if (!profile) continue;
    const rel = profile.overrides[competency.id] ?? profile.domainDefaults[competency.domain as DomainId] ?? "Medium";
    best = maxRelevance(best, rel);
  }
  return best;
}

export function relevanceMap(profileIds: string[]): Record<string, Relevance> {
  const map: Record<string, Relevance> = {};
  for (const c of allCompetencies()) map[c.id] = relevanceForCompetency(c, profileIds);
  return map;
}

export function suggestedTargetLevel(profileIds: string[], experienceBand: string) {
  const levels = profileIds
    .map((pid) => roleProfilesFile.profiles.find((p) => p.id === pid)?.targetLevelByExperience[experienceBand])
    .filter(Boolean);
  if (levels.length === 0) return null;
  // Take the most senior suggestion among selected profiles as the starting point;
  // the user still explicitly confirms/overrides this later.
  const order = ["Foundational", "Intermediate", "Advanced", "Expert"];
  return levels.reduce((max, l) => (order.indexOf(l as string) > order.indexOf(max as string) ? l : max));
}

/**
 * Determines which competencies are "active" (get questions at all) for a given
 * assessment mode, given the relevance map. Full mode always includes everything.
 */
export function activeCompetencyIds(
  mode: AssessmentMode,
  relevance: Record<string, Relevance>,
  targetedIds?: string[]
): string[] {
  const all = allCompetencies().map((c) => c.id);
  if (mode === "targeted") return targetedIds && targetedIds.length > 0 ? targetedIds : all;
  if (mode === "full") return all;
  if (mode === "quick") return all.filter((id) => relevance[id] === "High");
  // standard: High + Medium
  return all.filter((id) => relevance[id] === "High" || relevance[id] === "Medium");
}

export function maxQuestionsPerCompetency(mode: AssessmentMode, relevance: Relevance): number {
  const base: Record<AssessmentMode, number> = { quick: 3, standard: 4, full: 5, targeted: 6 };
  const bonus = relevance === "High" ? 1 : relevance === "Low" ? -1 : 0;
  return Math.max(2, base[mode] + bonus);
}

export function defaultRoleAnswers(): Partial<UserRoleAnswers> {
  return { selectedProfileIds: [], targetMode: "current" };
}
