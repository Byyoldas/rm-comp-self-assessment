import { describe, it, expect } from "vitest";
import { applyEvidence, initCompetencyState, recordAnswer, selectNextQuestionForCompetency, stoppingRuleMet } from "../adaptiveEngine.js";
import { questionsForCompetency } from "../questionBank.js";
import type { EvaluationResult } from "../evidenceEvaluator.js";
import type { Evidence } from "../../../../shared/types.js";

const COMPETENCY = "research-project-management";

describe("adaptiveEngine: conservative award rule", () => {
  it("does not award Expert from vague, unspecific self-assessment language alone", () => {
    let state = initCompetencyState(COMPETENCY, "High", "High");
    const questions = questionsForCompetency(COMPETENCY);
    const opening = questions.find((q) => q.id.endsWith("__opening"))!;

    // Simulates what the heuristic evaluator would produce for "I am an expert at this" —
    // near-zero specificity should suppress the level signal regardless of the word "expert".
    const vagueEvaluation: EvaluationResult = {
      levelSignal: { Expert: 0.9 }, // even if some component naively matched "expert"
      specificityScore: 0.05,
      selfClaimLevel: "Expert",
      sourceType: "scenario-performance",
      usedLLM: false,
    };

    state = recordAnswer(state, opening, vagueEvaluation, "I am an expert at this, very experienced.");

    expect(state.currentLevelEstimate).not.toBe("Expert");
    expect(state.contradictionFlag).toBe(true);
  });

  it("awards a level only when direct evidence signal clears the threshold", () => {
    let state = initCompetencyState(COMPETENCY, "High", "High");
    const questions = questionsForCompetency(COMPETENCY);
    const opening = questions.find((q) => q.id.endsWith("__opening"))!;

    const strongEvaluation: EvaluationResult = {
      levelSignal: { Foundational: 0.8, Intermediate: 0.6 },
      specificityScore: 0.8,
      selfClaimLevel: null,
      sourceType: "scenario-performance",
      usedLLM: false,
    };

    state = recordAnswer(state, opening, strongEvaluation, "Concrete detailed answer with numbers and outcomes.");
    expect(["Foundational", "Intermediate"]).toContain(state.currentLevelEstimate);
    expect(state.evidence.length).toBe(1);
  });

  it("never assigns a level with zero evidence", () => {
    const state = initCompetencyState(COMPETENCY, "High", "High");
    expect(state.currentLevelEstimate).toBeNull();
    expect(state.conclusionStatus).toBe("insufficient-evidence");
  });
});

describe("adaptiveEngine: stopping rule", () => {
  it("stops once max questions is reached even without a clear margin", () => {
    let state = initCompetencyState(COMPETENCY, "Low", "Low");
    for (let i = 0; i < 3; i++) {
      const evidence: Evidence = {
        id: `e${i}`,
        competencyId: COMPETENCY,
        sourceType: "scenario-performance",
        dimension: "Application",
        rawResponse: "x",
        levelSignal: { Foundational: 0.3, Intermediate: 0.3 }, // ambiguous, no clear winner
        specificityScore: 0.4,
        createdAt: new Date().toISOString(),
      };
      state = applyEvidence(state, evidence);
    }
    expect(stoppingRuleMet(state, 3)).toBe(true);
  });

  it("does not stop before the minimum question count even with a sharp margin", () => {
    let state = initCompetencyState(COMPETENCY, "High", "High");
    const evidence: Evidence = {
      id: "e0",
      competencyId: COMPETENCY,
      sourceType: "scenario-performance",
      dimension: "Application",
      rawResponse: "x",
      levelSignal: { Foundational: 1 },
      specificityScore: 0.9,
      createdAt: new Date().toISOString(),
    };
    state = applyEvidence(state, evidence);
    expect(stoppingRuleMet(state, 5)).toBe(false);
  });
});

describe("adaptiveEngine: question selection", () => {
  it("asks the opening question first for a not-started competency", () => {
    const state = initCompetencyState(COMPETENCY, "High", "High");
    const q = selectNextQuestionForCompetency(state);
    expect(q?.id.endsWith("__opening")).toBe(true);
  });

  it("never re-asks a question that was already asked", () => {
    let state = initCompetencyState(COMPETENCY, "High", "High");
    const seen = new Set<string>();
    for (let i = 0; i < 8; i++) {
      const q = selectNextQuestionForCompetency(state);
      if (!q) break;
      expect(seen.has(q.id)).toBe(false);
      seen.add(q.id);
      state = recordAnswer(
        state,
        q,
        { levelSignal: { Foundational: 0.5 }, specificityScore: 0.5, selfClaimLevel: null, sourceType: "scenario-performance", usedLLM: false },
        "answer"
      );
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
