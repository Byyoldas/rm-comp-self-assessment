import { useState } from "react";
import type { Lang } from "../../../shared/types";
import { STRINGS } from "../i18n/strings";

export default function Welcome({ lang, onStart }: { lang: Lang; onStart: (participantName: string) => void }) {
  const s = STRINGS[lang].welcome;
  const [name, setName] = useState("");
  const trimmed = name.trim();

  return (
    <div className="max-w-2xl mx-auto text-center py-10">
      <div className="pill bg-brand-50 text-brand-700 border border-brand-200 mb-4">{s.badge}</div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">{s.title}</h1>
      <p className="text-slate-600 mb-6 leading-relaxed">{s.body}</p>
      <div className="card p-6 text-left mb-8">
        <h2 className="font-semibold text-slate-800 mb-3">{s.howItWorksTitle}</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          {s.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>

      <div className="max-w-xs mx-auto mb-4 text-left">
        <label className="label">{s.namePrompt}</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={s.namePlaceholder}
          onKeyDown={(e) => e.key === "Enter" && trimmed && onStart(trimmed)}
        />
      </div>

      <button className="btn-primary px-8 py-3 text-base" disabled={!trimmed} onClick={() => onStart(trimmed)}>
        {s.start}
      </button>
      <p className="text-xs text-slate-400 mt-4">{s.footnote}</p>
    </div>
  );
}
