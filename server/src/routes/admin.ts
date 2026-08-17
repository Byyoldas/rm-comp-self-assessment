// Admin endpoints for collecting multiple colleagues' submissions in one place.
// Gated by ADMIN_TOKEN (set in server/.env) — without it configured, these routes
// refuse to serve anything. Per-person routes (/api/sessions/:id/*) are NOT gated
// here; a session id is that person's own private key to their own results, same
// as the rest of the app. Only the LIST and combined-export views (which reveal
// everyone's results together) require the admin token.
import { Router, type Request, type Response } from "express";
import type { AdminSessionSummary } from "../../../shared/types.js";
import { listSessions } from "../store/sessionStore.js";
import { buildReport } from "../engine/scoringEngine.js";

export const adminRouter = Router();

function checkToken(req: Request, res: Response): boolean {
  const configured = process.env.ADMIN_TOKEN;
  if (!configured) {
    res.status(503).json({ error: "Admin dashboard is disabled: set ADMIN_TOKEN in the server's .env to enable it." });
    return false;
  }
  const provided = (req.query.token as string | undefined) ?? req.header("x-admin-token");
  if (provided !== configured) {
    res.status(401).json({ error: "Invalid or missing admin token." });
    return false;
  }
  return true;
}

function summarize(session: ReturnType<typeof listSessions>[number]): AdminSessionSummary {
  const report = buildReport(session);
  return {
    id: session.id,
    participantName: session.participantName || "(no name given)",
    jobTitle: session.roleAnswers?.jobTitle,
    organisationType: session.roleAnswers?.organisationType,
    lang: session.lang,
    mode: session.mode,
    completed: session.completed,
    step: session.step,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    competencyCount: report.rows.length,
    demonstratedCount: report.rows.filter((r) => r.conclusionStatus === "demonstrated").length,
    highPriorityGapCount: report.topDevelopmentPriorities.filter((g) => g.priority === "High").length,
  };
}

adminRouter.get("/admin/sessions", (req, res) => {
  if (!checkToken(req, res)) return;
  const summaries = listSessions()
    .map(summarize)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json(summaries);
});

adminRouter.get("/admin/export.json", (req, res) => {
  if (!checkToken(req, res)) return;
  const sessions = listSessions();
  const combined = sessions.map((session) => ({ summary: summarize(session), report: buildReport(session) }));
  res.setHeader("Content-Disposition", `attachment; filename="rm-comp-all-submissions-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json(combined);
});

adminRouter.get("/admin/export.csv", (req, res) => {
  if (!checkToken(req, res)) return;
  const sessions = listSessions();

  const header = [
    "Participant",
    "Job Title",
    "Organisation Type",
    "Language",
    "Mode",
    "Completed",
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
  ];
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const rows: string[] = [];
  for (const session of sessions) {
    const report = buildReport(session);
    for (const r of report.rows) {
      rows.push(
        [
          session.participantName || "(no name given)",
          session.roleAnswers?.jobTitle ?? "",
          session.roleAnswers?.organisationType ?? "",
          session.lang,
          session.mode,
          session.completed ? "Yes" : "No",
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
          r.contradictionFlag ? "Yes" : "No",
        ]
          .map(escape)
          .join(",")
      );
    }
  }

  const csv = [header.map(escape).join(","), ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="rm-comp-all-submissions-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});
