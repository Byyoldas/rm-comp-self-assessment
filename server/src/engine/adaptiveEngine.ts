// The adaptive assessment engine: maintains a level-probability distribution per
// competency, updates it from each piece of evidence, decides when enough
// evidence has been gathered, and selects the next most informative question
// across the whole session (not just within one competency).
import type {
  AssessmentSession,
  CompetencyAssessmentState,
  Confidence,
  ConclusionStatus,
  Evidence,
  EvidenceStrength,
  Lang,
  Level,
  Question,
  Relevance,
} from "../../../shared/types.js";
import { getCompetency } from "../lib/framework.js";
import { questionsForCompetency } from "./questionBank.js";
import type { EvaluationResult } from "./evidenceEvaluator.js";
import { REPORT_TEXT, levelLabel } from "../i18n/reportText.js";

const LEVELS: Level[] = ["Foundational", "Intermediate", "Advanced", "Expert"];

// Conservative prior: a higher level must be *earned* by evidence, not assumed.
const PRIOR: Record<Level, number> = { Foundational: 0.4, Intermediate: 0.3, Advanced: 0.2, Expert: 0.1 };

const RELEVANCE_WEIGHT: Record<Relevance, number> = { High: 1.2, Medium: 1.0, Low: 0.7 };

export function initCompetencyState(
  competencyId: string,
  relevanceCurrent: Relevance,
  relevanceTarget: Relevance
): CompetencyAssessmentState {
  return {
    competencyId,
    relevanceCurrent,
    relevanceTarget,
    levelProbabilities: { ...PRIOR },
    askedQuestionIds: [],
    evidence: [],
    status: "not-started",
    currentLevelEstimate: null,
    confidence: "Low",
    evidenceStrength: "Very Low",
    conclusionStatus: "insufficient-evidence",
    contradictionFlag: false,
  };
}

function normalize(dist: Record<Level, number>): Record<Level, number> {
  const sum = LEVELS.reduce((s, l) => s + dist[l], 0) || 1;
  const out = {} as Record<Level, number>;
  for (const l of LEVELS) out[l] = dist[l] / sum;
  return out;
}

function updatePosterior(prior: Record<Level, number>, levelSignal: Partial<Record<Level, number>>): Record<Level, number> {
  const posterior = {} as Record<Level, number>;
  for (const level of LEVELS) {
    const likelihood = (levelSignal[level] ?? 0) + 0.15; // additive smoothing: untested levels aren't crushed to 0
    posterior[level] = prior[level] * likelihood;
  }
  return normalize(posterior);
}

function cumulativeFromTop(dist: Record<Level, number>): Record<Level, number> {
  const cum = {} as Record<Level, number>;
  let running = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    running += dist[LEVELS[i]];
    cum[LEVELS[i]] = running;
  }
  return cum;
}

function deriveCurrentLevelEstimate(state: CompetencyAssessmentState): Level | null {
  if (state.evidence.length === 0) return null;
  const cum = cumulativeFromTop(state.levelProbabilities);
  // Highest level whose cumulative posterior mass clears the bar AND which has
  // at least one piece of *direct* touched evidence (evidence signal, not just
  // decayed uncertainty from smoothing) — this is the conservative-award rule.
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    const level = LEVELS[i];
    const hasDirectEvidence = state.evidence.some((e) => (e.levelSignal[level] ?? 0) >= 0.35);
    if (cum[level] >= 0.5 && hasDirectEvidence) return level;
  }
  // Fall back to the level with the single highest posterior if nothing clears the bar,
  // but only if there is at least weak direct evidence somewhere.
  const anyEvidence = state.evidence.some((e) => Object.values(e.levelSignal).some((v) => (v ?? 0) >= 0.2));
  if (!anyEvidence) return null;
  const sorted = [...LEVELS].sort((a, b) => state.levelProbabilities[b] - state.levelProbabilities[a]);
  return sorted[0];
}

function avgSpecificity(evidence: Evidence[]): number {
  if (evidence.length === 0) return 0;
  return evidence.reduce((s, e) => s + e.specificityScore, 0) / evidence.length;
}

function deriveConfidence(state: CompetencyAssessmentState): Confidence {
  const sorted = [...LEVELS].sort((a, b) => state.levelProbabilities[b] - state.levelProbabilities[a]);
  const margin = state.levelProbabilities[sorted[0]] - state.levelProbabilities[sorted[1]];
  const volumeScore = Math.min(1, state.evidence.length / 4);
  const specScore = avgSpecificity(state.evidence);
  const score = margin * 0.4 + volumeScore * 0.3 + specScore * 0.3;
  if (score >= 0.6) return "High";
  if (score >= 0.35) return "Moderate";
  return "Low";
}

