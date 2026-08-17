// Always-available, deterministic evidence evaluator. This is the fallback (and,
// without an API key configured, the ONLY) mechanism that turns a response into
// evidence. It is intentionally conservative: vague, generic, or confidence-only
// language earns very little signal regardless of which words it uses, which is
// the main defence against "I'll just say Expert". Works for both English and
// Turkish responses — pass the already-localized Competency object plus `lang`.
import type { Competency, Evidence, EvidenceDimension, Lang, Level, Question } from "../../../shared/types.js";
import { evaluateWithLLM, llmAvailable } from "./llmService.js";
import { computeSpecificity, detectSelfClaimLevel, tokenize } from "../i18n/textAnalysis.js";

const LEVELS: Level[] = ["Foundational", "Intermediate", "Advanced", "Expert"];

export { tokenize, computeSpecificity, detectSelfClaimLevel };

export function levelVocabulary(c: Competency, lang: Lang = "en"): Record<Level, Set<string>> {
  const vocab: Partial<Record<Level, Set<string>>> = {};
  for (const level of LEVELS) {
    const bullets = c.levels[level] ?? [];
    vocab[level] = new Set(bullets.flatMap((b) => tokenize(b, lang)));
  }
  return vocab as Record<Level, Set<string>>;
}

export function keywordOverlapScore(responseTokens: string[], vocab: Set<string>): number {
  if (vocab.size === 0 || responseTokens.length === 0) return 0;
  const responseSet = new Set(responseTokens);
  let matches = 0;
  for (const t of responseSet) if (vocab.has(t)) matches++;
  // Normalise against a soft cap so a handful of matches already registers meaningfully.
  return Math.min(1, matches / Math.max(4, vocab.size * 0.25));
}

export interface EvaluationResult {
  levelSignal: Partial<Record<Level, number>>;
  specificityScore: number;
  selfClaimLevel: Level | null;
  sourceType: "self-reported" | "scenario-performance";
  usedLLM: boolean;
}

function heuristicFreeText(question: Question, competency: Competency, text: string, lang: Lang): EvaluationResult {
  const vocab = levelVocabulary(competency, lang);
  const tokens = tokenize(text, lang);
  const specificity = computeSpecificity(text, lang);
  const dampener = 0.25 + 0.75 * specificity; // vague answers can never fully register, even on keyword match

  // Real answers rarely reuse the descriptor's exact wording, so keyword overlap
  // with the SPECIFIC target level's vocabulary is used to tilt credit between
  // the two boundary levels being tested, not as a hard gate on whether credit
  // is given at all. A concrete, on-topic answer (per computeSpecificity + a
  // loose topicality check against the competency's own vocabulary as a whole)
  // earns a solid baseline; exact-language overlap then pulls that credit
  // toward the higher or lower of the two tested levels.
  const allVocab = new Set<string>();
  for (const level of LEVELS) for (const t of vocab[level]) allVocab.add(t);
  const topicality = keywordOverlapScore(tokens, allVocab);
  const topicalGate = Math.min(1, 0.3 + topicality * 4);
  const baseCredit = specificity * topicalGate;

  const overlaps = question.targetLevels.map((level) => ({ level, overlap: keywordOverlapScore(tokens, vocab[level] ?? new Set()) }));
  const maxOverlap = Math.max(...overlaps.map((o) => o.overlap), 0.0001);

  const levelSignal: Partial<Record<Level, number>> = {};
  for (const { level, overlap } of overlaps) {
    const tilt = overlap / maxOverlap; // relative pull toward this level within the tested boundary
    const signal = baseCredit * (0.5 + 0.5 * tilt);
    levelSignal[level] = Math.round(Math.min(1, signal) * dampener * 100) / 100;
  }

  return {
    levelSignal,
    specificityScore: specificity,
    selfClaimLevel: detectSelfClaimLevel(text, lang),
    sourceType: "scenario-performance",
    usedLLM: false,
  };
}

function structuredSelect(question: Question, selectedValues: string[]): EvaluationResult {
  const levelSignal: Partial<Record<Level, number>> = {};
  for (const value of selectedValues) {
    const option = question.options?.find((o) => o.value === value);
    if (!option?.levelSignal) continue;
    for (const [level, signal] of Object.entries(option.levelSignal) as [Level, number][]) {
      levelSignal[level] = Math.max(levelSignal[level] ?? 0, signal);
    }
  }
  return {
    levelSignal,
    specificityScore: 0.7, // structured answers are unambiguous but not as rich as free-text evidence
    selfClaimLevel: null,
    sourceType: "scenario-performance",
    usedLLM: false,
  };
}

/**
 * Main entry point. Tries the LLM (if configured) for free-text responses,
 * blends it conservatively with the heuristic score, and always falls back
 * cleanly to the heuristic-only result. `competency` should already be the
 * localized (Turkish, if applicable) Competency object.
 */
export async function evaluateResponse(
  question: Question,
  competency: Competency,
  rawResponse: string | string[],
  lang: Lang = "en"
): Promise<EvaluationResult> {
  const isSelect = question.responseFormat === "single-select" || question.responseFormat === "multi-select" || question.responseFormat === "frequency-select";

  if (isSelect) {
    const values = Array.isArray(rawResponse) ? rawResponse : [rawResponse];
    return structuredSelect(question, values);
  }

  const text = Array.isArray(rawResponse) ? rawResponse.join(" ") : rawResponse;
  const heuristic = heuristicFreeText(question, competency, text, lang);

  if (!llmAvailable()) return heuristic;

  const llmResult = await evaluateWithLLM(question, competency, text);
  if (!llmResult) return heuristic;

  // Blend: average heuristic and LLM signal per level, still gated by the
  // heuristic specificity dampener so eloquent-but-empty text can't dominate.
  const blended: Partial<Record<Level, number>> = {};
  for (const level of LEVELS) {
    const h = heuristic.levelSignal[level] ?? 0;
    const l = llmResult.levelSignal[level] ?? 0;
    const dampener = 0.25 + 0.75 * heuristic.specificityScore;
    blended[level] = Math.round(((h + l * dampener) / 2) * 100) / 100;
  }

  return {
    levelSignal: blended,
    specificityScore: heuristic.specificityScore,
    selfClaimLevel: heuristic.selfClaimLevel,
    sourceType: "scenario-performance",
    usedLLM: true,
  };
}

export function inferDimensionFromQuestion(question: Question): EvidenceDimension {
  return question.dimension;
}
