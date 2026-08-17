import type { Lang, Level } from "../../../shared/types";
import { LEVEL_INDEX, LEVEL_SOLID, LEVELS, levelLabel } from "../lib/levelColors";

export default function CurrentTargetBar({ current, target, compact, lang }: { current: Level | null; target?: Level; compact?: boolean; lang: Lang }) {
  const currentIdx = current ? LEVEL_INDEX[current] : -1;
  const targetIdx = target ? LEVEL_INDEX[target] : -1;

  return (
    <div className={compact ? "w-40" : "w-full max-w-xs"}>
      <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden flex">
        {LEVELS.map((l, i) => (
          <div
            key={l}
            className="flex-1 border-r border-white last:border-r-0"
            style={{ backgroundColor: i <= currentIdx && current ? LEVEL_SOLID[current] : "transparent" }}
          />
        ))}
        {target && (
          <div
            className="absolute top-[-3px] bottom-[-3px] w-[3px] bg-slate-900 rounded"
            style={{ left: `${((targetIdx + 1) / LEVELS.length) * 100}%` }}
            title={levelLabel(target, lang)}
          />
        )}
      </div>
      {!compact && (
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          {LEVELS.map((l) => (
            <span key={l}>{levelLabel(l, lang).slice(0, 4)}</span>
          ))}
        </div>
      )}
    </div>
  );
}
