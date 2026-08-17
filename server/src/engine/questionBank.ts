// Deterministic, descriptor-traceable question generator.
//
// Every generated question is derived directly from one or more descriptor bullets
// in shared/framework.json / shared/framework.tr.json (the RM Comp source and its
// translation). Nothing here invents behavioural content that isn't grounded in
// the source text; templates only choose *how* to ask about a descriptor, never
// *what* the descriptor says. Fully bilingual: pass `lang` to get an English or
// Turkish question bank built from the correspondingly localized competency data.
import type { Competency, Lang, Level, Question, SourceDescriptorRef } from "../../../shared/types.js";
import { allCompetencies, getLocalizedCompetency } from "../lib/framework.js";
import { flagshipQuestionsByLang } from "./flagshipQuestions.js";
import { QUESTION_TEXT } from "../i18n/questionText.js";

const LEVELS: Level[] = ["Foundational", "Intermediate", "Advanced", "Expert"];

function boundaryKey(lower: Level | null, higher: Level): string {
  return `${lower ?? "NONE"}-${higher}`;
}

function ref(competencyId: string, level: Level, idx: number, text: string): SourceDescriptorRef {
  return { competencyId, level, descriptorIndex: idx, text };
}

function pickRepresentative(descriptors: string[], count = 2): { text: string; idx: number }[] {
  return descriptors.slice(0, count).map((text, idx) => ({ text, idx }));
}

function generateBoundaryQuestions(
  c: Competency,
  lower: Level | null,
  higher: Level,
  picks: { text: string; idx: number }[],
  lang: Lang
): Question[] {
  const text = QUESTION_TEXT[lang];
  const questions: Question[] = [];
  const targetLevels = lower ? [lower, higher] : [higher];
  const bKey = boundaryKey(lower, higher);
  const sourceDescriptors: SourceDescriptorRef[] = picks.map((p) => ref(c.id, higher, p.idx, p.text));
  const descriptorQuote = picks.map((p) => `"${p.text}"`).join(" ");

  questions.push({
    id: `${c.id}__${bKey}__behavioral`,
    competencyId: c.id,
    targetLevels,
    dimension: "Application",
    type: "behavioral",
    prompt: text.behavioralPrompt(c.name, higher, descriptorQuote),
    guidance: text.behavioralGuidance,
    why: text.behavioralWhy(higher, c.name),
    responseFormat: "free-text",
    sourceDescriptors,
    origin: "generated",
  });

  questions.push({
    id: `${c.id}__${bKey}__autonomy`,
    competencyId: c.id,
    targetLevels,
    dimension: "Autonomy",
    type: "scope",
    prompt: text.autonomyPrompt(descriptorQuote),
    why: text.autonomyWhy(lower, higher, c.name),
    responseFormat: "single-select",
    options: text.autonomyOptions,
    sourceDescriptors,
    origin: "generated",
  });

  questions.push({
    id: `${c.id}__${bKey}__frequency`,
    competencyId: c.id,
    targetLevels,
    dimension: "Consistency",
    type: "frequency",
    prompt: text.frequencyPrompt,
    why: text.frequencyWhy(higher, c.name),
    responseFormat: "single-select",
    options: text.frequencyOptions,
    sourceDescriptors,
    origin: "generated",
  });

  questions.push({
    id: `${c.id}__${bKey}__outcome`,
    competencyId: c.id,
    targetLevels,
    dimension: "Impact",
    type: "outcome",
    prompt: text.outcomePrompt,
    why: text.outcomeWhy,
    responseFormat: "free-text",
    sourceDescriptors,
    origin: "generated",
  });

  return questions;
}

function generateOpeningQuestion(c: Competency, lang: Lang): Question {
  const text = QUESTION_TEXT[lang];
  return {
    id: `${c.id}__opening`,
    competencyId: c.id,
    targetLevels: ["Foundational", "Intermediate"],
    dimension: "Knowledge",
    type: "behavioral",
    prompt: text.openingPrompt(c.description),
    guidance: text.openingGuidance,
    why: text.openingWhy(c.name),
    responseFormat: "free-text",
    sourceDescriptors: [],
    origin: "generated",
  };
}

function generateForCompetency(c: Competency, lang: Lang): Question[] {
  const questions: Question[] = [generateOpeningQuestion(c, lang)];
  let previousNonEmptyLevel: Level | null = null;

  for (let i = 0; i < LEVELS.length; i++) {
    const level = LEVELS[i];
    const descriptors = c.levels[level] ?? [];
    if (descriptors.length === 0) continue; // respect source gaps (e.g. managing-grant-office has no Foundational)
    if (previousNonEmptyLevel === level) continue;
    const picks = pickRepresentative(descriptors, 2);
    questions.push(...generateBoundaryQuestions(c, previousNonEmptyLevel, level, picks, lang));
    previousNonEmptyLevel = level;
  }

  return questions;
}

const cache = new Map<Lang, Map<string, Question[]>>();

export function buildQuestionBank(lang: Lang = "en"): Map<string, Question[]> {
  const existing = cache.get(lang);
  if (existing) return existing;
  const map = new Map<string, Question[]>();
  const flagship = flagshipQuestionsByLang[lang];
  for (const base of allCompetencies()) {
    const localized = getLocalizedCompetency(base.id, lang);
    const generated = generateForCompetency(localized, lang);
    const competencyFlagship = flagship.filter((q) => q.competencyId === base.id);
    // Flagship (hand-crafted) questions are asked first for their competency.
    map.set(base.id, [...competencyFlagship, ...generated]);
  }
  cache.set(lang, map);
  return map;
}

export function questionsForCompetency(competencyId: string, lang: Lang = "en"): Question[] {
  return buildQuestionBank(lang).get(competencyId) ?? [];
}

export function findQuestion(competencyId: string, questionId: string, lang: Lang = "en"): Question | undefined {
  return questionsForCompetency(competencyId, lang).find((q) => q.id === questionId);
}

export function allQuestions(lang: Lang = "en"): Question[] {
  return Array.from(buildQuestionBank(lang).values()).flat();
}
