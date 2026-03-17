import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { ProjectHeader } from "../components/project/ProjectHeader";
import { ChapterList } from "../components/project/ChapterList";
import { ProgressBar } from "../components/project/ProgressBar";
import { RecentChats } from "../components/project/RecentChats";
import { ChatPanel } from "../components/chat/ChatPanel";
import { useProjectStore } from "../stores/projectStore";
import * as commands from "../lib/tauri-commands";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    currentProject,
    loading,
    error,
    loadProject,
    updateProject,
    deleteProject,
  } = useProjectStore();

  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (!projectId) return;
    await deleteProject(projectId);
    navigate("/");
  };

  const handleCreateFile = async (filename: string) => {
    if (!projectId) return;
    await commands.createChapter(projectId, filename);
    await loadProject(projectId);
  };

  const handleDeleteFile = async (filename: string) => {
    if (!projectId) return;
    await commands.deleteChapter(projectId, filename);
    await loadProject(projectId);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-[var(--text-tertiary)] text-sm">読み込み中...</p>
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] gap-4">
        <p className="text-[var(--text-secondary)] text-sm">
          {error ?? "プロジェクトが見つかりません"}
        </p>
        <Button variant="secondary" onClick={() => navigate("/")}>
          ホームへ戻る
        </Button>
      </div>
    );
  }

  const { config, manuscripts, materials, total_char_count } = currentProject;

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左ペイン: プロジェクト情報 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ヘッダー */}
          <ProjectHeader
            projectId={projectId!}
            config={config}
            onUpdate={(name, targetCharCount) => updateProject(projectId!, name, targetCharCount)}
            onDelete={handleDeleteProject}
          />

          {/* 進捗バー */}
          <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <ProgressBar
              current={total_char_count}
              target={config.target_char_count}
            />
          </section>

          {/* 原稿ファイル一覧 */}
          <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <ChapterList
              projectId={projectId!}
              manuscripts={manuscripts}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
            />
          </section>

          {/* 最近のAI相談 */}
          <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[var(--text-primary)] font-medium text-sm">
                最近のAI相談
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setChatOpen(true)}
                icon={
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
              >
                AI相談を開始
              </Button>
            </div>
            <RecentChats materials={materials} />
          </section>
        </div>

        {/* 右ペイン: チャットパネル（開いている時） */}
        {chatOpen && projectId && (
          <div className="w-80 border-l border-[var(--border-subtle)] flex flex-col shrink-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-secondary)]">
              <span className="text-[var(--text-tertiary)] text-xs">AI相談パネル</span>
              <button
                onClick={() => setChatOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded transition-colors"
                aria-label="パネルを閉じる"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPanel projectId={projectId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
