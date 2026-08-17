// File-based session persistence: no database. Each session is one JSON file
// under server/data/sessions/<id>.json. This is what makes "pause and continue"
// work — the client only needs to remember the session id (kept in localStorage).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import type { AssessmentSession, Lang } from "../../../shared/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.resolve(__dirname, "../../data/sessions");

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

function sessionPath(id: string): string {
  if (!/^[a-zA-Z0-9-]+$/.test(id)) throw new Error("Invalid session id");
  return path.join(SESSIONS_DIR, `${id}.json`);
}

export function createSession(lang: Lang = "en", participantName?: string): AssessmentSession {
  const now = new Date().toISOString();
  const session: AssessmentSession = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    step: 1,
    lang,
    participantName: participantName?.trim() || undefined,
    mode: "standard",
    documents: [],
    competencyStates: {},
    completed: false,
  };
  saveSession(session);
  return session;
}

export function loadSession(id: string): AssessmentSession | null {
  const p = sessionPath(id);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export function saveSession(session: AssessmentSession): void {
  session.updatedAt = new Date().toISOString();
  fs.writeFileSync(sessionPath(session.id), JSON.stringify(session, null, 2));
}

export function listSessionIds(): string[] {
  return fs.readdirSync(SESSIONS_DIR).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
}

/** Loads every session on disk. Skips (and logs) any file that fails to parse rather than failing the whole listing. */
export function listSessions(): AssessmentSession[] {
  const sessions: AssessmentSession[] = [];
  for (const id of listSessionIds()) {
    try {
      const session = loadSession(id);
      if (session) sessions.push(session);
    } catch (err) {
      console.warn(`[sessionStore] Failed to load session ${id}, skipping:`, err);
    }
  }
  return sessions;
}
