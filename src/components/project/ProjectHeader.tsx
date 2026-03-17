import { useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
        <Box sx={{ minWidth: 0 }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginBottom: 8,
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.disabled">ホーム</Typography>
          </Link>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {config.name}
          </Typography>
          <Typography variant="body2" color="text.disabled" mt={0.5}>
            作成:{" "}
            {new Date(config.created_at).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditName(config.name);
              setEditTarget(config.target_char_count?.toString() ?? "");
              setEditOpen(true);
            }}
            icon={<EditIcon sx={{ fontSize: 16 }} />}
          >
            設定
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            icon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
          >
            削除
          </Button>
        </Box>
      </Box>

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        </Box>
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
        <Typography variant="body2" color="text.secondary">
          「{config.name}」を削除しますか？この操作は元に戻せません。
        </Typography>
      </Modal>
    </>
  );
}
