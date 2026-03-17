import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { Heatmap } from "../components/dashboard/Heatmap";
import { WeeklyStats } from "../components/dashboard/WeeklyStats";
import { StatsOverview } from "../components/dashboard/StatsOverview";
import { ProjectCard } from "../components/dashboard/ProjectCard";
import { NewProjectModal } from "../components/dashboard/NewProjectModal";
import { MemoQuickAdd } from "../components/memo/MemoQuickAdd";
import { MemoList } from "../components/memo/MemoList";
import { useProjectStore } from "../stores/projectStore";
import { useWritingLogStore } from "../stores/writingLogStore";
import { useTheme } from "../components/ui/ThemeProvider";
import type { MemoInfo } from "../types/memo";
import * as commands from "../lib/tauri-commands";

export default function HomePage() {
  const { projects, loading: projectLoading, loadProjects, createProject } =
    useProjectStore();
  const {
    dailyStats,
    weeklySummary,
    loading: logLoading,
    loadDashboardData,
  } = useWritingLogStore();
  const { theme, toggleTheme } = useTheme();

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [heatmapPeriodLabel, setHeatmapPeriodLabel] = useState("1年");

  // メモ関連
  const [memos, setMemos] = useState<MemoInfo[]>([]);
  const [memoLoading, setMemoLoading] = useState(false);

  const loadMemos = useCallback(async () => {
    setMemoLoading(true);
    try {
      const list = await commands.listMemos();
      setMemos(list);
    } catch {
      // バックエンド未実装時は空リスト
      setMemos([]);
    } finally {
      setMemoLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    loadDashboardData();
    loadMemos();
  }, []);

  const total7Days = weeklySummary?.total_chars ?? 0;
  const averageChars = weeklySummary?.average_chars ?? 0;
  const last7Days = weeklySummary?.days ?? [];

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* トップバー */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-[var(--accent-primary)]"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <h1 className="text-[var(--text-primary)] font-semibold text-base">
            MyPWriter
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            icon={
              theme === "dark" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )
            }
            aria-label="テーマ切替"
          />
          <Link to="/settings">
            <Button
              variant="ghost"
              size="sm"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              }
            >
              設定
            </Button>
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 統計サマリー */}
        <section>
          <StatsOverview
            averageChars={averageChars}
            totalLast7Days={total7Days}
            projectCount={projects.length}
          />
        </section>

        {/* ヒートマップ */}
        <section>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <h2 className="text-[var(--text-primary)] font-medium text-sm mb-4">
              執筆記録（過去{heatmapPeriodLabel}）
            </h2>
            {logLoading ? (
              <div className="text-[var(--text-tertiary)] text-sm">読み込み中...</div>
            ) : (
              <Heatmap summaries={dailyStats} onPeriodLabelChange={setHeatmapPeriodLabel} />
            )}
          </div>
        </section>

        {/* 直近7日 */}
        <section>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <h2 className="text-[var(--text-primary)] font-medium text-sm mb-4">
              直近7日間の執筆量
            </h2>
            <WeeklyStats summaries={last7Days} />
          </div>
        </section>

        {/* プロジェクト一覧 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[var(--text-primary)] font-medium text-sm">
              プロジェクト
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setNewProjectOpen(true)}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              新規プロジェクト
            </Button>
          </div>

          {projectLoading ? (
            <div className="text-[var(--text-tertiary)] text-sm text-center py-8">
              読み込み中...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[var(--border-default)] rounded-[var(--radius-xl)]">
              <p className="text-[var(--text-tertiary)] text-sm mb-4">
                プロジェクトがありません
              </p>
              <Button
                variant="primary"
                onClick={() => setNewProjectOpen(true)}
              >
                最初のプロジェクトを作成
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

        {/* アイデアメモ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[var(--text-primary)] font-medium text-sm">
              アイデアメモ
            </h2>
          </div>
          <div className="space-y-3">
            <MemoQuickAdd onCreated={loadMemos} />
            <MemoList memos={memos} loading={memoLoading} onDeleted={loadMemos} onUpdated={loadMemos} />
          </div>
        </section>
      </main>

      {/* 新規プロジェクトモーダル */}
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onCreate={async (name, target) => {
          await createProject(name, target);
        }}
      />
    </div>
  );
}
