import { useState } from "react";
import { Input, Button } from "../ui";
import { useSettingsStore } from "../../stores/settingsStore";

const AI_MODELS = [
  { label: "Claude Opus 4.6（高性能）", value: "claude-opus-4-6" },
  { label: "Claude Sonnet 4.6（バランス）", value: "claude-sonnet-4-6" },
  { label: "Claude Haiku 4.5（高速）", value: "claude-haiku-4-5-20251001" },
];

export function AISettings() {
  const { settings, updateAiSettings } = useSettingsStore();
  const { api_key, model } = settings.ai;
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateAiSettings({ api_key, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <Input
          label="APIキー"
          type={showKey ? "text" : "password"}
          value={api_key ?? ""}
          onChange={(e) => updateAiSettings({ api_key: e.target.value || null })}
          placeholder="sk-ant-..."
          hint="Anthropic Console から取得できます"
          iconRight={
            <button
              onClick={() => setShowKey((v) => !v)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              type="button"
              aria-label={showKey ? "パスワードを隠す" : "パスワードを表示"}
            >
              {showKey ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          }
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide block mb-2">
          モデル
        </label>
        <div className="space-y-1.5">
          {AI_MODELS.map((m) => (
            <button
              key={m.value}
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-left border transition-colors",
                model === m.value
                  ? "bg-[var(--accent-subtle)] border-[var(--accent-primary)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
              ].join(" ")}
              onClick={() => updateAiSettings({ model: m.value })}
            >
              <span className="flex-1 text-sm">{m.label}</span>
              {model === m.value && (
                <svg
                  className="text-[var(--accent-primary)]"
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

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleSave}>
          {saved ? "保存しました" : "設定を保存"}
        </Button>
      </div>
    </div>
  );
}
