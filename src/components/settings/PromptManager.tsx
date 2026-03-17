import { useState } from "react";
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
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[var(--text-tertiary)] text-sm">
          {customPrompts.length === 0
            ? "カスタムプロンプトがありません"
            : `${customPrompts.length}件のプロンプト`}
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={openNew}
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          追加
        </Button>
      </div>

      <div className="space-y-2">
        {customPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className="flex items-start gap-3 bg-[var(--bg-tertiary)] rounded-[var(--radius-lg)] p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[var(--text-primary)] text-sm font-medium truncate">
                  {prompt.name}
                </span>
                <span className="text-[var(--text-tertiary)] text-[10px] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded shrink-0">
                  {prompt.scope === "global" ? "グローバル" : "プロジェクト"}
                </span>
              </div>
              <p className="text-[var(--text-tertiary)] text-xs line-clamp-2">
                {prompt.content}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => openEdit(prompt)}>
                編集
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(prompt)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--error)]">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
              </Button>
            </div>
          </div>
        ))}
      </div>

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
        <div className="space-y-4">
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
            className="min-h-[120px]"
          />
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide block mb-2">
              スコープ
            </label>
            <div className="flex gap-2">
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
            </div>
          </div>
        </div>
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
        <p className="text-[var(--text-secondary)]">
          「{deleteTarget?.name}」を削除しますか？
        </p>
      </Modal>
    </div>
  );
}
