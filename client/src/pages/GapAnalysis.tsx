import { useEffect, useState } from "react";
import type { AssessmentReport, AssessmentSession, DevelopmentGap, Framework, Lang, Priority } from "../../../shared/types";
import { api } from "../api";
import { levelLabel } from "../lib/levelColors";
import { STRINGS } from "../i18n/strings";

const PRIORITY_STYLES: Record<Priority, string> = {
  High: "bg-red-50 border-red-200 text-red-700",
  Medium: "bg-amber-50 border-amber-200 text-amber-700",
  Low: "bg-slate-50 border-slate-200 text-slate-600",
  "N/A": "bg-slate-50 border-slate-200 text-slate-400",
};

function GapCard({ gap, competencyName, lang }: { gap: DevelopmentGap; competencyName: string; lang: Lang }) {
  const s = STRINGS[lang].gaps;
  const priorityLabel = gap.priority === "N/A" ? gap.priority : s.priorityLabels[gap.priority];
  return (
    <div className={"card p-4 border " + PRIORITY_STYLES[gap.priority]}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-slate-800">{competencyName}</h4>
        <span className="pill bg-white border border-current text-xs">{priorityLabel}</span>
      </div>
      <p className="text-sm text-slate-600 mb-2">
        <span className="font-medium">{gap.currentLevel ? levelLabel(gap.currentLevel, lang) : s.notYetDemonstrated}</span>{" "}
        {s.arrowToTarget(levelLabel(gap.targetLevel, lang))}
      </p>
      <p className="text-xs text-slate-500 mb-3">{gap.why}</p>
      {gap.missingBehaviours.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">{s.notYetDemonstrated}</div>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
            {gap.missingBehaviours.slice(0, 3).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
      {gap.developmentFocus.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-1">{s.developmentFocus}</div>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
            {gap.developmentFocus.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase mb-1">{s.suggestedEvidence}</div>
        <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
          {gap.suggestedEvidence.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function GapAnalysis({
  lang,
  session,
  framework,
  onNext,
  onBack,
}: {
  lang: Lang;
  session: AssessmentSession;
  framework: Framework;
  onNext: () => void;
  onBack: () => void;
}) {
  const s = STRINGS[lang].gaps;
  const [report, setReport] = useState<AssessmentReport | null>(null);

  useEffect(() => {
    api.getReport(session.id).then(setReport);
  }, [session.id]);

  if (!report) return <div className="text-center py-20 text-slate-400">{s.loading}</div>;

  const byPriority: Record<Priority, DevelopmentGap[]> = { High: [], Medium: [], Low: [], "N/A": [] };
  for (const gap of report.topDevelopmentPriorities) byPriority[gap.priority].push(gap);

  const nameOf = (id: string) => framework.competencies.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{s.heading}</h1>
        <p className="text-slate-500">{s.subtitle}</p>
      </div>

      {report.topDevelopmentPriorities.length === 0 ? (
        <div className="card p-6 text-center text-slate-500">{s.noGaps}</div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4">
          {(["High", "Medium", "Low"] as const).map((p) => (
            <div key={p} className="space-y-3">
              <div className="text-xs font-semibold uppercase text-slate-400">{s.priorityHeading(s.priorityLabels[p], byPriority[p].length)}</div>
              {byPriority[p].map((g) => (
                <GapCard key={g.competencyId} gap={g} competencyName={nameOf(g.competencyId)} lang={lang} />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <button className="btn-secondary" onClick={onBack}>
          {s.back}
        </button>
        <button className="btn-primary px-6" onClick={onNext}>
          {s.generateReport}
        </button>
      </div>
    </div>
  );
}
