import { useCallback, useEffect, useState } from "react";
import type { AdminSessionSummary } from "../../../shared/types";
import { api } from "../api";

const TOKEN_KEY = "rmcomp_admin_token";

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [tokenInput, setTokenInput] = useState(token);
  const [sessions, setSessions] = useState<AdminSessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (t: string) => {
    if (!t) return;
    setLoading(true);
    setError(null);
    try {
      const list = await api.admin.listSessions(t);
      setSessions(list);
      localStorage.setItem(TOKEN_KEY, t);
    } catch (e) {
      setSessions(null);
      localStorage.removeItem(TOKEN_KEY);
      setError(e instanceof Error ? e.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitToken = () => {
    setToken(tokenInput);
    load(tokenInput);
  };

  const logOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setTokenInput("");
    setSessions(null);
  };

  if (!sessions) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card p-6 max-w-sm w-full">
          <h1 className="text-lg font-semibold text-slate-800 mb-1">RM Comp Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mb-4">Enter the admin token configured in the server's <code>.env</code> (<code>ADMIN_TOKEN</code>).</p>
          <input
            type="password"
            className="input mb-3"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Admin token"
            onKeyDown={(e) => e.key === "Enter" && submitToken()}
            autoFocus
          />
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <button className="btn-primary w-full" disabled={loading || !tokenInput} onClick={submitToken}>
            {loading ? "Checking…" : "View dashboard"}
          </button>
        </div>
      </div>
    );
  }

  const completedCount = sessions.filter((s) => s.completed).length;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-slate-800">RM Comp Admin Dashboard</h1>
            <p className="text-xs text-slate-400">
              {sessions.length} submission{sessions.length === 1 ? "" : "s"} · {completedCount} completed
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-xs" onClick={() => load(token)} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <a className="btn-secondary text-xs" href={api.admin.exportAllCsvUrl(token)}>
              Export all (CSV)
            </a>
            <a className="btn-secondary text-xs" href={api.admin.exportAllJsonUrl(token)}>
              Export all (JSON)
            </a>
            <button className="btn-ghost text-xs" onClick={logOut}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {sessions.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">No submissions on this server yet.</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-200">
                  <th className="py-2 px-3">Participant</th>
                  <th className="py-2 px-3">Job Title</th>
                  <th className="py-2 px-3">Lang</th>
                  <th className="py-2 px-3">Mode</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Competencies</th>
                  <th className="py-2 px-3">High-priority gaps</th>
                  <th className="py-2 px-3">Updated</th>
                  <th className="py-2 px-3">Export</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 px-3 text-slate-700 font-medium">{s.participantName}</td>
                    <td className="py-2 px-3 text-slate-600">{s.jobTitle || "—"}</td>
                    <td className="py-2 px-3 text-slate-500 uppercase text-xs">{s.lang}</td>
                    <td className="py-2 px-3 text-slate-500">{s.mode}</td>
                    <td className="py-2 px-3">
                      <span className={"pill " + (s.completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                        {s.completed ? "Completed" : "In progress"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {s.demonstratedCount} / {s.competencyCount}
                    </td>
                    <td className="py-2 px-3 text-slate-600">{s.highPriorityGapCount}</td>
                    <td className="py-2 px-3 text-slate-400 text-xs">{new Date(s.updatedAt).toLocaleString()}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <a className="text-brand-600 hover:underline text-xs mr-2" href={api.exportJsonUrl(s.id)}>
                        JSON
                      </a>
                      <a className="text-brand-600 hover:underline text-xs" href={api.exportCsvUrl(s.id)}>
                        CSV
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-4">
          This page lists every assessment stored on this server, including in-progress ones. Keep the admin token
          private — anyone with it can see everyone's results.
        </p>
      </main>
    </div>
  );
}
