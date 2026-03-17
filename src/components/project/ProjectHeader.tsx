import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Modal } from "../ui";
import type { ProjectConfig } from "../../types";

interface ProjectHeaderProps {
  projectId: string;
  config: ProjectConfig;
  onUpdate: (name?: string, targetCharCount?: number) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function ProjectHeader({
  config,
  onUpdate,
  onDelete,
}: ProjectHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState(config.name);
  const [editTarget, setEditTarget] = useState(
    config.target_char_count?.toString() ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const target = editTarget ? parseInt(editTarget, 10) : undefined;
      await onUpdate(
        editName.trim(),
        isNaN(target ?? NaN) ? undefined : target,
      );
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to="/"
            className="text-[var(--text-tertiary)] text-sm hover:text-[var(--text-secondary)] flex items-center gap-1 mb-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            ホーム
          </Link>
          <h1 className="text-[var(--text-primary)] text-2xl font-semibold truncate">
            {config.name}
          </h1>
          <p className="text-[var(--text-tertiary)] text-sm mt-1">
            作成:{" "}
            {new Date(config.created_at).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditName(config.name);
              setEditTarget(config.target_char_count?.toString() ?? "");
              setEditOpen(true);
            }}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            }
          >
            設定
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            }
          >
            削除
          </Button>
        </div>
      </div>

      {/* 編集モーダル */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="プロジェクト設定"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={saving}>
              キャンセル
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="プロジェクト名"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label="目標文字数（任意）"
            type="number"
            min={0}
            value={editTarget}
            onChange={(e) => setEditTarget(e.target.value)}
            hint="空欄にすると目標なし"
          />
        </div>
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="プロジェクトを削除"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              削除する
            </Button>
          </>
        }
      >
        <p className="text-[var(--text-secondary)]">
          「{config.name}」を削除しますか？この操作は元に戻せません。
        </p>
      </Modal>
    </>
  );
}
