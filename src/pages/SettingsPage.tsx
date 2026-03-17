import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontSettings } from "../components/settings/FontSettings";
import { LayoutSettings } from "../components/settings/LayoutSettings";
import { AISettings } from "../components/settings/AISettings";
import { PromptManager } from "../components/settings/PromptManager";
import { StorageSettings } from "../components/settings/StorageSettings";
import { useSettingsStore } from "../stores/settingsStore";

type SettingsTab = "font" | "layout" | "storage" | "ai" | "prompts";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "font", label: "フォント" },
  { id: "layout", label: "レイアウト" },
  { id: "storage", label: "保存先" },
  { id: "ai", label: "AI設定" },
  { id: "prompts", label: "プロンプト管理" },
];

export default function SettingsPage() {
  const { loadSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("font");

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* ヘッダー */}
      <header className="flex items-center gap-4 px-6 py-3 border-b border-[var(--border-subtle)] shrink-0">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          ホーム
        </Link>
        <h1 className="text-[var(--text-primary)] font-semibold text-base">設定</h1>
      </header>

      {/* タブ + コンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* サイドバー（タブ） */}
        <nav className="w-48 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0 py-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={[
                "w-full text-left px-4 py-2.5 text-sm transition-colors",
                activeTab === tab.id
                  ? "text-[var(--text-primary)] bg-[var(--bg-hover)] font-medium border-r-2 border-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
              ].join(" ")}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* コンテンツ */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl">
            {activeTab === "font" && (
              <section>
                <h2 className="text-[var(--text-primary)] font-medium text-base mb-5">
                  フォント設定
                </h2>
                <FontSettings />
              </section>
            )}
            {activeTab === "layout" && (
              <section>
                <h2 className="text-[var(--text-primary)] font-medium text-base mb-5">
                  レイアウト設定
                </h2>
                <LayoutSettings />
              </section>
            )}
            {activeTab === "storage" && (
              <section>
                <h2 className="text-[var(--text-primary)] font-medium text-base mb-5">
                  保存先設定
                </h2>
                <StorageSettings />
              </section>
            )}
            {activeTab === "ai" && (
              <section>
                <h2 className="text-[var(--text-primary)] font-medium text-base mb-5">
                  AI設定
                </h2>
                <AISettings />
              </section>
            )}
            {activeTab === "prompts" && (
              <section>
                <h2 className="text-[var(--text-primary)] font-medium text-base mb-5">
                  カスタムプロンプト管理
                </h2>
                <PromptManager />
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
