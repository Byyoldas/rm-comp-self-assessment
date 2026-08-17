import type { CompetencyReportRow, Domain, Lang } from "../../../shared/types";
import { LEVEL_SOLID, LEVELS, levelLabel } from "../lib/levelColors";
import { STRINGS } from "../i18n/strings";

export default function Heatmap({ rows, domains, lang }: { rows: CompetencyReportRow[]; domains: Domain[]; lang: Lang }) {
  const s = STRINGS[lang].dashboard;
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] space-y-3">
        {domains.map((domain) => {
          const domainRows = rows.filter((r) => r.domain === domain.id);
          if (domainRows.length === 0) return null;
          return (
            <div key={domain.id} className="flex items-center gap-3">
              <div className="w-48 shrink-0 text-xs font-medium text-slate-500 text-right pr-2">{domain.name}</div>
              <div className="flex flex-wrap gap-1 flex-1">
                {domainRows.map((r) => (
                  <div
                    key={r.competencyId}
                    title={`${r.competencyName}: ${r.currentLevel ? levelLabel(r.currentLevel, lang) : s.insufficientEvidence}`}
                    className="h-6 w-6 rounded-sm border border-white/50 flex items-center justify-center"
                    style={{
                      backgroundColor: r.currentLevel ? LEVEL_SOLID[r.currentLevel] : "#f1f5f9",
                      backgroundImage: r.currentLevel ? undefined : "repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 3px, #f8fafc 3px, #f8fafc 6px)",
                      opacity: r.conclusionStatus === "not-relevant" ? 0.25 : r.confidence === "Low" ? 0.6 : 1,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 pl-[13rem] text-xs text-slate-500">
        {LEVELS.map((l) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm inline-block" style={{ backgroundColor: LEVEL_SOLID[l] }} />
            {levelLabel(l, lang)}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm inline-block bg-slate-100 border border-slate-300" />
          {s.insufficientEvidence}
        </div>
      </div>
    </div>
  );
}
