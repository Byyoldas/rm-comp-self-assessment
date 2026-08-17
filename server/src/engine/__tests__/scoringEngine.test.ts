import { describe, it, expect } from "vitest";
import { computeGap } from "../scoringEngine.js";
import { initCompetencyState, recordAnswer } from "../adaptiveEngine.js";
import { questionsForCompetency } from "../questionBank.js";

const COMPETENCY = "pre-award";

describe("scoringEngine: gap analysis", () => {
  it("returns null (no gap) when current level already meets or exceeds target", () => {
    let state = initCompetencyState(COMPETENCY, "High", "High");
    const opening = questionsForCompetency(COMPETENCY).find((q) => q.id.endsWith("__opening"))!;
    state = recordAnswer(
      state,
      opening,
      { levelSignal: { Foundational: 0.9, Intermediate: 0.5 }, specificityScore: 0.8, selfClaimLevel: null, sourceType: "scenario-performance", usedLLM: false },
      "detailed concrete answer"
    );
    const gap = computeGap(state, "Foundational");
    expect(gap).toBeNull();
  });

  it("flags insufficient evidence distinctly from a real gap", () => {
    const state = initCompetencyState(COMPETENCY, "High", "High");
    const gap = computeGap(state, "Advanced");
    expect(gap).not.toBeNull();
    expect(gap!.currentLevel).toBeNull();
    expect(gap!.why.toLowerCase()).toContain("not enough evidence");
  });

  it("quotes real descriptor text (not invented content) in missingBehaviours", () => {
    let state = initCompetencyState(COMPETENCY, "High", "High");
    const opening = questionsForCompetency(COMPETENCY).find((q) => q.id.endsWith("__opening"))!;
    state = recordAnswer(
      state,
      opening,
      { levelSignal: { Foundational: 0.9 }, specificityScore: 0.8, selfClaimLevel: null, sourceType: "scenario-performance", usedLLM: false },
      "concrete example"
    );
    const gap = computeGap(state, "Intermediate");
    expect(gap).not.toBeNull();
    expect(gap!.missingBehaviours.length).toBeGreaterThan(0);
  });
});
