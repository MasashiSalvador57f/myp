import type { ChatSession } from "../../types";
import { PRESET_AGENTS } from "../../stores/chatStore";

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelect: (session: ChatSession) => void;
  onNew: () => void;
}

export function ChatHistory({
  sessions,
  currentSessionId,
  onSelect,
  onNew,
}: ChatHistoryProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)]">
        <span className="text-[var(--text-tertiary)] text-xs font-medium">チャット履歴</span>
        <button
          onClick={onNew}
          className="text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors p-1 rounded"
          title="新しい相談を開始"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-xs text-center py-4 px-3">
            まだ履歴がありません
          </p>
        ) : (
          <div className="space-y-0.5 p-1">
            {sessions.map((session) => {
              const agent = PRESET_AGENTS.find((a) => a.id === session.agent);
              const date = new Date(session.created_at).toLocaleDateString("ja-JP", {
                month: "numeric",
                day: "numeric",
              });
              return (
                <button
                  key={session.id}
                  className={[
                    "w-full text-left px-3 py-2 rounded-[var(--radius-lg)] transition-colors",
                    currentSessionId === session.id
                      ? "bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                  ].join(" ")}
                  onClick={() => onSelect(session)}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-medium truncate">{session.title}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
                      {date}
                    </span>
                  </div>
                  {agent && (
                    <div className="text-[10px] text-[var(--text-tertiary)]">
                      {agent.name}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
