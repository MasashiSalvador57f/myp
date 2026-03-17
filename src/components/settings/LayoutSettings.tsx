import { Button } from "../ui";
import { useSettingsStore } from "../../stores/settingsStore";
import type { WritingDirection } from "../../types";

const CHARS_PER_LINE_OPTIONS = [20, 25, 30, 35, 40, 45, 50, 60];

export function LayoutSettings() {
  const { settings, updateEditorSettings } = useSettingsStore();
  const { writing_mode, chars_per_line } = settings.editor;

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide block mb-2">
          デフォルト表示方向
        </label>
        <div className="flex gap-2">
          {(
            [
              { value: "vertical" as WritingDirection, label: "縦書き", icon: "縦" },
              { value: "horizontal" as WritingDirection, label: "横書き", icon: "横" },
            ] as const
          ).map(({ value, label, icon }) => (
            <button
              key={value}
              className={[
                "flex-1 flex flex-col items-center gap-2 py-4 rounded-[var(--radius-xl)] border transition-colors",
                writing_mode === value
                  ? "bg-[var(--accent-subtle)] border-[var(--accent-primary)] text-[var(--text-primary)]"
                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
              ].join(" ")}
              onClick={() =>
                updateEditorSettings({ writing_mode: value })
              }
            >
              <span
                className="text-lg font-medium"
                style={{
                  writingMode: value === "vertical" ? "vertical-rl" : "horizontal-tb",
                }}
              >
                {icon}
              </span>
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide block mb-2">
          一行あたりの文字数（初期値）
        </label>
        <div className="flex flex-wrap gap-2">
          {CHARS_PER_LINE_OPTIONS.map((n) => (
            <Button
              key={n}
              variant={chars_per_line === n ? "primary" : "secondary"}
              size="sm"
              onClick={() => updateEditorSettings({ chars_per_line: n })}
            >
              {n}字
            </Button>
          ))}
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          エディタで個別に変更することもできます
        </p>
      </div>
    </div>
  );
}
