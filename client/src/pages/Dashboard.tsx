import { useEffect, useState } from "react";
import type { AssessmentReport, AssessmentSession, Framework, Lang } from "../../../shared/types";
import { api } from "../api";
import Heatmap from "../components/Heatmap";
import CurrentTargetBar from "../components/CurrentTargetBar";
import { levelBadgeClass, levelLabel } from "../lib/levelColors";
import { STRINGS } from "../i18n/strings";

export default function Dashboard({
  lang,
  session,
  framework,
  onNext,
  onBack,
  onRefresh,
}: {
  lang: Lang;
  session: AssessmentSession;
  framework: Framework;
  onNext: () => void;
  onBack: () => void;
  onRefresh: () => Promise<AssessmentSession | undefined>;
}) {
  const s = STRINGS[lang].dashboard;
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await onRefresh();
      const r = await api.getReport(session.id);
      setReport(r);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  if (loading || !report) return <div className="text-center py-20 text-slate-400">{s.loading}</div>;

  const withTarget = report.rows.filter((r) => r.targetLevelCurrentRole || r.targetLevelFutureRole);
  const demonstrated = report.rows.filter((r) => r.conclusionStatus === "demonstrated");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{s.heading}</h1>
        <p className="text-slate-500">{report.executiveSummary}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{report.rows.length}</div>
          <div className="text-xs text-slate-500">{s.statCompetencies}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{demonstrated.length}</div>
          <div className="text-xs text-slate-500">{s.statDefensible}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{report.topDevelopmentPriorities.filter((g) => g.priority === "High").length}</div>
          <div className="text-xs text-slate-500">{s.statHighPriority}</div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-4">{s.heatmapHeading}</h3>
        <Heatmap rows={report.rows} domains={framework.meta.domains} lang={lang} />
      </div>

      {withTarget.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-1">{s.currentVsTargetHeading}</h3>
          <p className="text-xs text-slate-400 mb-4">{s.currentVsTargetSubtitle}</p>
          <div className="space-y-3">
            {withTarget.map((r) => (
              <div key={r.competencyId} className="flex items-center gap-4">
                <div className="w-56 shrink-0 text-sm text-slate-700 truncate" title={r.competencyName}>
                  {r.competencyName}
                </div>
                <CurrentTargetBar current={r.currentLevel} target={r.targetLevelCurrentRole ?? r.targetLevelFutureRole} compact lang={lang} />
                <span className={"pill " + levelBadgeClass(r.currentLevel)}>{r.currentLevel ? levelLabel(r.currentLevel, lang) : STRINGS[lang].common.dash}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.topStrengths.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">{s.strengthsHeading}</h3>
          <ul className="space-y-1 text-sm text-slate-600 list-disc list-inside">
            {report.topStrengths.map((str) => (
              <li key={str}>{str}</li>
            ))}
          </ul>
        </div>
      )}

      {report.uncertaintyNotes.length > 0 && (
        <div className="card p-5 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-2">{s.uncertaintyHeading}</h3>
          <ul className="space-y-1 text-sm text-amber-700 list-disc list-inside">
            {report.uncertaintyNotes.slice(0, 8).map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <button className="btn-secondary" onClick={onBack}>
          {s.backToQuestions}
        </button>
        <button className="btn-primary px-6" onClick={onNext}>
          {s.seeGaps}
        </button>
      </div>
    </div>
  );
}
