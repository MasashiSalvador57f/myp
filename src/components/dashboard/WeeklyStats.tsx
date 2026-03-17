import type { DailyStat } from "../../types";

interface WeeklyStatsProps {
  summaries: DailyStat[];
}

export function WeeklyStats({ summaries }: WeeklyStatsProps) {
  const maxChars = Math.max(1, ...summaries.map((s) => s.total_chars));

  return (
    <div className="space-y-2">
      {summaries.map((s) => {
        const ratio = s.total_chars / maxChars;
        const dayLabel = new Date(s.date + "T12:00:00").toLocaleDateString("ja-JP", {
          weekday: "short",
          month: "numeric",
          day: "numeric",
        });
        return (
          <div key={s.date} className="flex items-center gap-3">
            <span className="text-[var(--text-tertiary)] text-xs w-20 shrink-0">
              {dayLabel}
            </span>
            <div className="flex-1 bg-[var(--bg-tertiary)] rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-[var(--duration-slow)]"
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            <span className="text-[var(--text-secondary)] text-xs w-16 text-right shrink-0">
              {s.total_chars.toLocaleString()}字
            </span>
          </div>
        );
      })}
      {summaries.length === 0 && (
        <p className="text-[var(--text-tertiary)] text-sm text-center py-2">
          執筆記録がありません
        </p>
      )}
    </div>
  );
}
