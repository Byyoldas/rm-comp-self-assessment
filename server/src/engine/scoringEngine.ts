// Gap analysis, development recommendations, and final report assembly.
// This is where current-vs-target comparison and priority happens; it never
// reduces anything to a fabricated percentage (see AssessmentReport typing —
// only categorical Level/Confidence/EvidenceStrength values are surfaced).
// Fully bilingual: every text field is built from REPORT_TEXT[lang], and
// competency/domain names come from the localized framework for that lang.
import type {
  AssessmentReport,
  AssessmentSession,
  CompetencyAssessmentState,
  CompetencyReportRow,
  DevelopmentGap,
  DomainId,
  Lang,
  Level,
  Priority,
} from "../../../shared/types.js";
import { getLocalizedCompetency, localizeFramework } from "../lib/framework.js";
import { REPORT_TEXT, levelLabel } from "../i18n/reportText.js";

const LEVELS: Level[] = ["Foundational", "Intermediate", "Advanced", "Expert"];

function levelIndex(l: Level | null): number {
  return l ? LEVELS.indexOf(l) : -1;
}

function hasEvidenceForLevel(state: CompetencyAssessmentState, level: Level): boolean {
  return state.evidence.some((e) => (e.levelSignal[level] ?? 0) >= 0.35);
}

function suggestedEvidenceFor(competencyId: string, lang: Lang): string[] {
  const c = getLocalizedCompetency(competencyId, lang);
  const text = REPORT_TEXT[lang];
  const domainSuggestions = text.evidenceSuggestionsByDomain[c.domain] ?? [];
  return [...domainSuggestions, text.specificExampleSuggestion(c.name.toLowerCase())];
}

function developmentActivitiesFor(missingBehaviours: string[], lang: Lang): string[] {
  const text = REPORT_TEXT[lang];
  return missingBehaviours.slice(0, 3).map((b, i) => text.buildEvidenceOf(b, text.developmentActivities[i % text.developmentActivities.length]));
}

export function computeGap(state: CompetencyAssessmentState, targetLevel: Level | undefined, lang: Lang = "en"): DevelopmentGap | null {
  if (!targetLevel) return null;
  const text = REPORT_TEXT[lang];
  const competency = getLocalizedCompetency(state.competencyId, lang);
  const currentIdx = levelIndex(state.currentLevelEstimate);
  const targetIdx = levelIndex(targetLevel);

  if (currentIdx === -1) {
    return {
      competencyId: state.competencyId,
      currentLevel: null,
      targetLevel,
      gapSize: 0,
      priority: state.relevanceTarget === "Low" ? "Low" : "Medium",
      why: text.insufficientEvidenceWhy,
      missingBehaviours: [],
      developmentFocus: [text.insufficientEvidenceDevelopmentFocus],
      suggestedEvidence: suggestedEvidenceFor(state.competencyId, lang),
    };
  }

  const gapSize = Math.max(0, targetIdx - currentIdx);
  if (gapSize === 0) {
    return null; // at or above target: this is a strength, not a gap
  }

  const missingBehaviours: string[] = [];
  for (let i = currentIdx + 1; i <= targetIdx; i++) {
    const level = LEVELS[i];
    if (hasEvidenceForLevel(state, level)) continue;
    const bullets = competency.levels[level] ?? [];
    missingBehaviours.push(...bullets.slice(0, 3));
  }

  let priority: Priority = "Low";
  if (state.relevanceTarget === "High" && gapSize >= 1) priority = gapSize >= 2 ? "High" : "Medium";
  else if (state.relevanceTarget === "Medium" && gapSize >= 2) priority = "Medium";
  else if (state.relevanceTarget === "Medium" && gapSize === 1) priority = "Low";

  const currentLabel = levelLabel(state.currentLevelEstimate as Level, lang);
  const targetLabel = levelLabel(targetLevel, lang);

  return {
    competencyId: state.competencyId,
    currentLevel: state.currentLevelEstimate,
    targetLevel,
    gapSize,
    priority,
    why: priority === "High" ? text.gapWhyHighPriority(currentLabel, targetLabel) : text.gapWhyDefault(currentLabel, targetLabel),
    missingBehaviours: missingBehaviours.length > 0 ? missingBehaviours : [text.behaviourNotYetDemonstrated(levelLabel(LEVELS[currentIdx + 1], lang))],
    developmentFocus: developmentActivitiesFor(missingBehaviours, lang),
    suggestedEvidence: suggestedEvidenceFor(state.competencyId, lang),
  };
}

