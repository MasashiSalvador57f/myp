import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Modal } from "../ui";
import type { ManuscriptFile } from "../../types";

interface ChapterListProps {
  projectId: string;
  manuscripts: ManuscriptFile[];
  onCreateFile: (filename: string) => Promise<void>;
  onDeleteFile: (filename: string) => Promise<void>;
}

export function ChapterList({
  projectId,
  manuscripts,
  onCreateFile,
  onDeleteFile,
}: ChapterListProps) {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [newFilename, setNewFilename] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManuscriptFile | null>(null);

  const handleCreate = async () => {
    if (!newFilename.trim()) return;
    setCreating(true);
    try {
      const filename = newFilename.trim().endsWith(".txt")
        ? newFilename.trim()
        : `${newFilename.trim()}.txt`;
      await onCreateFile(filename);
      setNewFilename("");
      setCreateOpen(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await onDeleteFile(deleteTarget.filename);
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[var(--text-primary)] font-medium text-sm">原稿ファイル</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCreateOpen(true)}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          新規ファイル
        </Button>
      </div>

      {manuscripts.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
          <p>原稿ファイルがありません</p>
          <p className="mt-1 text-xs">「新規ファイル」から作成してください</p>
        </div>
      ) : (
        <div className="space-y-1">
          {manuscripts.map((file) => (
            <div
              key={file.filename}
              className="flex items-center gap-2 group rounded-[var(--radius-lg)] px-3 py-2 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--text-tertiary)] shrink-0"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>

              <button
                className="flex-1 text-left text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)] transition-colors truncate"
                onClick={() =>
                  navigate(
                    `/project/${projectId}/editor/${encodeURIComponent(file.filename)}`
                  )
                }
              >
                {file.filename}
              </button>

              <span className="text-[var(--text-tertiary)] text-xs shrink-0">
                {file.char_count.toLocaleString()}字
              </span>

              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-tertiary)] hover:text-[var(--error)] p-1 rounded"
                onClick={() => setDeleteTarget(file)}
                aria-label={`${file.filename}を削除`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 新規ファイル作成モーダル */}
      <Modal
        open={createOpen}
        onClose={() => {
          setNewFilename("");
          setCreateOpen(false);
        }}
        title="新規原稿ファイル"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setNewFilename("");
                setCreateOpen(false);
              }}
              disabled={creating}
            >
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleCreate} loading={creating}>
              作成
            </Button>
          </>
        }
      >
        <Input
          label="ファイル名"
          placeholder="例: 第一章"
          value={newFilename}
          onChange={(e) => setNewFilename(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          hint=".txt が自動付与されます"
          autoFocus
        />
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="ファイルを削除"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              削除する
            </Button>
          </>
        }
      >
        <p className="text-[var(--text-secondary)]">
          「{deleteTarget?.filename}」を削除しますか？この操作は元に戻せません。
        </p>
      </Modal>
    </div>
  );
}
