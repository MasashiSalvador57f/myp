import { PRESET_AGENTS, useChatStore } from "../../stores/chatStore";
import type { CustomPrompt } from "../../types";

interface AgentSelectorProps {
  customPrompts?: CustomPrompt[];
}

export function AgentSelector({ customPrompts = [] }: AgentSelectorProps) {
  const { selectedAgentId, selectedPromptId, selectAgent, selectPrompt } =
    useChatStore();

  return (
    <div className="space-y-2 p-3 border-b border-[var(--border-subtle)]">
      {/* プリセットエージェント */}
      <div>
        <p className="text-[var(--text-tertiary)] text-[10px] tracking-wide uppercase mb-1.5">
          エージェント
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_AGENTS.map((agent) => (
            <button
              key={agent.id}
              title={agent.description}
              className={[
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                selectedAgentId === agent.id && selectedPromptId === null
                  ? "bg-[var(--accent-primary)] text-[var(--text-inverse)]"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
              ].join(" ")}
              onClick={() => {
                selectAgent(agent.id);
                selectPrompt(null);
              }}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>

      {/* カスタムプロンプト */}
      {customPrompts.length > 0 && (
        <div>
          <p className="text-[var(--text-tertiary)] text-[10px] tracking-wide uppercase mb-1.5">
            カスタムプロンプト
          </p>
          <div className="flex flex-wrap gap-1.5">
            {customPrompts.map((prompt) => (
              <button
                key={prompt.id}
                title={prompt.content}
                className={[
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                  selectedPromptId === prompt.id
                    ? "bg-[var(--accent-primary)] text-[var(--text-inverse)]"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
                ].join(" ")}
                onClick={() => selectPrompt(prompt.id)}
              >
                {prompt.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
