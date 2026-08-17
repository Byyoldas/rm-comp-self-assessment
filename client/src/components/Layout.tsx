import type { ReactNode } from "react";
import type { Lang } from "../../../shared/types";
import { PAGE_ORDER, type Page } from "../App";
import { LANG_NAMES, STRINGS } from "../i18n/strings";

export default function Layout({
  page,
  lang,
  onChangeLang,
  langLocked,
  completed,
  onReset,
  children,
}: {
  page: Page;
  lang: Lang;
  onChangeLang: (l: Lang) => void;
  langLocked: boolean;
  completed: boolean;
  onReset: () => void;
  children: ReactNode;
}) {
  const s = STRINGS[lang].layout;
  const currentIdx = PAGE_ORDER.indexOf(page);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="no-print border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-brand-600 text-white flex items-center justify-center text-xs font-bold">RM</div>
            <span className="font-semibold text-slate-800">RM Comp Self-Assessment</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={"flex rounded-lg border border-slate-300 overflow-hidden text-xs " + (langLocked ? "opacity-50" : "")}
              title={langLocked ? s.langLockedTitle : undefined}
            >
              {(Object.keys(LANG_NAMES) as Lang[]).map((l) => (
                <button
                  key={l}
                  disabled={langLocked}
                  onClick={() => onChangeLang(l)}
                  className={"px-2.5 py-1 font-medium " + (lang === l ? "bg-brand-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50") + (langLocked ? " cursor-not-allowed" : "cursor-pointer")}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {page !== "welcome" && (
              <button onClick={onReset} className="btn-ghost text-xs">
                {s.startOver}
              </button>
            )}
          </div>
        </div>
        {page !== "welcome" && (
          <div className="max-w-5xl mx-auto px-4 pb-3">
            <ol className="flex flex-wrap gap-2 text-xs">
              {PAGE_ORDER.filter((p) => p !== "welcome").map((p, i) => {
                const idx = PAGE_ORDER.indexOf(p);
                const state = idx < currentIdx ? "done" : idx === currentIdx ? "active" : "todo";
                return (
                  <li
                    key={p}
                    className={
                      "pill border " +
                      (state === "active"
                        ? "bg-brand-600 text-white border-brand-600"
                        : state === "done"
                        ? "bg-brand-50 text-brand-700 border-brand-200"
                        : "bg-slate-50 text-slate-400 border-slate-200")
                    }
                  >
                    {i + 1}. {s.stepLabels[p]}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">{children}</main>
      <footer className="no-print border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        {s.footer}
        {completed ? s.footerCompleted : ""}
      </footer>
    </div>
  );
}
