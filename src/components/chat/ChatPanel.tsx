import { useEffect, useRef, useState, useCallback } from "react";
import { Button, Modal, Input } from "../ui";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHistory } from "./ChatHistory";
import { useChatStore } from "../../stores/chatStore";
import { getAllAgents } from "../settings/AgentSettings";
import type { ChatSession, MemoInfo } from "../../types";
import * as commands from "../../lib/tauri-commands";
import { emit } from "../../lib/events";

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
    error,
    clearError,
    sendMessage,
    startNewSession,
    saveCurrentSession,
    loadSessionsFromDisk,
    switchSession,
    selectAgent,
  } = useChatStore();

  const allAgents = getAllAgents();

  const [showHistory, setShowHistory] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // メモ追記用
  const [appendOpen, setAppendOpen] = useState(false);
  const [appendContent, setAppendContent] = useState("");
  const [memoList, setMemoList] = useState<MemoInfo[]>([]);
  const [memoLoading, setMemoLoading] = useState(false);

  // テキスト選択ツールバー
  const [selectionToolbar, setSelectionToolbar] = useState<{ x: number; y: number; text: string } | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 起動時にセッション読み込み
  useEffect(() => {
    loadSessionsFromDisk(projectId);
  }, [projectId, loadSessionsFromDisk]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  // テキスト選択を検知
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // ツールバー内のクリックは無視（ボタン押下を妨げない）
      if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) return;

      // 少し遅延して選択状態を取得（ブラウザの選択確定を待つ）
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
          setSelectionToolbar(null);
          return;
        }
        // メッセージリスト内の選択のみ対象
        const container = messageListRef.current;
        if (!container) return;
        const anchorNode = sel.anchorNode;
        if (!anchorNode || !container.contains(anchorNode)) {
          setSelectionToolbar(null);
          return;
        }
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // スクロール位置を考慮
        setSelectionToolbar({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + container.scrollTop - 4,
          text: sel.toString(),
        });
      }, 10);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleNew = () => {
    startNewSession(projectId, selectedAgentId);
    setShowHistory(false);
  };

  const handleSend = async (content: string) => {
    if (!currentSession) {
      startNewSession(projectId, selectedAgentId);
    }
    await sendMessage(projectId, content, manuscriptContext);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveCurrentSession();
    setSaving(false);
    setSaveOpen(false);
  };

  const handleSelectHistory = (session: ChatSession) => {
    switchSession(session);
    setShowHistory(false);
  };

  // 新規メモとして保存（チャットリンク付き）
  const handleSaveAsMemo = useCallback(async (content: string) => {
    try {
      const title = content.split("\n")[0].slice(0, 50) || "AI相談メモ";
      const sessionId = currentSession?.id ?? "";
      const link = sessionId ? `\n\n---\n📎 チャットセッション: ${sessionId}` : "";
      await commands.createMemo(title, content + link, projectId);
      emit("memo:changed");
    } catch (e) {
      console.error("メモの作成に失敗:", e);
    }
  }, [projectId, currentSession]);

  // 既存メモに追記 — メモ選択モーダルを開く
  const handleOpenAppend = useCallback(async (content: string) => {
    setAppendContent(content);
    setMemoLoading(true);
    setAppendOpen(true);
    try {
      const all = await commands.listMemos();
      setMemoList(all.filter((m) => m.project_id === projectId || !m.project_id));
    } catch {
      setMemoList([]);
    } finally {
      setMemoLoading(false);
    }
  }, [projectId]);

  // 選択テキストをメモにする
  const handleSelectionToMemo = useCallback(async () => {
    if (!selectionToolbar) return;
    const text = selectionToolbar.text;
    setSelectionToolbar(null);
    window.getSelection()?.removeAllRanges();
    await handleSaveAsMemo(text);
  }, [selectionToolbar, handleSaveAsMemo]);

  // 選択テキストをメモに追記
  const handleSelectionAppend = useCallback(async () => {
    if (!selectionToolbar) return;
    const text = selectionToolbar.text;
    setSelectionToolbar(null);
    window.getSelection()?.removeAllRanges();
    await handleOpenAppend(text);
  }, [selectionToolbar, handleOpenAppend]);

  // 選択したメモに追記（チャットリンク付き）
  const handleAppendToMemo = useCallback(async (memo: MemoInfo) => {
    try {
      const detail = await commands.readMemo(memo.filename);
      const sessionId = currentSession?.id ?? "";
      const link = sessionId ? `\n📎 チャットセッション: ${sessionId}` : "";
      const newBody = detail.body
        ? `${detail.body}\n\n---\n\n${appendContent}${link}`
        : `${appendContent}${link}`;
      await commands.updateMemo(memo.filename, detail.title, newBody, detail.project_id);
      emit("memo:changed");
      setAppendOpen(false);
      setAppendContent("");
    } catch (e) {
      console.error("メモへの追記に失敗:", e);
    }
  }, [appendContent, currentSession]);

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
          {/* メッセージリスト */}
          <div ref={messageListRef} className="flex-1 overflow-y-auto p-3 space-y-4 relative">
            {!currentSession || currentSession.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <p className="text-[var(--text-tertiary)] text-xs">
                  メッセージを入力して相談を開始してください
                </p>
              </div>
            ) : (
              currentSession.messages
                .filter((m) => m.role !== "system")
                .map((msg, i) => (
                  <ChatMessage
                    key={i}
                    message={msg}
                    onSaveAsMemo={handleSaveAsMemo}
                    onAppendToMemo={handleOpenAppend}
                  />
                ))
            )}

            {loading && (
              <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-sm py-2 px-3 rounded-lg bg-[var(--bg-tertiary)]">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-[var(--text-secondary)]">
                  {currentSession?.messages.some((m) => m.role === "assistant" && m.content)
                    ? "回答をストリーミング中..."
                    : "回答を生成中..."}
                </span>
              </div>
            )}

            {error && (
              <div
                className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-[var(--error-bg)] text-[var(--error)] text-xs cursor-pointer"
                onClick={clearError}
              >
                <span>{error}</span>
                <span className="text-[var(--text-tertiary)] text-[10px]">クリックで閉じる</span>
              </div>
            )}

            <div ref={messagesEndRef} />

            {/* 選択テキスト用フローティングツールバー */}
            {selectionToolbar && (
              <div
                ref={toolbarRef}
                className="absolute z-50 flex items-center gap-0.5 px-1 py-0.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-md"
                style={{
                  left: Math.max(0, selectionToolbar.x - 60),
                  top: Math.max(0, selectionToolbar.y - 28),
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <button
                  onClick={handleSelectionToMemo}
                  className="text-[10px] px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
                >
                  メモにする
                </button>
                <div className="w-px h-3 bg-[var(--border-default)]" />
                <button
                  onClick={handleSelectionAppend}
                  className="text-[10px] px-2 py-1 rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--accent-primary)] transition-colors whitespace-nowrap"
                >
                  メモに追記
                </button>
              </div>
            )}
          </div>

          {/* エージェント選択 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-[var(--border-subtle)]">
            <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">エージェント:</span>
            <select
              value={selectedAgentId}
              onChange={(e) => selectAgent(e.target.value)}
              disabled={!!currentSession && currentSession.messages.length > 0}
              className={[
                "flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-[var(--radius-md)]",
                "px-2 py-1 text-[11px] text-[var(--text-primary)]",
                "focus:outline-none focus:border-[var(--border-focus)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              <option value="">- (未設定)</option>
              {allAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
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

      {/* メモ追記先選択モーダル */}
      <Modal
        open={appendOpen}
        onClose={() => setAppendOpen(false)}
        title="追記先のメモを選択"
      >
        {memoLoading ? (
          <p className="text-[var(--text-tertiary)] text-sm py-4 text-center">読み込み中...</p>
        ) : memoList.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-sm py-4 text-center">メモがありません</p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1">
            {memoList.map((memo) => (
              <button
                key={memo.filename}
                onClick={() => handleAppendToMemo(memo)}
                className="w-full text-left px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="text-sm text-[var(--text-primary)] truncate">{memo.title}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">{memo.created_at}</div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
