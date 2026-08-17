import { useState } from "react";
import type { AssessmentMode, AssessmentSession, Framework, Lang } from "../../../shared/types";
import { STRINGS } from "../i18n/strings";

export default function ModeSelect({
  lang,
  session,
  framework,
  onNext,
}: {
  lang: Lang;
  session: AssessmentSession;
  framework: Framework;
  onNext: (mode: AssessmentMode, targetedIds?: string[]) => void;
}) {
  const s = STRINGS[lang].mode;
  const [mode, setMode] = useState<AssessmentMode>(session.mode ?? "standard");
  const [selected, setSelected] = useState<Set<string>>(new Set(session.targetedCompetencyIds ?? []));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">{s.title}</h1>
      <p className="text-slate-500 mb-6">{s.subtitle}</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {s.modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={"card p-4 text-left transition-all " + (mode === m.id ? "ring-2 ring-brand-500 border-brand-300" : "hover:border-slate-300")}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800">{m.title}</span>
              <span className="text-xs text-slate-400">{m.time}</span>
            </div>
            <p className="text-sm text-slate-500">{m.desc}</p>
          </button>
        ))}
      </div>

      {mode === "targeted" && (
        <div className="card p-4 mb-8">
          <h3 className="font-semibold text-slate-800 mb-3">{s.targetedHeading(selected.size)}</h3>
          <div className="max-h-80 overflow-y-auto space-y-4">
            {framework.meta.domains.map((domain) => (
              <div key={domain.id}>
                <div className="text-xs font-semibold uppercase text-slate-400 mb-1">{domain.name}</div>
                <div className="flex flex-wrap gap-2">
                  {framework.competencies
                    .filter((c) => c.domain === domain.id)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggle(c.id)}
                        className={
                          "pill border cursor-pointer " +
                          (selected.has(c.id) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-300 hover:border-brand-300")
                        }
                      >
                        {c.name}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn-primary px-6 py-2.5"
        disabled={mode === "targeted" && selected.size === 0}
        onClick={() => onNext(mode, mode === "targeted" ? Array.from(selected) : undefined)}
      >
        {s.continue}
      </button>
    </div>
  );
}
