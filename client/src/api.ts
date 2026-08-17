import type {
  AdminSessionSummary,
  AssessmentMode,
  AssessmentReport,
  AssessmentSession,
  Framework,
  Lang,
  Level,
  Question,
  RoleProfilesFile,
  UserRoleAnswers,
} from "../../shared/types";

const BASE = "/api";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: init?.body && !(init.body instanceof FormData) ? { "content-type": "application/json", ...init.headers } : init?.headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => req<{ ok: boolean; llmEnabled: boolean }>("/health"),
  getFramework: (lang: Lang = "en") => req<Framework>(`/framework?lang=${lang}`),
  getRoleProfiles: (lang: Lang = "en") => req<RoleProfilesFile>(`/role-profiles?lang=${lang}`),
  getFidelity: () => req<Record<string, unknown>>("/fidelity"),

  createSession: (lang: Lang = "en", participantName?: string) =>
    req<AssessmentSession>("/sessions", { method: "POST", body: JSON.stringify({ lang, participantName }) }),
  getSession: (id: string) => req<AssessmentSession>(`/sessions/${id}`),

  setMode: (id: string, mode: AssessmentMode, targetedCompetencyIds?: string[]) =>
    req<AssessmentSession>(`/sessions/${id}/mode`, { method: "POST", body: JSON.stringify({ mode, targetedCompetencyIds }) }),

  submitRole: (id: string, roleAnswers: Partial<UserRoleAnswers>) =>
    req<AssessmentSession>(`/sessions/${id}/role`, { method: "POST", body: JSON.stringify(roleAnswers) }),

  nextQuestion: (id: string) =>
    req<{ done: boolean; competencyId?: string; competencyName?: string; domain?: string; question?: Question; progress: { total: number; sufficient: number; inProgress: number; notStarted: number } }>(
      `/sessions/${id}/next-question`
    ),

  answer: (id: string, competencyId: string, questionId: string, response: string | string[]) =>
    req<{
      state: AssessmentSession["competencyStates"][string];
      done: boolean;
      next: { competencyId: string; question: Question } | null;
      progress: { total: number; sufficient: number; inProgress: number; notStarted: number };
    }>(`/sessions/${id}/answer`, { method: "POST", body: JSON.stringify({ competencyId, questionId, response }) }),

  setTargetLevel: (id: string, competencyId: string, targetLevelCurrentRole?: Level, targetLevelFutureRole?: Level) =>
    req(`/sessions/${id}/target-level`, { method: "POST", body: JSON.stringify({ competencyId, targetLevelCurrentRole, targetLevelFutureRole }) }),

  uploadDocument: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return req<{ document: unknown; evidenceAdded: number; affectedCompetencies: string[]; session: AssessmentSession }>(
      `/sessions/${id}/documents`,
      { method: "POST", body: form }
    );
  },

  complete: (id: string) => req<AssessmentSession>(`/sessions/${id}/complete`, { method: "POST" }),
  getReport: (id: string) => req<AssessmentReport>(`/sessions/${id}/report`),

  exportJsonUrl: (id: string) => `${BASE}/sessions/${id}/export.json`,
  exportCsvUrl: (id: string) => `${BASE}/sessions/${id}/export.csv`,

  admin: {
    listSessions: (token: string) => req<AdminSessionSummary[]>(`/admin/sessions?token=${encodeURIComponent(token)}`),
    exportAllJsonUrl: (token: string) => `${BASE}/admin/export.json?token=${encodeURIComponent(token)}`,
    exportAllCsvUrl: (token: string) => `${BASE}/admin/export.csv?token=${encodeURIComponent(token)}`,
  },
};
