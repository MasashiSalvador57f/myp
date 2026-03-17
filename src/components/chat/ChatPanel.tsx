import { useEffect, useRef, useState } from "react";
import { Button, Modal, Input } from "../ui";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { AgentSelector } from "./AgentSelector";
import { ChatHistory } from "./ChatHistory";
import { useChatStore, PRESET_AGENTS } from "../../stores/chatStore";
import { useSettingsStore } from "../../stores/settingsStore";
import type { ChatSession } from "../../types";

interface ChatPanelProps {
  projectId: string;
  manuscriptContext?: string;
}

export function ChatPanel({ projectId, manuscriptContext }: ChatPanelProps) {
  const {
    currentSession,
    sessions,
    selectedAgentId,
    loading,
    sendMessage,
    startNewSession,
    saveCurrentSession,
  } = useChatStore();

  const { customPrompts } = useSettingsStore();
  const [showHistory, setShowHistory] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージ末尾へスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  // セッション開始
  const handleNew = () => {
    startNewSession(projectId, selectedAgentId);
    setShowHistory(false);
  };

  const handleSend = async (content: string) => {
    if (!currentSession) {
      startNewSession(projectId, selectedAgentId);
    }
    // Backend resolves system prompt from agent ID;
    // pass manuscript context for reference if available
    await sendMessage(projectId, content, manuscriptContext);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveCurrentSession();
    setSaving(false);
    setSaveOpen(false);
  };

  const handleSelectHistory = (session: ChatSession) => {
    // 履歴セッションを currentSession に読み込む（読み取り専用として表示）
    useChatStore.setState({ currentSession: session });
    setShowHistory(false);
  };

  const currentAgent =
    PRESET_AGENTS.find((a) => a.id === selectedAgentId) ?? PRESET_AGENTS[0];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[var(--accent-primary)]"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-[var(--text-primary)] text-sm font-medium">
            AI相談
          </span>
        </div>
        <div className="flex items-center gap-1">
          {currentSession && currentSession.messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSaveTitle(currentSession.title);
                setSaveOpen(true);
              }}
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              }
            >
              保存
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory((v) => !v)}
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.09" />
              </svg>
            }
          >
            履歴
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNew}
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            新規
          </Button>
        </div>
      </div>

      {showHistory ? (
        <ChatHistory
          sessions={sessions}
          currentSessionId={currentSession?.id}
          onSelect={handleSelectHistory}
          onNew={handleNew}
        />
      ) : (
        <>
          {/* エージェント選択 */}
          <AgentSelector customPrompts={customPrompts} />

          {/* メッセージリスト */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {!currentSession || currentSession.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="text-[var(--text-tertiary)] text-sm mb-2">
                  {currentAgent.name}
                </div>
                <p className="text-[var(--text-tertiary)] text-xs">
                  {currentAgent.description}
                </p>
                <p className="text-[var(--text-tertiary)] text-xs mt-4 opacity-60">
                  メッセージを入力して相談を開始してください
                </p>
              </div>
            ) : (
              currentSession.messages
                .filter((m) => m.role !== "system")
                .map((msg, i) => <ChatMessage key={i} message={msg} />)
            )}

            {loading && (
              <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs">回答を生成中...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <ChatInput onSend={handleSend} disabled={loading} />
        </>
      )}

      {/* 保存モーダル */}
      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="相談を資料として保存"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSaveOpen(false)} disabled={saving}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              disabled={!saveTitle.trim()}
            >
              保存
            </Button>
          </>
        }
      >
        <Input
          label="タイトル"
          value={saveTitle}
          onChange={(e) => setSaveTitle(e.target.value)}
          placeholder="例: プロット相談 2026-03-17"
          autoFocus
        />
      </Modal>
    </div>
  );
}
