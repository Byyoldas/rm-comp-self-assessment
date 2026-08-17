import { useEffect, useState } from "react";
import type { AssessmentReport, AssessmentSession, Framework, Lang } from "../../../shared/types";
import { api } from "../api";
import { levelBadgeClass, levelLabel } from "../lib/levelColors";
import { experienceBandLabel } from "../lib/experienceBand";
import { STRINGS } from "../i18n/strings";

const TARGET_MODE_LABEL: Record<Lang, Record<"current" | "future" | "both", string>> = {
  en: { current: "Current role requirements", future: "Future role requirements", both: "Current and future role requirements" },
  tr: { current: "Mevcut rol gereksinimleri", future: "Gelecekteki rol gereksinimleri", both: "Mevcut ve gelecekteki rol gereksinimleri" },
};

export default function Report({
  lang,
  session,
  framework,
  onBackToDashboard,
  onStartOver,
}: {
  lang: Lang;
  session: AssessmentSession;
  framework: Framework;
  onBackToDashboard: () => void;
  onStartOver: () => void;
}) {
  const s = STRINGS[lang].report;
  const [report, setReport] = useState<AssessmentReport | null>(null);

  useEffect(() => {
    api.getReport(session.id).then(setReport);
  }, [session.id]);

  if (!report) return <div className="text-center py-20 text-slate-400">{s.loading}</div>;

  const domainName = (id: string) => framework.meta.domains.find((d) => d.id === id)?.name ?? id;
  const ra = report.roleAnswers;

  return (
    <div className="space-y-8">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{s.heading}</h1>
          <p className="text-xs text-slate-400">{s.generatedAt(new Date(report.generatedAt).toLocaleString(lang === "tr" ? "tr-TR" : "en-US"), report.mode)}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => window.print()}>
            {s.print}
          </button>
          <a className="btn-secondary" href={api.exportJsonUrl(session.id)}>
            {s.exportJson}
          </a>
          <a className="btn-secondary" href={api.exportCsvUrl(session.id)}>
            {s.exportCsv}
          </a>
        </div>
      </div>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{s.executiveSummary}</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{report.executiveSummary}</p>
      </section>

      {ra && (
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">{s.roleProfile}</h2>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-400">{s.jobTitleLabel}</dt>
              <dd className="text-slate-700">{ra.jobTitle}</dd>
            </div>
            <div>
              <dt className="text-slate-400">{s.orgTypeLabel}</dt>
              <dd className="text-slate-700">{ra.organisationType || STRINGS[lang].common.dash}</dd>
            </div>
            <div>
              <dt className="text-slate-400">{s.experienceLabel}</dt>
              <dd className="text-slate-700">{experienceBandLabel(ra.yearsExperienceBand, lang)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">{s.assessedAgainstLabel}</dt>
              <dd className="text-slate-700">{TARGET_MODE_LABEL[lang][ra.targetMode]}</dd>
            </div>
          </dl>
          <p className="text-sm text-slate-600 mt-3">{ra.responsibilitiesFreeText}</p>
        </section>
      )}

      <section className="card p-6 print-break">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{s.competencyProfile}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-200">
                <th className="py-2 pr-3">{s.tableHeaders.competency}</th>
                <th className="py-2 pr-3">{s.tableHeaders.current}</th>
                <th className="py-2 pr-3">{s.tableHeaders.target}</th>
                <th className="py-2 pr-3">{s.tableHeaders.confidence}</th>
                <th className="py-2 pr-3">{s.tableHeaders.evidence}</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((r) => (
                <tr key={r.competencyId} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-3 text-slate-700">{r.competencyName}</td>
                  <td className="py-2 pr-3">
                    <span className={"pill " + levelBadgeClass(r.currentLevel)}>{r.currentLevel ? levelLabel(r.currentLevel, lang) : STRINGS[lang].dashboard.insufficientEvidence}</span>
                  </td>
                  <td className="py-2 pr-3 text-slate-600">
                    {r.targetLevelCurrentRole ? levelLabel(r.targetLevelCurrentRole, lang) : r.targetLevelFutureRole ? levelLabel(r.targetLevelFutureRole, lang) : STRINGS[lang].common.dash}
                  </td>
                  <td className="py-2 pr-3 text-slate-600">{r.confidence}</td>
                  <td className="py-2 pr-3 text-slate-600">{r.evidenceStrength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{s.domainAnalysis}</h2>
        <div className="space-y-3">
          {framework.meta.domains.map((d) => {
            const summary = report.domainSummaries[d.id];
            if (!summary || (summary.strengths.length === 0 && summary.gaps.length === 0)) return null;
            return (
              <div key={d.id}>
                <h3 className="text-sm font-semibold text-slate-700">{domainName(d.id)}</h3>
                {summary.strengths.length > 0 && (
                  <p className="text-sm text-slate-600">
                    {s.strengthsPrefix}: {summary.strengths.join(", ")}
                  </p>
                )}
                {summary.gaps.length > 0 && (
                  <p className="text-sm text-slate-600">
                    {s.gapsPrefix}: {summary.gaps.join("; ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{s.topStrengths}</h2>
        {report.topStrengths.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {report.topStrengths.map((str) => (
              <li key={str}>{str}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">{s.noStrengths}</p>
        )}
      </section>

      <section className="card p-6 print-break">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{s.careerMap}</h2>
        {report.topDevelopmentPriorities.length > 0 ? (
          <ol className="space-y-3 text-sm">
            {report.topDevelopmentPriorities.map((g, i) => (
              <li key={g.competencyId} className="border-l-2 border-brand-300 pl-3">
                <span className="font-medium text-slate-800">
                  {i + 1}. {framework.competencies.find((c) => c.id === g.competencyId)?.name}
                </span>{" "}
                <span className="text-slate-500">
                  ({g.currentLevel ? levelLabel(g.currentLevel, lang) : STRINGS[lang].dashboard.insufficientEvidence} {STRINGS[lang].gaps.arrowToTarget(levelLabel(g.targetLevel, lang))}, {STRINGS[lang].gaps.priorityLabels[g.priority === "N/A" ? "Low" : g.priority]})
                </span>
                <p className="text-slate-600">{g.developmentFocus[0]}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">{s.noCareerGaps}</p>
        )}
      </section>

      <section className="card p-6 bg-amber-50 border-amber-200">
        <h2 className="text-lg font-semibold text-amber-800 mb-3">{s.uncertainty}</h2>
        {report.uncertaintyNotes.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {report.uncertaintyNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-amber-700">{s.noUncertainty}</p>
        )}
      </section>

      <div className="no-print flex justify-between">
        <button className="btn-secondary" onClick={onBackToDashboard}>
          {s.backToDashboard}
        </button>
        <button className="btn-ghost" onClick={onStartOver}>
          {s.startOver}
        </button>
      </div>
    </div>
  );
}
