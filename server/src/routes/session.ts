import { Router, type Request, type Response } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import type { AssessmentMode, CompetencyAssessmentState, Lang, Level, UploadedDocument } from "../../../shared/types.js";
import { allCompetencies, getLocalizedCompetency } from "../lib/framework.js";
import { extractText } from "../lib/documentExtract.js";
import { createSession, loadSession, saveSession } from "../store/sessionStore.js";
import { relevanceMap, activeCompetencyIds, maxQuestionsPerCompetency, suggestedTargetLevel } from "../engine/roleEngine.js";
import { initCompetencyState, getNextQuestion, recordAnswer, finalizeIfSufficient, applyEvidence } from "../engine/adaptiveEngine.js";
import { evaluateResponse } from "../engine/evidenceEvaluator.js";
import { findQuestion } from "../engine/questionBank.js";
import { extractDocumentaryEvidence } from "../engine/documentaryEvidence.js";
import { buildReport } from "../engine/scoringEngine.js";

export const sessionRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function requireSession(req: Request, res: Response) {
  const session = loadSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return null;
  }
  return session;
}

function maxQFn(mode: AssessmentMode) {
  return (_id: string, relevance: CompetencyAssessmentState["relevanceCurrent"]) => maxQuestionsPerCompetency(mode, relevance);
}

function computeProgress(session: ReturnType<typeof loadSession>) {
  if (!session) return { total: 0, sufficient: 0, inProgress: 0, notStarted: 0 };
  const states = Object.values(session.competencyStates);
  return {
    total: states.length,
    sufficient: states.filter((s) => s.status === "sufficient" || s.status === "skipped-low-relevance").length,
    inProgress: states.filter((s) => s.status === "in-progress").length,
    notStarted: states.filter((s) => s.status === "not-started").length,
  };
}

sessionRouter.post("/sessions", (req, res) => {
  const lang: Lang = req.body?.lang === "tr" ? "tr" : "en";
  const session = createSession(lang);
  res.json(session);
});

sessionRouter.get("/sessions/:id", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  res.json(session);
});

sessionRouter.post("/sessions/:id/mode", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { mode, targetedCompetencyIds } = req.body as { mode: AssessmentMode; targetedCompetencyIds?: string[] };
  session.mode = mode;
  session.targetedCompetencyIds = targetedCompetencyIds;
  session.step = Math.max(session.step, 2);
  saveSession(session);
  res.json(session);
});

sessionRouter.post("/sessions/:id/role", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;

  session.roleAnswers = req.body;
  const profileIds = req.body.selectedProfileIds ?? [];
  const relevance = relevanceMap(profileIds);
  const ids = activeCompetencyIds(session.mode, relevance, session.targetedCompetencyIds);

  const suggested = (suggestedTargetLevel(profileIds, req.body.yearsExperienceBand ?? "3-5 years") as Level | null) ?? undefined;
  const futureOverride = req.body.futureRoleTargetLevelOverride as Level | undefined;

  for (const id of ids) {
    if (!session.competencyStates[id]) {
      session.competencyStates[id] = initCompetencyState(id, relevance[id], relevance[id]);
    }
    if (suggested) session.competencyStates[id].targetLevelCurrentRole = session.competencyStates[id].targetLevelCurrentRole ?? suggested;
    if (req.body.targetMode !== "current" && (futureOverride || suggested)) {
      session.competencyStates[id].targetLevelFutureRole = session.competencyStates[id].targetLevelFutureRole ?? (futureOverride ?? suggested);
    }
  }

  session.step = 5;
  saveSession(session);
  res.json(session);
});

sessionRouter.get("/sessions/:id/next-question", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const activeIds = Object.keys(session.competencyStates);
  const result = getNextQuestion(session.competencyStates, activeIds, maxQFn(session.mode), session.lang);
  if (!result) {
    return res.json({ done: true, progress: computeProgress(session) });
  }
  const competency = getLocalizedCompetency(result.competencyId, session.lang);
  res.json({
    done: false,
    competencyId: result.competencyId,
    competencyName: competency.name,
    domain: competency.domain,
    question: result.question,
    progress: computeProgress(session),
  });
});

sessionRouter.post("/sessions/:id/answer", async (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { competencyId, questionId, response } = req.body as { competencyId: string; questionId: string; response: string | string[] };

  const state = session.competencyStates[competencyId];
  const question = findQuestion(competencyId, questionId, session.lang);
  if (!state || !question) return res.status(400).json({ error: "Unknown competency or question for this session" });

  const competency = getLocalizedCompetency(competencyId, session.lang);
  const evaluation = await evaluateResponse(question, competency, response, session.lang);
  const rawResponseText = Array.isArray(response) ? response.join(", ") : response;

  let newState = recordAnswer(state, question, evaluation, rawResponseText, session.lang);
  newState = finalizeIfSufficient(newState, maxQuestionsPerCompetency(session.mode, newState.relevanceCurrent));
  session.competencyStates[competencyId] = newState;
  saveSession(session);

  const next = getNextQuestion(session.competencyStates, Object.keys(session.competencyStates), maxQFn(session.mode), session.lang);
  res.json({
    state: newState,
    done: !next,
    next: next ? { competencyId: next.competencyId, question: next.question } : null,
    progress: computeProgress(session),
  });
});

