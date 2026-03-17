import { create } from "zustand";
import type { ChatSession, ChatMessage, PresetAgent } from "../types";
import * as commands from "../lib/tauri-commands";

/** プリセットエージェント定義 */
export const PRESET_AGENTS: PresetAgent[] = [
  {
    id: "plot-editor",
    name: "プロット編集者",
    description: "物語の構成・展開・伏線を分析し、改善案を提案します",
    system_prompt:
      "あなたは経験豊富なプロット編集者です。物語の構成、展開、伏線の設置と回収、キャラクターアークについて深く分析し、具体的な改善案を提案してください。作品の世界観と作者の意図を尊重しながら、読者が引き込まれる物語づくりをサポートします。",
  },
  {
    id: "style-reviewer",
    name: "文体レビュワー",
    description: "文章の表現・リズム・語彙を読み込み、文体の改善を提案します",
    system_prompt:
      "あなたは文体の専門家です。文章のリズム、語彙の選択、表現の豊かさ、句読点の使い方などを分析し、より魅力的な文体に磨き上げるための具体的なアドバイスを提供します。作者の個性を大切にしながら、読みやすく印象的な文章へと導きます。",
  },
  {
    id: "consistency-checker",
    name: "整合性チェッカー",
    description: "時系列・設定・キャラクターの言動の矛盾を検出します",
    system_prompt:
      "あなたは細部まで目を光らせる整合性チェッカーです。登場人物の設定・言動、時系列、世界観のルール、場所の描写など、作品内の矛盾や不整合を丁寧に指摘します。指摘の際は修正案も合わせて提案し、作品のクオリティ向上に貢献します。",
  },
  {
    id: "character-partner",
    name: "キャラクター壁打ち役",
    description: "キャラクターになりきって対話し、キャラクター造形を深めます",
    system_prompt:
      "あなたはキャラクター造形の専門家です。作者が提示したキャラクターの設定を深く理解し、そのキャラクターとして対話したり、キャラクターの心理・動機・バックグラウンドについて掘り下げる質問を投げかけたりします。作者がキャラクターをより立体的に描くためのサポートをします。",
  },
  {
    id: "first-reader",
    name: "初見読者レビュー",
    description: "初めて読む読者の視点でフィードバックを提供します",
    system_prompt:
      "あなたはこの作品を初めて読む一般読者です。読者として感じた率直な感想、わかりにくかった点、引き込まれた部分、もっと知りたいと思った情報などを正直にフィードバックします。作者の意図を忖度せず、純粋な読者目線で作品と向き合います。",
  },
];

interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  selectedAgentId: string;
  selectedPromptId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  startNewSession: (projectId: string, agentId: string) => void;
  sendMessage: (projectId: string, content: string, context?: string) => Promise<void>;
  selectAgent: (agentId: string) => void;
  selectPrompt: (promptId: string | null) => void;
  saveCurrentSession: () => Promise<string | null>;
  loadSessions: (savedSessions: ChatSession[]) => void;
  clearCurrentSession: () => void;
  clearError: () => void;
}

function generateId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSession: null,
  selectedAgentId: "plot-editor",
  selectedPromptId: null,
  loading: false,
  error: null,

  startNewSession: (projectId: string, agentId: string) => {
    const agent = PRESET_AGENTS.find((a) => a.id === agentId) ?? PRESET_AGENTS[0];
    const session: ChatSession = {
      id: generateId(),
      title: `${agent.name}との相談`,
      agent: agentId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      messages: [],
    };
    set({ currentSession: session, selectedAgentId: agentId });
  },

  sendMessage: async (
    projectId: string,
    content: string,
    context?: string
  ) => {
    const state = get();
    const userMessage: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    let session = state.currentSession;
    if (!session) {
      const agent =
        PRESET_AGENTS.find((a) => a.id === state.selectedAgentId) ??
        PRESET_AGENTS[0];
      session = {
        id: generateId(),
        title: `${agent.name}との相談`,
        agent: state.selectedAgentId,
        project_id: projectId,
        created_at: new Date().toISOString(),
        messages: [],
      };
    }

    const updatedMessages = [...session.messages, userMessage];
    set({
      currentSession: { ...session, messages: updatedMessages },
      loading: true,
      error: null,
    });

    try {
      // Backend resolves system prompt from agent id
      const reply = await commands.sendChatMessage(
        projectId,
        session.agent,
        updatedMessages,
        context
      );
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        currentSession: s.currentSession
          ? {
              ...s.currentSession,
              messages: [...s.currentSession.messages, assistantMessage],
            }
          : null,
        loading: false,
      }));
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  selectAgent: (agentId: string) => set({ selectedAgentId: agentId }),

  selectPrompt: (promptId: string | null) =>
    set({ selectedPromptId: promptId }),

  saveCurrentSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return null;
    try {
      const filename = await commands.saveChatHistory(
        currentSession.project_id,
        currentSession.agent,
        currentSession.messages
      );
      set((s) => ({
        sessions: [...s.sessions, currentSession],
      }));
      return filename;
    } catch (e) {
      set({ error: String(e) });
      return null;
    }
  },

  loadSessions: (savedSessions: ChatSession[]) => {
    set({ sessions: savedSessions });
  },

  clearCurrentSession: () => set({ currentSession: null }),

  clearError: () => set({ error: null }),
}));
