import { describe, it, expect } from "vitest";
import { runFidelityCheck } from "../fidelityCheck.js";
import { framework } from "../framework.js";

describe("framework fidelity", () => {
  it("passes the automated fidelity check", () => {
    const report = runFidelityCheck();
    expect(report.issues).toEqual([]);
    expect(report.passed).toBe(true);
  });

  it("has exactly the 7 domains and 50 competencies extracted from the source PDF", () => {
    expect(framework.meta.domains.length).toBe(7);
    expect(framework.competencies.length).toBe(50);
  });

  it("every question's source descriptor text matches the framework verbatim", () => {
    const report = runFidelityCheck();
    expect(report.questionsReferencingUnknownDescriptors).toEqual([]);
  });

  it("every generated question (other than opening questions) traces to a source descriptor", () => {
    const report = runFidelityCheck();
    expect(report.questionsWithoutSourceDescriptors).toEqual([]);
  });

  it("the Turkish translation overlay has full structural parity with the English source", () => {
    const report = runFidelityCheck();
    expect(report.translationParity.missingCompetencies).toEqual([]);
    expect(report.translationParity.mismatchedCompetencies).toEqual([]);
    expect(report.translationParity.totalGeneratedQuestionsTr).toBe(report.totalGeneratedQuestions);
  });
});