function buildRow(state: CompetencyAssessmentState, lang: Lang): CompetencyReportRow {
  const c = getLocalizedCompetency(state.competencyId, lang);
  const currentIdx = levelIndex(state.currentLevelEstimate);
  const demonstrated = state.currentLevelEstimate ? c.levels[state.currentLevelEstimate] ?? [] : [];
  const nextLevel = currentIdx >= 0 && currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;
  const notYet = nextLevel ? (c.levels[nextLevel] ?? []).slice(0, 3) : [];

  return {
    competencyId: c.id,
    competencyName: c.name,
    domain: c.domain,
    relevanceCurrent: state.relevanceCurrent,
    relevanceTarget: state.relevanceTarget,
    currentLevel: state.currentLevelEstimate,
    targetLevelCurrentRole: state.targetLevelCurrentRole,
    targetLevelFutureRole: state.targetLevelFutureRole,
    confidence: state.confidence,
    evidenceStrength: state.evidenceStrength,
    conclusionStatus: state.conclusionStatus,
    contradictionFlag: state.contradictionFlag,
    demonstratedBehaviours: demonstrated,
    notYetDemonstratedBehaviours: notYet,
  };
}

export function domainName(id: DomainId, lang: Lang = "en"): string {
  return localizeFramework(lang).meta.domains.find((d) => d.id === id)?.name ?? id;
}

export function buildReport(session: AssessmentSession): AssessmentReport {
  const lang = session.lang ?? "en";
  const text = REPORT_TEXT[lang];
  const states = Object.values(session.competencyStates).filter((s) => s.status !== "skipped-low-relevance" || s.evidence.length > 0);
  const rows = states.map((s) => buildRow(s, lang));

  const domainSummaries: AssessmentReport["domainSummaries"] = {} as AssessmentReport["domainSummaries"];
  for (const domain of localizeFramework(lang).meta.domains) {
    const domainRows = rows.filter((r) => r.domain === domain.id);
    const strengths = domainRows
      .filter((r) => r.currentLevel === "Advanced" || r.currentLevel === "Expert")
      .sort((a, b) => levelIndex(b.currentLevel) - levelIndex(a.currentLevel))
      .slice(0, 3)
      .map((r) => text.strengthWithLevel(r.competencyName, levelLabel(r.currentLevel as Level, lang)));
    const gapsHere = domainRows
      .filter((r) => r.targetLevelCurrentRole && levelIndex(r.targetLevelCurrentRole) > levelIndex(r.currentLevel))
      .map((r) => text.gapEntry(r.competencyName, r.currentLevel ? levelLabel(r.currentLevel, lang) : text.insufficientEvidenceLabel, levelLabel(r.targetLevelCurrentRole as Level, lang)));
    domainSummaries[domain.id] = { strengths, gaps: gapsHere };
  }

  const topStrengths = rows
    .filter((r) => r.conclusionStatus === "demonstrated" && r.confidence !== "Low")
    .sort((a, b) => levelIndex(b.currentLevel) - levelIndex(a.currentLevel))
    .slice(0, 6)
    .map((r) => text.topStrengthEntry(r.competencyName, levelLabel(r.currentLevel as Level, lang), r.confidence, r.evidenceStrength));

  const gaps: DevelopmentGap[] = [];
  for (const state of states) {
    const target = state.targetLevelCurrentRole ?? state.targetLevelFutureRole;
    const gap = computeGap(state, target, lang);
    if (gap) gaps.push(gap);
  }
  const priorityOrder: Record<Priority, number> = { High: 0, Medium: 1, Low: 2, "N/A": 3 };
  const topDevelopmentPriorities = gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 8);

  const uncertaintyNotes: string[] = [];
  for (const r of rows) {
    if (r.conclusionStatus === "insufficient-evidence") {
      uncertaintyNotes.push(text.uncertaintyInsufficient(r.competencyName));
    } else if (r.confidence === "Low" && r.conclusionStatus === "demonstrated") {
      uncertaintyNotes.push(text.uncertaintyLowConfidence(r.competencyName, levelLabel(r.currentLevel as Level, lang)));
    }
    if (r.contradictionFlag) {
      const state = session.competencyStates[r.competencyId];
      uncertaintyNotes.push(`${r.competencyName}: ${state?.contradictionNote ?? text.defaultContradictionNote("?", "?")}`);
    }
  }

  const demonstratedCount = rows.filter((r) => r.conclusionStatus === "demonstrated").length;
  const highPriorityCount = topDevelopmentPriorities.filter((g) => g.priority === "High").length;
  const topStrengthNames = topStrengths.map((s) => s.split(" — ")[0]);
  const executiveSummary = text.executiveSummary({ count: rows.length, demonstratedCount, topStrengthNames, highPriorityCount });

  return {
    generatedAt: new Date().toISOString(),
    sessionId: session.id,
    lang,
    mode: session.mode,
    roleAnswers: session.roleAnswers,
    rows,
    domainSummaries,
    topStrengths,
    topDevelopmentPriorities,
    uncertaintyNotes,
    executiveSummary,
  };
}
