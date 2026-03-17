import type { ChatMessage as ChatMessageType } from "../../types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const time = new Date(message.timestamp).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* アバター */}
      <div
        className={[
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium mt-0.5",
          isUser
            ? "bg-[var(--accent-subtle)] text-[var(--accent-primary)]"
            : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]",
        ].join(" ")}
      >
        {isUser ? "私" : "AI"}
      </div>

      <div
        className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={[
            "px-3 py-2 rounded-[var(--radius-xl)] text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-[var(--accent-primary)] text-[var(--text-inverse)] rounded-tr-[var(--radius-sm)]"
              : "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-[var(--radius-sm)]",
          ].join(" ")}
        >
          {message.content}
        </div>
        <span className="text-[var(--text-tertiary)] text-[10px] px-1">{time}</span>
      </div>
    </div>
  );
}
