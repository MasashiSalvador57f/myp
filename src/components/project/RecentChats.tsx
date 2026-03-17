import type { MaterialFile } from "../../types";

interface RecentChatsProps {
  materials: MaterialFile[];
  onOpen?: (material: MaterialFile) => void;
}

export function RecentChats({ materials, onOpen }: RecentChatsProps) {
  const chatMaterials = materials
    .filter((m) => m.kind === "chat")
    .slice(0, 5);

  if (chatMaterials.length === 0) {
    return (
      <div className="text-[var(--text-tertiary)] text-sm text-center py-4">
        AI相談の履歴がありません
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chatMaterials.map((material) => {
        const date = new Date(material.updated_at).toLocaleDateString("ja-JP", {
          month: "numeric",
          day: "numeric",
        });
        // ファイル名から .md を除いてタイトルとして表示
        const title = material.filename.replace(/\.md$/, "");

        return (
          <button
            key={material.filename}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-lg)] hover:bg-[var(--bg-hover)] transition-colors text-left group"
            onClick={() => onOpen?.(material)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[var(--text-tertiary)] shrink-0"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="flex-1 text-[var(--text-secondary)] text-sm truncate group-hover:text-[var(--text-primary)] transition-colors">
              {title}
            </span>
            <span className="text-[var(--text-tertiary)] text-xs shrink-0">{date}</span>
          </button>
        );
      })}
    </div>
  );
}
