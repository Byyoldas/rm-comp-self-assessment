import { useEffect, useState } from "react";
import type { AssessmentSession, Framework, Lang, Question } from "../../../shared/types";
import { api } from "../api";
import { STRINGS } from "../i18n/strings";

interface Loaded {
  competencyId: string;
  competencyName: string;
  domain: string;
  question: Question;
}

export default function Questioning({ lang, session, framework, onDone }: { lang: Lang; session: AssessmentSession; framework: Framework; onDone: () => void }) {
  const s = STRINGS[lang].questioning;
  const [current, setCurrent] = useState<Loaded | null>(null);
  const [progress, setProgress] = useState({ total: 0, sufficient: 0, inProgress: 0, notStarted: 0 });
  const [textResponse, setTextResponse] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const domainName = (id: string) => framework.meta.domains.find((d) => d.id === id)?.name ?? id;

  const loadNext = async () => {
    setLoading(true);
    setTextResponse("");
    setSelected(null);
    try {
      const res = await api.nextQuestion(session.id);
      setProgress(res.progress);
      if (res.done || !res.question || !res.competencyId) {
        onDone();
        return;
      }
      setCurrent({ competencyId: res.competencyId, competencyName: res.competencyName!, domain: res.domain!, question: res.question });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load the next question");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!current) return;
    const q = current.question;
    const response = q.responseFormat === "single-select" || q.responseFormat === "frequency-select" ? selected : textResponse;
    if (!response || (typeof response === "string" && response.trim().length === 0)) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.answer(session.id, current.competencyId, q.id, response);
      setProgress(res.progress);
      if (res.done || !res.next) {
        onDone();
        return;
      }
      const competency = framework.competencies.find((c) => c.id === res.next!.competencyId)!;
      setCurrent({ competencyId: res.next.competencyId, competencyName: competency.name, domain: competency.domain, question: res.next.question });
      setTextResponse("");
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit your answer");
    } finally {
      setSubmitting(false);
    }
  };

  const percent = progress.total > 0 ? Math.round((progress.sufficient / progress.total) * 100) : 0;

  if (loading && !current) {
    return <div className="text-center py-20 text-slate-400">{s.loadingNext}</div>;
  }

  if (!current) return null;
  const q = current.question;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>{s.coveredLabel(progress.sufficient, progress.total)}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="pill bg-slate-100 text-slate-600">{domainName(current.domain)}</span>
          <span className="pill bg-brand-50 text-brand-700">{current.competencyName}</span>
        </div>

        <p className="text-lg text-slate-900 font-medium leading-snug mb-2">{q.prompt}</p>
        {q.guidance && <p className="text-sm text-slate-500 mb-4">{q.guidance}</p>}

        <details className="mb-4 text-xs text-slate-400">
          <summary className="cursor-pointer hover:text-slate-600">{s.whyLabel}</summary>
          <p className="mt-1">{q.why}</p>
        </details>

        {(q.responseFormat === "single-select" || q.responseFormat === "frequency-select") && q.options && (
          <div className="space-y-2">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className={"w-full text-left p-3 rounded-lg border text-sm transition-colors " + (selected === opt.value ? "bg-brand-50 border-brand-400" : "border-slate-200 hover:border-slate-300")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {q.responseFormat === "free-text" && (
          <textarea
            className="input min-h-[140px]"
            value={textResponse}
            onChange={(e) => setTextResponse(e.target.value)}
            placeholder={s.placeholder}
            autoFocus
          />
        )}

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex justify-end mt-5">
          <button className="btn-primary px-6" disabled={submitting} onClick={submit}>
            {submitting ? s.saving : s.continue}
          </button>
        </div>
      </div>
    </div>
  );
}