function deriveEvidenceStrength(state: CompetencyAssessmentState): EvidenceStrength {
  const volumeScore = Math.min(1, state.evidence.length / 5);
  const specScore = avgSpecificity(state.evidence);
  const distinctSourceTypes = new Set(state.evidence.map((e) => e.sourceType)).size;
  const diversity = Math.min(1, distinctSourceTypes / 2);
  const score = volumeScore * 0.4 + specScore * 0.4 + diversity * 0.2;
  if (score < 0.15) return "Very Low";
  if (score < 0.35) return "Low";
  if (score < 0.55) return "Moderate";
  if (score < 0.75) return "Strong";
  return "Very Strong";
}

function deriveConclusionStatus(state: CompetencyAssessmentState): ConclusionStatus {
  if (state.evidence.length === 0) {
    return state.relevanceCurrent === "Low" && state.relevanceTarget === "Low" ? "not-relevant" : "insufficient-evidence";
  }
  if (state.currentLevelEstimate) return "demonstrated";
  return avgSpecificity(state.evidence) < 0.25 ? "insufficient-evidence" : "not-demonstrated";
}

export interface ContradictionCheck {
  flagged: boolean;
  note?: string;
}

function checkContradiction(state: CompetencyAssessmentState, selfClaimLevel: Level | null, lang: Lang): ContradictionCheck {
  if (!selfClaimLevel) return { flagged: state.contradictionFlag, note: state.contradictionNote };
  const evidenceLevel = state.currentLevelEstimate;
  const claimRank = LEVELS.indexOf(selfClaimLevel);
  const evidenceRank = evidenceLevel ? LEVELS.indexOf(evidenceLevel) : -1;
  if (claimRank - evidenceRank >= 2) {
    const text = REPORT_TEXT[lang];
    return {
      flagged: true,
      note: text.defaultContradictionNote(
        levelLabel(selfClaimLevel, lang),
        evidenceLevel ? levelLabel(evidenceLevel, lang) : text.insufficientEvidenceLabel
      ),
    };
  }
  return { flagged: state.contradictionFlag, note: state.contradictionNote };
}

/**
 * Defense-in-depth gate, independent of whatever produced the evidence (heuristic
 * evaluator, LLM, or a future evaluator). Near-zero-specificity responses — e.g.
 * "I'm an expert at this" with no concrete detail — can never contribute
 * meaningful level signal, regardless of what levelSignal an evaluator computed.
 * This is enforced here, at the trust boundary into the scoring state, rather
 * than only inside each evaluator implementation.
 */
function gateBySpecificity(levelSignal: Partial<Record<Level, number>>, specificityScore: number): Partial<Record<Level, number>> {
  if (specificityScore >= 0.15) return levelSignal;
  const gated: Partial<Record<Level, number>> = {};
  for (const [level, signal] of Object.entries(levelSignal) as [Level, number][]) {
    gated[level] = Math.min(signal, 0.1);
  }
  return gated;
}

/** Appends one piece of evidence to a competency's state and recomputes all derived fields. */
export function applyEvidence(
  state: CompetencyAssessmentState,
  evidence: Evidence,
  selfClaimLevel: Level | null = null,
  lang: Lang = "en"
): CompetencyAssessmentState {
  const gatedEvidence: Evidence = { ...evidence, levelSignal: gateBySpecificity(evidence.levelSignal, evidence.specificityScore) };
  const next: CompetencyAssessmentState = {
    ...state,
    evidence: [...state.evidence, gatedEvidence],
    levelProbabilities: updatePosterior(state.levelProbabilities, gatedEvidence.levelSignal),
    status: state.status === "not-started" ? "in-progress" : state.status,
  };

  next.currentLevelEstimate = deriveCurrentLevelEstimate(next);
  next.confidence = deriveConfidence(next);
  next.evidenceStrength = deriveEvidenceStrength(next);
  next.conclusionStatus = deriveConclusionStatus(next);

  if (selfClaimLevel) next.selfReportedLevel = selfClaimLevel;
  const contradiction = checkContradiction(next, selfClaimLevel, lang);
  next.contradictionFlag = contradiction.flagged;
  next.contradictionNote = contradiction.note;

  return next;
}

