interface ProgressBarProps {
  current: number;
  target: number | null;
}

export function ProgressBar({ current, target }: ProgressBarProps) {
  if (!target || target === 0) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">現在の文字数</span>
          <span className="text-[var(--text-primary)] font-medium">
            {current.toLocaleString()}字
          </span>
        </div>
        <p className="text-[var(--text-tertiary)] text-xs">目標未設定</p>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">執筆進捗</span>
        <span className="text-[var(--text-primary)] font-medium">
          {current.toLocaleString()}
          <span className="text-[var(--text-tertiary)] font-normal">
            {" "}/ {target.toLocaleString()}字
          </span>
        </span>
      </div>
      <div className="bg-[var(--bg-tertiary)] rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-[var(--duration-slow)]"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={target}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <span>{pct}% 達成</span>
        {remaining > 0 && <span>残り {remaining.toLocaleString()}字</span>}
        {remaining === 0 && (
          <span className="text-[var(--success)]">目標達成！</span>
        )}
      </div>
    </div>
  );
}
