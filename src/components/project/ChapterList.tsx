import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
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
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="body1" fontWeight={500} color="text.primary">
          原稿ファイル
        </Typography>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCreateOpen(true)}
          icon={<AddIcon sx={{ fontSize: 16 }} />}
        >
          新規ファイル
        </Button>
      </Box>

      {manuscripts.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.disabled">原稿ファイルがありません</Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
            「新規ファイル」から作成してください
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {manuscripts.map((file) => (
            <ListItemButton
              key={file.filename}
              onClick={() =>
                navigate(`/project/${projectId}/editor/${encodeURIComponent(file.filename)}`)
              }
              sx={{
                borderRadius: 'var(--radius-lg)',
                py: 1,
                px: 1.5,
                '& .delete-btn': { opacity: 0 },
                '&:hover .delete-btn': { opacity: 1 },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </ListItemIcon>
              <ListItemText
                primary={file.filename}
                primaryTypographyProps={{ fontSize: '0.875rem', color: 'text.secondary' }}
              />
              <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, mr: 1 }}>
                {file.char_count.toLocaleString()}字
              </Typography>
              <IconButton
                className="delete-btn"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(file);
                }}
                aria-label={`${file.filename}を削除`}
                sx={{ transition: 'opacity 200ms' }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
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
        <Typography variant="body2" color="text.secondary">
          「{deleteTarget?.filename}」を削除しますか？この操作は元に戻せません。
        </Typography>
      </Modal>
    </Box>
  );
}
