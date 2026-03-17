import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { Button, Input, Textarea, Modal } from "../ui";
import { useSettingsStore } from "../../stores/settingsStore";
import type { CustomPrompt } from "../../types";

interface PromptFormData {
  name: string;
  content: string;
  scope: "global" | "project";
}

const EMPTY_FORM: PromptFormData = { name: "", content: "", scope: "global" };

export function PromptManager() {
  const { customPrompts, addCustomPrompt, updateCustomPrompt, deleteCustomPrompt } =
    useSettingsStore();

  const [editTarget, setEditTarget] = useState<CustomPrompt | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<PromptFormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<CustomPrompt | null>(null);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setIsNew(true);
    setEditTarget(null);
  };

  const openEdit = (prompt: CustomPrompt) => {
    setForm({ name: prompt.name, content: prompt.content, scope: prompt.scope });
    setEditTarget(prompt);
    setIsNew(false);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.content.trim()) return;
    if (isNew) {
      addCustomPrompt(form);
    } else if (editTarget) {
      updateCustomPrompt(editTarget.id, form);
    }
    setIsNew(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCustomPrompt(deleteTarget.id);
    setDeleteTarget(null);
  };

  const isOpen = isNew || !!editTarget;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="body2" color="text.disabled">
          {customPrompts.length === 0
            ? "カスタムプロンプトがありません"
            : `${customPrompts.length}件のプロンプト`}
        </Typography>
        <Button
          variant="primary"
          size="sm"
          onClick={openNew}
          icon={<AddIcon sx={{ fontSize: 14 }} />}
        >
          追加
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {customPrompts.map((prompt) => (
          <Paper
            key={prompt.id}
            variant="outlined"
            sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5, borderRadius: 'var(--radius-lg)' }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography variant="body2" fontWeight={500} color="text.primary" noWrap>
                  {prompt.name}
                </Typography>
                <Chip
                  label={prompt.scope === "global" ? "グローバル" : "プロジェクト"}
                  size="small"
                  sx={{ fontSize: '0.625rem', height: 20 }}
                />
              </Box>
              <Typography variant="caption" color="text.disabled" sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {prompt.content}
              </Typography>
            </Box>
            <Box display="flex" gap={0.5} sx={{ flexShrink: 0 }}>
              <Button variant="ghost" size="sm" onClick={() => openEdit(prompt)}>
                編集
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(prompt)}
                icon={<DeleteOutlineIcon sx={{ fontSize: 14, color: 'error.main' }} />}
              />
            </Box>
          </Paper>
        ))}
      </Box>

      {/* 編集/作成モーダル */}
      <Modal
        open={isOpen}
        onClose={() => {
          setIsNew(false);
          setEditTarget(null);
        }}
        title={isNew ? "プロンプトを追加" : "プロンプトを編集"}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsNew(false);
                setEditTarget(null);
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!form.name.trim() || !form.content.trim()}
            >
              保存
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Input
            label="プロンプト名"
            placeholder="例: 文章校正"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
          <Textarea
            label="プロンプト内容"
            placeholder="例: 文章を校正して、誤字・脱字や表現の改善点を指摘してください。"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={5}
          />
          <Box>
            <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.04em' }}>
              スコープ
            </Typography>
            <Box display="flex" gap={1}>
              {(["global", "project"] as const).map((scope) => (
                <Button
                  key={scope}
                  variant={form.scope === scope ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setForm((f) => ({ ...f, scope }))}
                >
                  {scope === "global" ? "グローバル" : "プロジェクト"}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="プロンプトを削除"
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
          「{deleteTarget?.name}」を削除しますか？
        </Typography>
      </Modal>
    </Box>
  );
}