sessionRouter.post("/sessions/:id/target-level", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const { competencyId, targetLevelCurrentRole, targetLevelFutureRole } = req.body as {
    competencyId: string;
    targetLevelCurrentRole?: Level;
    targetLevelFutureRole?: Level;
  };

  if (!session.competencyStates[competencyId]) {
    session.competencyStates[competencyId] = initCompetencyState(competencyId, "Medium", "Medium");
  }
  if (targetLevelCurrentRole) session.competencyStates[competencyId].targetLevelCurrentRole = targetLevelCurrentRole;
  if (targetLevelFutureRole) session.competencyStates[competencyId].targetLevelFutureRole = targetLevelFutureRole;

  saveSession(session);
  res.json(session.competencyStates[competencyId]);
});

sessionRouter.post("/sessions/:id/documents", upload.single("file"), async (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  let text: string;
  try {
    text = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : "Failed to extract text from file" });
  }

  const doc: UploadedDocument = {
    id: randomUUID(),
    filename: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    extractedText: text,
    uploadedAt: new Date().toISOString(),
  };
  session.documents.push(doc);

  const targetCompetencyIds = Object.keys(session.competencyStates);
  const targetCompetencies = (targetCompetencyIds.length > 0 ? targetCompetencyIds : allCompetencies().map((c) => c.id)).map((id) =>
    getLocalizedCompetency(id, session.lang)
  );
  const candidates = extractDocumentaryEvidence(text, doc.filename, targetCompetencies, session.lang);

  for (const candidate of candidates) {
    if (!session.competencyStates[candidate.competencyId]) {
      session.competencyStates[candidate.competencyId] = initCompetencyState(candidate.competencyId, "Medium", "Medium");
    }
    session.competencyStates[candidate.competencyId] = applyEvidence(
      session.competencyStates[candidate.competencyId],
      candidate.evidence,
      null,
      session.lang
    );
  }

  saveSession(session);
  res.json({
    document: doc,
    evidenceAdded: candidates.length,
    affectedCompetencies: candidates.map((c) => c.competencyId),
    session,
  });
});

sessionRouter.post("/sessions/:id/complete", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  session.completed = true;
  session.step = 12;
  saveSession(session);
  res.json(session);
});

sessionRouter.get("/sessions/:id/report", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  res.json(buildReport(session));
});

sessionRouter.get("/sessions/:id/export.json", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const report = buildReport(session);
  res.setHeader("Content-Disposition", `attachment; filename="rm-comp-assessment-${session.id}.json"`);
  res.json({ session, report });
});

const CSV_HEADERS: Record<Lang, string[]> = {
  en: [
    "Domain",
    "Competency",
    "Relevance (current role)",
    "Relevance (target role)",
    "Current Level",
    "Target Level (current role)",
    "Target Level (future role)",
    "Confidence",
    "Evidence Strength",
    "Conclusion Status",
    "Contradiction Flagged",
  ],
  tr: [
    "Alan",
    "Yetkinlik",
    "İlgililik (mevcut rol)",
    "İlgililik (hedef rol)",
    "Mevcut Düzey",
    "Hedef Düzey (mevcut rol)",
    "Hedef Düzey (gelecek rol)",
    "Güven",
    "Kanıt Gücü",
    "Sonuç Durumu",
    "Çelişki İşaretlendi mi",
  ],
};

sessionRouter.get("/sessions/:id/export.csv", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  const report = buildReport(session);
  const header = CSV_HEADERS[session.lang];
  const yes = session.lang === "tr" ? "Evet" : "Yes";
  const no = session.lang === "tr" ? "Hayır" : "No";
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = report.rows.map((r) =>
    [
      r.domain,
      r.competencyName,
      r.relevanceCurrent,
      r.relevanceTarget,
      r.currentLevel ?? "",
      r.targetLevelCurrentRole ?? "",
      r.targetLevelFutureRole ?? "",
      r.confidence,
      r.evidenceStrength,
      r.conclusionStatus,
      r.contradictionFlag ? yes : no,
    ]
      .map(escape)
      .join(",")
  );
  const csv = [header.map(escape).join(","), ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="rm-comp-assessment-${session.id}.csv"`);
  res.send(csv);
});
