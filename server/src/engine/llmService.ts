// Isolated LLM service layer. Optional: only used when ANTHROPIC_API_KEY is set.
// The rest of the app must work correctly without this — see evidenceEvaluator.ts
// for the always-available heuristic fallback. Nothing in this file is treated as
// ground truth by the scoring engine; its output is one more evidence signal.
import type { Competency, Level, Question } from "../../../shared/types.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.RM_COMP_LLM_MODEL || "claude-sonnet-5";

export function llmAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export interface LLMEvidenceAssessment {
  levelSignal: Partial<Record<Level, number>>;
  matchedBehaviours: string[];
  notes: string;
}

/**
 * Asks the LLM to map a free-text response against the competency's own
 * descriptor bullets (never inventing new ones) and return a level-signal
 * distribution plus which specific descriptor phrases were evidenced.
 * Returns null on any failure or when no API key is configured — callers
 * must treat that as "fall back to the heuristic evaluator", not an error.
 */
export async function evaluateWithLLM(
  question: Question,
  competency: Competency,
  responseText: string
): Promise<LLMEvidenceAssessment | null> {
  if (!llmAvailable()) return null;
  if (!responseText || responseText.trim().length < 3) return null;

  const descriptorBlock = (Object.keys(competency.levels) as Level[])
    .map((level) => {
      const bullets = competency.levels[level] ?? [];
      if (bullets.length === 0) return null;
      return `${level}:\n${bullets.map((b) => `- ${b}`).join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const system = `You are an assessment engine for the European Competence Framework for Research Managers (RM Comp). You evaluate a candidate's free-text answer strictly against the provided behavioural descriptors for ONE competency. You never invent descriptors, never reward confident language that lacks concrete evidence, and you separate genuine demonstrated behaviour from vague self-assessment. Respond with strict JSON only, matching this shape: {"levelSignal": {"Foundational": number, "Intermediate": number, "Advanced": number, "Expert": number}, "matchedBehaviours": string[], "notes": string}. Each levelSignal value is 0-1, representing how strongly the response provides CONCRETE evidence of that level's descriptors (not confidence, not job title, not years of experience). matchedBehaviours should quote or closely paraphrase the specific descriptor bullets the response provides evidence for. Keep notes under 40 words.`;

  const user = `Competency: ${competency.name}\nCompetency description: ${competency.description}\n\nDescriptors by level:\n${descriptorBlock}\n\nQuestion asked: ${question.prompt}\n\nCandidate's response:\n"""${responseText}"""\n\nReturn only the JSON object.`;

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) {
      console.warn(`[llmService] Anthropic API returned ${res.status}; falling back to heuristic evaluator.`);
      return null;
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const textBlock = data.content?.find((b) => b.type === "text")?.text;
    if (!textBlock) return null;
    const jsonMatch = textBlock.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as LLMEvidenceAssessment;
    return parsed;
  } catch (err) {
    console.warn("[llmService] LLM evaluation failed, falling back to heuristic evaluator:", err);
    return null;
  }
}