/** Applies one evaluated answer to a competency's state (records the question as asked). */
export function recordAnswer(
  state: CompetencyAssessmentState,
  question: Question,
  evaluation: EvaluationResult,
  rawResponseText: string,
  lang: Lang = "en"
): CompetencyAssessmentState {
  const evidence: Evidence = {
    id: `${question.id}__${state.evidence.length}`,
    competencyId: state.competencyId,
    questionId: question.id,
    sourceType: evaluation.sourceType,
    dimension: question.dimension,
    rawResponse: rawResponseText,
    levelSignal: evaluation.levelSignal,
    specificityScore: evaluation.specificityScore,
    createdAt: new Date().toISOString(),
  };

  const next = applyEvidence(state, evidence, evaluation.selfClaimLevel, lang);
  return { ...next, askedQuestionIds: [...state.askedQuestionIds, question.id] };
}

export function stoppingRuleMet(state: CompetencyAssessmentState, maxQuestions: number): boolean {
  const sorted = [...LEVELS].sort((a, b) => state.levelProbabilities[b] - state.levelProbabilities[a]);
  const margin = state.levelProbabilities[sorted[0]] - state.levelProbabilities[sorted[1]];
  const minQuestions = 2;
  if (state.evidence.length >= maxQuestions) return true;
  return state.evidence.length >= minQuestions && margin >= 0.3;
}

export function finalizeIfSufficient(state: CompetencyAssessmentState, maxQuestions: number): CompetencyAssessmentState {
  if (state.status === "in-progress" && stoppingRuleMet(state, maxQuestions)) {
    return { ...state, status: "sufficient" };
  }
  return state;
}

/** Picks the next unanswered question for a competency, favouring the current top-2 ambiguous levels. */
export function selectNextQuestionForCompetency(state: CompetencyAssessmentState, lang: Lang = "en"): Question | null {
  const pool = questionsForCompetency(state.competencyId, lang).filter((q) => !state.askedQuestionIds.includes(q.id));
  if (pool.length === 0) return null;

  if (state.evidence.length === 0) {
    const opening = pool.find((q) => q.id.endsWith("__opening"));
    return opening ?? pool[0];
  }

  const sortedLevels = [...LEVELS].sort((a, b) => state.levelProbabilities[b] - state.levelProbabilities[a]);
  const top2 = new Set(sortedLevels.slice(0, 2));
  const boundaryMatch = pool.find((q) => q.targetLevels.some((l) => top2.has(l)));
  return boundaryMatch ?? pool[0];
}

export interface NextQuestionResult {
  competencyId: string;
  question: Question;
}

/** Picks which not-yet-sufficient competency to ask about next, across the whole session. */
export function pickNextCompetency(
  states: Record<string, CompetencyAssessmentState>,
  activeIds: string[],
  maxQuestionsFn: (competencyId: string, relevance: Relevance) => number,
  lang: Lang = "en"
): string | null {
  const notStarted = activeIds.filter((id) => states[id]?.status === "not-started");
  if (notStarted.length > 0) {
    notStarted.sort((a, b) => {
      const rw = (id: string) => RELEVANCE_WEIGHT[states[id].relevanceCurrent];
      return rw(b) - rw(a);
    });
    return notStarted[0];
  }

  const inProgress = activeIds.filter((id) => {
    const s = states[id];
    if (!s || s.status !== "in-progress") return false;
    const max = maxQuestionsFn(id, s.relevanceCurrent);
    return s.evidence.length < max && questionsForCompetency(id, lang).some((q) => !s.askedQuestionIds.includes(q.id));
  });
  if (inProgress.length === 0) return null;

  inProgress.sort((a, b) => {
    const score = (id: string) => {
      const s = states[id];
      const sorted = [...LEVELS].sort((x, y) => s.levelProbabilities[y] - s.levelProbabilities[x]);
      const margin = s.levelProbabilities[sorted[0]] - s.levelProbabilities[sorted[1]];
      const ambiguity = 1 - margin;
      return ambiguity * RELEVANCE_WEIGHT[s.relevanceCurrent];
    };
    return score(b) - score(a);
  });
  return inProgress[0];
}

export function getNextQuestion(
  states: Record<string, CompetencyAssessmentState>,
  activeIds: string[],
  maxQuestionsFn: (competencyId: string, relevance: Relevance) => number,
  lang: Lang = "en"
): NextQuestionResult | null {
  const competencyId = pickNextCompetency(states, activeIds, maxQuestionsFn, lang);
  if (!competencyId) return null;
  const question = selectNextQuestionForCompetency(states[competencyId], lang);
  if (!question) return null;
  return { competencyId, question };
}

export function isSessionComplete(session: AssessmentSession, activeIds: string[]): boolean {
  return activeIds.every((id) => {
    const s = session.competencyStates[id];
    return !s || s.status === "sufficient" || s.status === "skipped-low-relevance";
  });
}

export { getCompetency };
