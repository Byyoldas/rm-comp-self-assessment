// Turns an uploaded document (CV, job description, performance review, etc.)
// into low-weight "documentary" evidence candidates. Deliberately conservative:
// a keyword appearing in a document is never treated as proof of competence.
// Signal is capped low and requires multiple distinct matches plus some
// surrounding context (a sentence, not a bare list) before it counts for much.
import type { Competency, Evidence, Lang, Level } from "../../../shared/types.js";
import { keywordOverlapScore, levelVocabulary, tokenize } from "./evidenceEvaluator.js";

const LEVELS: Level[] = ["Foundational", "Intermediate", "Advanced", "Expert"];
const DOCUMENTARY_SIGNAL_CAP = 0.3;

function splitIntoChunks(text: string): string[] {
  // Split on blank lines / bullet markers / sentence boundaries so each chunk
  // has enough surrounding context to be more than a bare keyword list.
  return text
    .split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z•\-])/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 6); // ignore bare headings/labels
}

export interface DocumentaryEvidenceCandidate {
  competencyId: string;
  evidence: Evidence;
  matchedChunk: string;
}

export function extractDocumentaryEvidence(
  documentText: string,
  documentFilename: string,
  competencies: Competency[],
  lang: Lang = "en"
): DocumentaryEvidenceCandidate[] {
  const chunks = splitIntoChunks(documentText);
  const candidates: DocumentaryEvidenceCandidate[] = [];

  for (const competency of competencies) {
    const vocab = levelVocabulary(competency, lang);
    let bestChunk: { text: string; levelSignal: Partial<Record<Level, number>>; score: number } | null = null;

    for (const chunk of chunks) {
      const tokens = tokenize(chunk, lang);
      const levelSignal: Partial<Record<Level, number>> = {};
      let totalScore = 0;
      for (const level of LEVELS) {
        const overlap = keywordOverlapScore(tokens, vocab[level]);
        if (overlap > 0.15) {
          levelSignal[level] = Math.min(DOCUMENTARY_SIGNAL_CAP, overlap * DOCUMENTARY_SIGNAL_CAP);
          totalScore += overlap;
        }
      }
      if (totalScore > (bestChunk?.score ?? 0)) bestChunk = { text: chunk, levelSignal, score: totalScore };
    }

    if (bestChunk && bestChunk.score > 0.2) {
      candidates.push({
        competencyId: competency.id,
        matchedChunk: bestChunk.text,
        evidence: {
          id: `doc__${competency.id}__${Date.now()}`,
          competencyId: competency.id,
          sourceType: "documentary",
          dimension: "Knowledge",
          rawResponse: bestChunk.text,
          levelSignal: bestChunk.levelSignal,
          specificityScore: 0.3, // documentary evidence is always treated as lower-specificity than a direct, probed answer
          documentRef: documentFilename,
          createdAt: new Date().toISOString(),
        },
      });
    }
  }

  return candidates;
}
