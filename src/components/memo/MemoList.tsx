import { useState, useRef, useEffect, useCallback } from "react";
import type { MemoInfo, MemoDetail } from "../../types/memo";
import * as commands from "../../lib/tauri-commands";

interface MemoListProps {
  memos: MemoInfo[];
  loading: boolean;
  onDeleted: () => void;
  onUpdated: () => void;
}

export function MemoList({ memos, loading, onDeleted, onUpdated }: MemoListProps) {
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [detail, setDetail] = useState<MemoDetail | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // カードに本文プレビューを表示するため、全メモの先頭数行を取得
  useEffect(() => {
    const loadPreviews = async () => {
      const map: Record<string, string> = {};
      for (const memo of memos) {
        try {
          const d = await commands.readMemo(memo.filename);
          map[memo.filename] = d.body;
        } catch {
          map[memo.filename] = "";
        }
      }
      setPreviews(map);
    };
    if (memos.length > 0) loadPreviews();
  }, [memos]);

  const saveAndClose = useCallback(async () => {
    if (openFile && dirty) {
      setSaving(true);
      try {
        await commands.updateMemo(openFile, editTitle.trim() || "(無題)", editBody);
        setDirty(false);
        onUpdated();
      } catch (e) {
        console.error("メモの更新に失敗:", e);
      } finally {
        setSaving(false);
      }
    }
    setOpenFile(null);
    setDetail(null);
  }, [openFile, dirty, editTitle, editBody, onUpdated]);

  const handleOpen = async (filename: string) => {
    setOpenFile(filename);
    setDirty(false);
    try {
      const d = await commands.readMemo(filename);
      setDetail(d);
      setEditTitle(d.title === "(無題)" ? "" : d.title);
      setEditBody(d.body);
    } catch (e) {
      console.error("メモの読み込みに失敗:", e);
    }
  };

  const handleDelete = async () => {
    if (!openFile) return;
    try {
      await commands.deleteMemo(openFile);
      setOpenFile(null);
      setDetail(null);
      setDirty(false);
      onDeleted();
    } catch (e) {
      console.error("メモの削除に失敗:", e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      saveAndClose();
    }
  };

  // モーダル外クリックで閉じる
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      saveAndClose();
    }
  };

  // bodyの高さを自動調整
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.style.height = "auto";
      bodyRef.current.style.height = `${Math.max(bodyRef.current.scrollHeight, 120)}px`;
    }
  }, [editBody, openFile]);

  if (loading) {
    return (
      <div className="text-[var(--text-tertiary)] text-sm text-center py-4">
        読み込み中...
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <div className="text-[var(--text-tertiary)] text-sm text-center py-4">
        メモがありません
      </div>
    );
  }

  return (
    <>
      {/* カードグリッド */}
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3">
        {memos.map((memo) => {
          const preview = previews[memo.filename] ?? "";
          return (
            <div
              key={memo.filename}
              onClick={() => handleOpen(memo.filename)}
              className="break-inside-avoid mb-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-3 cursor-pointer hover:border-[var(--border-default)] hover:shadow-sm transition-all group"
            >
              {/* タイトル */}
              <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 mb-1">
                {memo.title}
              </h3>
              {/* 本文プレビュー */}
              {preview && (
                <p className="text-xs text-[var(--text-secondary)] line-clamp-6 whitespace-pre-wrap leading-relaxed">
                  {preview}
                </p>
              )}
              {/* 日時 */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {memo.created_at}
                </span>
                {/* ホバーで削除アイコン表示 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    commands.deleteMemo(memo.filename).then(onDeleted).catch(console.error);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-[var(--radius-md)] hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                  title="削除"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 編集モーダル (Google Keep風) */}
      {openFile && (
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center"
          onClick={handleOverlayClick}
        >
          {/* オーバーレイ */}
          <div className="absolute inset-0 bg-[var(--bg-primary)]" />

          {/* モーダルカード */}
          <div
            ref={modalRef}
            className="relative w-full max-w-lg mx-4 bg-white dark:bg-[#1e1e1e] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-lg overflow-hidden"
          >
            {detail ? (
              <div className="p-5 space-y-3">
                {/* タイトル編集 */}
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => { setEditTitle(e.target.value); setDirty(true); }}
                  onKeyDown={handleKeyDown}
                  placeholder="タイトル"
                  autoFocus
                  className="w-full bg-transparent text-[var(--text-primary)] text-base font-semibold outline-none placeholder:text-[var(--text-tertiary)] placeholder:opacity-40"
                />
                {/* 本文編集 */}
                <textarea
                  ref={bodyRef}
                  value={editBody}
                  onChange={(e) => { setEditBody(e.target.value); setDirty(true); }}
                  onKeyDown={handleKeyDown}
                  placeholder="メモを入力..."
                  className="w-full bg-transparent text-sm text-[var(--text-secondary)] outline-none resize-none leading-relaxed placeholder:text-[var(--text-tertiary)] placeholder:opacity-40"
                />
                {/* フッター */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[var(--text-tertiary)]">
                      {detail.created_at}
                    </span>
                    {saving && (
                      <span className="text-[10px] text-[var(--accent-primary)]">保存中...</span>
                    )}
                    {dirty && !saving && (
                      <span className="text-[10px] text-[var(--text-tertiary)]">未保存</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                      title="削除"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={saveAndClose}
                      className="text-xs font-medium text-[var(--text-primary)] px-3 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 text-[var(--text-tertiary)] text-sm">
                読み込み中...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
