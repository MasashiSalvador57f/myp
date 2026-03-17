import { useState } from "react";
import { Button } from "../ui";
import * as commands from "../../lib/tauri-commands";

interface MemoQuickAddProps {
  onCreated: () => void;
}

export function MemoQuickAdd({ onCreated }: MemoQuickAddProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() && !body.trim()) return;
    setSaving(true);
    try {
      await commands.createMemo(title.trim() || "(無題)", body);
      setTitle("");
      setBody("");
      onCreated();
    } catch (e) {
      console.error("メモ作成に失敗:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="メモのタイトル"
        className="w-full bg-transparent text-[var(--text-primary)] text-sm font-medium placeholder:text-[var(--text-tertiary)] outline-none mb-2"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="アイデアを書き留める..."
        rows={3}
        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-3 py-2 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] outline-none resize-none"
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-[var(--text-tertiary)]">
          Cmd+Enter で送信
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={saving || (!title.trim() && !body.trim())}
        >
          {saving ? "保存中..." : "メモを追加"}
        </Button>
      </div>
    </div>
  );
}
