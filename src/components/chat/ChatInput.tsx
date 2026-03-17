import { useState, useRef, type KeyboardEvent } from "react";
import { Button } from "../ui";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // テキストエリアの高さをリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter で送信
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <div className="flex items-end gap-2 p-3 border-t border-[var(--border-subtle)]">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
        placeholder={placeholder ?? "メッセージを入力... (⌘+Enter で送信)"}
        rows={1}
        className={[
          "flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-[var(--radius-lg)]",
          "px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
          "resize-none focus:outline-none focus:border-[var(--border-focus)]",
          "transition-colors duration-[var(--duration-normal)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "max-h-[200px] overflow-y-auto",
        ].join(" ")}
      />
      <Button
        variant="primary"
        size="md"
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        }
        aria-label="送信"
      />
    </div>
  );
}
