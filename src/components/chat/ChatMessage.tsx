import ReactMarkdown from "react-markdown";
import type { ChatMessage as ChatMessageType } from "../../types";

interface ChatMessageProps {
  message: ChatMessageType;
  /** AIメッセージのアクション: 新規メモとして保存 */
  onSaveAsMemo?: (content: string) => void;
  /** AIメッセージのアクション: 既存メモに追記 */
  onAppendToMemo?: (content: string) => void;
}

export function ChatMessage({ message, onSaveAsMemo, onAppendToMemo }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const time = new Date(message.timestamp).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"} group`}
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
            "px-3 py-2 rounded-[var(--radius-xl)] text-sm leading-relaxed",
            isUser
              ? "bg-[var(--accent-primary)] text-[var(--text-inverse)] rounded-tr-[var(--radius-sm)] whitespace-pre-wrap"
              : "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-[var(--radius-sm)] chat-markdown",
          ].join(" ")}
        >
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="text-[var(--text-tertiary)] text-[10px]">{time}</span>

          {/* AIメッセージのアクションボタン */}
          {isAssistant && message.content && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onSaveAsMemo && (
                <button
                  onClick={() => onSaveAsMemo(message.content)}
                  className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
                  title="新規メモとして保存"
                >
                  メモにする
                </button>
              )}
              {onAppendToMemo && (
                <button
                  onClick={() => onAppendToMemo(message.content)}
                  className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
                  title="既存メモに追記"
                >
                  メモに追記
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
