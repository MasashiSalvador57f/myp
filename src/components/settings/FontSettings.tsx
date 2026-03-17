import { Button } from "../ui";
import { useSettingsStore } from "../../stores/settingsStore";

const JAPANESE_FONTS = [
  { label: "明朝体（Noto Serif JP）", value: "Noto Serif JP" },
  { label: "源ノ明朝（Source Han Serif JP）", value: "Source Han Serif JP" },
  { label: "游明朝", value: "Yu Mincho" },
  { label: "ヒラギノ明朝", value: "Hiragino Mincho ProN" },
  { label: "ゴシック体（Noto Sans JP）", value: "Noto Sans JP" },
  { label: "游ゴシック", value: "Yu Gothic" },
  { label: "ヒラギノ角ゴ", value: "Hiragino Kaku Gothic ProN" },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24];

export function FontSettings() {
  const { settings, updateEditorSettings } = useSettingsStore();
  const { font_family, font_size } = settings.editor;

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide block mb-2">
          フォント
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {JAPANESE_FONTS.map((font) => (
            <button
              key={font.value}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-left transition-colors",
                font_family === font.value
                  ? "bg-[var(--accent-subtle)] border border-[var(--accent-primary)] text-[var(--text-primary)]"
                  : "border border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
              ].join(" ")}
              onClick={() => updateEditorSettings({ font_family: font.value })}
            >
              <span
                className="text-base"
                style={{ fontFamily: `${font.value}, serif` }}
              >
                あ
              </span>
              <span className="text-sm">{font.label}</span>
              {font_family === font.value && (
                <svg
                  className="ml-auto text-[var(--accent-primary)]"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide block mb-2">
          文字サイズ
        </label>
        <div className="flex flex-wrap gap-2">
          {FONT_SIZES.map((size) => (
            <Button
              key={size}
              variant={font_size === size ? "primary" : "secondary"}
              size="sm"
              onClick={() => updateEditorSettings({ font_size: size })}
            >
              {size}px
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--bg-tertiary)] rounded-[var(--radius-lg)] p-4">
        <p className="text-xs text-[var(--text-tertiary)] mb-2">プレビュー</p>
        <p
          style={{
            fontFamily: `${font_family}, serif`,
            fontSize: `${font_size}px`,
            lineHeight: 1.8,
            color: "var(--text-primary)",
          }}
        >
          吾輩は猫である。名前はまだ無い。
        </p>
      </div>
    </div>
  );
}
