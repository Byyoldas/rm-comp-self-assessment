import { useEffect, useState, useCallback } from "react";
import type { AssessmentSession, Framework, Lang, RoleProfilesFile } from "../../shared/types";
import { api } from "./api";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";
import ModeSelect from "./pages/ModeSelect";
import RoleProfile from "./pages/RoleProfile";
import DocumentUpload from "./pages/DocumentUpload";
import Questioning from "./pages/Questioning";
import Dashboard from "./pages/Dashboard";
import GapAnalysis from "./pages/GapAnalysis";
import Report from "./pages/Report";

export const PAGE_ORDER = ["welcome", "mode", "role", "documents", "questioning", "dashboard", "gaps", "report"] as const;
export type Page = (typeof PAGE_ORDER)[number];

const SESSION_KEY = "rmcomp_session_id";
const LANG_KEY = "rmcomp_lang";

export default function App() {
  const [page, setPage] = useState<Page>("welcome");
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem(LANG_KEY) === "tr" ? "tr" : "en"));
  const [framework, setFramework] = useState<Framework | null>(null);
  const [roleProfiles, setRoleProfiles] = useState<RoleProfilesFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocalizedData = useCallback(async (l: Lang) => {
    const [fw, rp] = await Promise.all([api.getFramework(l), api.getRoleProfiles(l)]);
    setFramework(fw);
    setRoleProfiles(rp);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const savedId = localStorage.getItem(SESSION_KEY);
        let activeLang = lang;

        if (savedId) {
          try {
            const s = await api.getSession(savedId);
            activeLang = s.lang;
            setLangState(s.lang);
            localStorage.setItem(LANG_KEY, s.lang);
            setSession(s);
            setPage(s.completed ? "report" : Object.keys(s.competencyStates).length > 0 ? (s.step >= 8 ? "dashboard" : "questioning") : s.roleAnswers ? "documents" : "welcome");
          } catch {
            localStorage.removeItem(SESSION_KEY);
          }
        }

        await loadLocalizedData(activeLang);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load the assessment framework from the server.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeLang = useCallback(
    async (l: Lang) => {
      if (l === lang || session) return; // locked once a session exists
      setLangState(l);
      localStorage.setItem(LANG_KEY, l);
      await loadLocalizedData(l);
    },
    [lang, session, loadLocalizedData]
  );

  const refreshSession = useCallback(async () => {
    if (!session) return;
    const s = await api.getSession(session.id);
    setSession(s);
    return s;
  }, [session]);

  const startNewSession = useCallback(
    async (participantName: string) => {
      const s = await api.createSession(lang, participantName);
      localStorage.setItem(SESSION_KEY, s.id);
      setSession(s);
      setPage("mode");
    },
    [lang]
  );

  const resetSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setPage("welcome");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading the RM Comp assessment framework…
      </div>
    );
  }

  if (error || !framework || !roleProfiles) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="card p-6 max-w-md text-center">
          <p className="text-red-600 font-medium mb-2">Couldn't reach the assessment server.</p>
          <p className="text-sm text-slate-500">{error ?? "Unknown error"}</p>
          <p className="text-sm text-slate-400 mt-3">Make sure the server is running (`npm run dev` in /server) on port 4000.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout page={page} lang={lang} onChangeLang={changeLang} langLocked={Boolean(session)} completed={session?.completed ?? false} onReset={resetSession}>
      {page === "welcome" && <Welcome lang={lang} onStart={startNewSession} />}
      {page === "mode" && session && (
        <ModeSelect lang={lang} session={session} framework={framework} onNext={async (mode, targetedIds) => {
          const s = await api.setMode(session.id, mode, targetedIds);
          setSession(s);
          setPage("role");
        }} />
      )}
      {page === "role" && session && (
        <RoleProfile
          lang={lang}
          session={session}
          roleProfiles={roleProfiles}
          onNext={async (answers) => {
            const s = await api.submitRole(session.id, answers);
            setSession(s);
            setPage("documents");
          }}
          onBack={() => setPage("mode")}
        />
      )}
      {page === "documents" && session && (
        <DocumentUpload
          lang={lang}
          session={session}
          onNext={async () => {
            await refreshSession();
            setPage("questioning");
          }}
          onBack={() => setPage("role")}
        />
      )}
      {page === "questioning" && session && (
        <Questioning
          lang={lang}
          session={session}
          framework={framework}
          onDone={async () => {
            await refreshSession();
            setPage("dashboard");
          }}
        />
      )}
      {page === "dashboard" && session && (
        <Dashboard lang={lang} session={session} framework={framework} onNext={() => setPage("gaps")} onBack={() => setPage("questioning")} onRefresh={refreshSession} />
      )}
      {page === "gaps" && session && (
        <GapAnalysis
          lang={lang}
          session={session}
          framework={framework}
          onNext={async () => {
            const s = await api.complete(session.id);
            setSession(s);
            setPage("report");
          }}
          onBack={() => setPage("dashboard")}
        />
      )}
      {page === "report" && session && <Report lang={lang} session={session} framework={framework} onBackToDashboard={() => setPage("dashboard")} onStartOver={resetSession} />}
    </Layout>
  );
}
