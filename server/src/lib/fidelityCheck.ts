// Automated framework fidelity validation (requirement: PHASE 13 / section 35).
// Checks that every competency/level from the source PDF is represented, that no
// descriptor text has been altered, and that every generated question (in both
// English and Turkish) traces back to real descriptor text (or, for opening
// questions, the competency description itself). Also checks that the Turkish
// translation overlay is structurally complete — same competencies, same levels,
// same bullet counts — so a translation typo/omission can't silently fall back
// to English without being reported.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { framework } from "./framework.js";
import { allQuestions } from "../engine/questionBank.js";
import type { Level } from "../../../shared/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedDir = path.resolve(__dirname, "../../../shared");
const frameworkTrRaw: { competencies: { id: string; levels: Partial<Record<Level, string[]>> }[] } = JSON.parse(
  fs.readFileSync(path.join(sharedDir, "framework.tr.json"), "utf-8")
);

const LEVELS = ["Foundational", "Intermediate", "Advanced", "Expert"] as const;

export interface FidelityReport {
  totalCompetencies: number;
  totalDomains: number;
  totalDescriptors: number;
  levelsPerCompetency: Record<string, string[]>;
  competenciesMissingLevels: { competencyId: string; missingLevels: string[]; expected: boolean }[];
  totalGeneratedQuestions: number;
  questionsWithoutSourceDescriptors: string[];
  questionsReferencingUnknownDescriptors: string[];
  domainsCovered: string[];
  translationParity: { totalGeneratedQuestionsTr: number; mismatchedCompetencies: string[]; missingCompetencies: string[] };
  passed: boolean;
  issues: string[];
}

// The only known, deliberate gap in the source PDF (see framework.json _note).
const KNOWN_GAPS: Record<string, string[]> = {
  "managing-grant-office": ["Foundational"],
};

function checkQuestionsForLang(lang: "en" | "tr", refFramework: typeof framework | typeof frameworkTrRaw, issues: string[]) {
  const questions = allQuestions(lang);
  const withoutSource = questions.filter((q) => q.sourceDescriptors.length === 0 && !q.id.endsWith("__opening")).map((q) => q.id);
  const referencingUnknown: string[] = [];
  for (const q of questions) {
    for (const sd of q.sourceDescriptors) {
      const c = refFramework.competencies.find((c) => c.id === sd.competencyId);
      const bullets = (c?.levels as Partial<Record<Level, string[]>> | undefined)?.[sd.level] ?? [];
      if (!bullets.includes(sd.text)) {
        referencingUnknown.push(`[${lang}] ${q.id} -> ${sd.competencyId}/${sd.level}[${sd.descriptorIndex}]`);
      }
    }
  }
  if (withoutSource.length > 0) {
    issues.push(
      `[${lang}] ${withoutSource.length} question(s) have no source descriptor reference (only the per-competency opening question may reference the competency description instead of a level descriptor).`
    );
  }
  if (referencingUnknown.length > 0) {
    issues.push(`[${lang}] ${referencingUnknown.length} question(s) reference descriptor text that does not match the ${lang} framework verbatim: ${referencingUnknown.slice(0, 5).join("; ")}${referencingUnknown.length > 5 ? "…" : ""}`);
  }
  return { withoutSource, referencingUnknown, count: questions.length };
}

export function runFidelityCheck(): FidelityReport {
  const issues: string[] = [];
  const levelsPerCompetency: Record<string, string[]> = {};
  const competenciesMissingLevels: FidelityReport["competenciesMissingLevels"] = [];
  let totalDescriptors = 0;

  for (const c of framework.competencies) {
    const present = LEVELS.filter((l) => (c.levels[l]?.length ?? 0) > 0);
    levelsPerCompetency[c.id] = present as unknown as string[];
    const missing = LEVELS.filter((l) => !(c.levels[l]?.length));
    if (missing.length > 0) {
      const expected = JSON.stringify(missing) === JSON.stringify(KNOWN_GAPS[c.id] ?? null) || (KNOWN_GAPS[c.id] && missing.every((m) => KNOWN_GAPS[c.id].includes(m)));
      competenciesMissingLevels.push({ competencyId: c.id, missingLevels: missing as unknown as string[], expected: Boolean(expected) });
      if (!expected) {
        issues.push(`Competency "${c.id}" is missing descriptor levels: ${missing.join(", ")} — this is not a documented source gap, verify against the PDF.`);
      }
    }
    for (const l of LEVELS) totalDescriptors += c.levels[l]?.length ?? 0;
  }

  const en = checkQuestionsForLang("en", framework, issues);
  const tr = checkQuestionsForLang("tr", frameworkTrRaw, issues);

  // Translation structural parity: every EN competency should have a TR entry
  // with the same levels populated and the same bullet count per level.
  const trById = new Map(frameworkTrRaw.competencies.map((c) => [c.id, c]));
  const missingCompetencies: string[] = [];
  const mismatchedCompetencies: string[] = [];
  for (const c of framework.competencies) {
    const trC = trById.get(c.id);
    if (!trC) {
      missingCompetencies.push(c.id);
      continue;
    }
    for (const level of LEVELS) {
      const enCount = c.levels[level]?.length ?? 0;
      const trCount = trC.levels[level]?.length ?? 0;
      if (enCount !== trCount) {
        mismatchedCompetencies.push(`${c.id}/${level} (en:${enCount} vs tr:${trCount})`);
      }
    }
  }
  if (missingCompetencies.length > 0) {
    issues.push(`Turkish translation is missing ${missingCompetencies.length} competenc(y/ies) entirely: ${missingCompetencies.join(", ")}. These silently fall back to English.`);
  }
  if (mismatchedCompetencies.length > 0) {
    issues.push(`Turkish translation has a bullet-count mismatch (falls back to English for that level) in: ${mismatchedCompetencies.slice(0, 8).join("; ")}${mismatchedCompetencies.length > 8 ? "…" : ""}`);
  }

  if (framework.competencies.length !== 50) {
    issues.push(`Expected 50 competencies per the source PDF extraction, found ${framework.competencies.length}.`);
  }
  if (framework.meta.domains.length !== 7) {
    issues.push(`Expected 7 domains per the source PDF extraction, found ${framework.meta.domains.length}.`);
  }

  return {
    totalCompetencies: framework.competencies.length,
    totalDomains: framework.meta.domains.length,
    totalDescriptors,
    levelsPerCompetency,
    competenciesMissingLevels,
    totalGeneratedQuestions: en.count,
    questionsWithoutSourceDescriptors: en.withoutSource,
    questionsReferencingUnknownDescriptors: en.referencingUnknown,
    domainsCovered: framework.meta.domains.map((d) => d.id),
    translationParity: { totalGeneratedQuestionsTr: tr.count, mismatchedCompetencies, missingCompetencies },
    passed: issues.length === 0,
    issues,
  };
}

// CLI entry point: `npm run fidelity`
if (process.argv[1] && process.argv[1].endsWith("fidelityCheck.ts")) {
  const report = runFidelityCheck();
  console.log(JSON.stringify(report, null, 2));
  console.log(report.passed ? "\n✅ Framework fidelity check PASSED" : "\n❌ Framework fidelity check FAILED");
  if (!report.passed) process.exitCode = 1;
}
