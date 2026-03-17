import { create } from "zustand";
import type { ChatSession, ChatMessage, PresetAgent } from "../types";
import * as commands from "../lib/tauri-commands";
import { streamChatMessage, type AIMessage, type AIServiceConfig } from "../lib/ai-service";
import { getAllAgents } from "../components/settings/AgentSettings";

/** プリセットエージェント定義 */
export const PRESET_AGENTS: PresetAgent[] = [
  {
    id: "plot-editor",
    name: "キャラクター分析エージェント",
    description: "キャラクターを分析する脚本ドクターです",
    system_prompt:
    `
Role

あなたは心理学に精通した文芸批評家であり、脚本ドクターです。キャラクターの「主体性（Agency）」と「心理的整合性」を厳しく評価します。

Task

入力されたテキスト における主人公 の心理描写と動機の深さを分析してください。

Analysis Framework

主体性チェック（Agency Audit）: キャラクターが自ら決断し行動した回数と、状況に流された回数を比較してください。

外面と内面のギャップ（The Gap）: キャラクターの「セリフ」と「内面独白（あるいは行動）」に食い違いがある箇所を探してください。このギャップこそが人間的な深みです。

Whydunit（動機）の強度: その行動原理が、過去の経験やトラウマ、あるいは切実な欲求に基づいているか評価してください。「著者の都合」で動かされていると感じる箇所があれば指摘してください。

Output Format

キャラクター心理プロファイル

主体性スコア（1-10）: [スコア]

動機の説得力: [分析コメント]

「ギャップ」の検出: [セリフと本音のズレが生じている箇所の引用]

改善提案: [より心理的葛藤を深めるためのシチュエーション提案]
    `
  },
  {
    id: "style-reviewer",
    name: "シーン・ビート分析エージェント",
    description: "シーンとビートを分析します",
    system_prompt:
    `
    # 命令書

あなたは熟練した脚本家兼、文芸編集者です。

提供された【物語のプロットのテキスト】を深く読み込み、以下の3つの観点（シーン、ビート、感情曲線）から詳細な構造分析を行ってください。



## 分析対象テキスト

[ここに物語のテキストを貼り付けてください]



---



## 出力フォーマット



### 1. シーン構成の概要

テキスト全体をシーン（場面）ごとに区切り、以下の情報をリスト化してください。

* **シーンID**: （例: Scene 1）

* **場所/時間**:

* **シーンの目的（Goal）**: キャラクターはこのシーンで何を達成しようとしているか。

* **シーンの核心（Climax）**: そのシーンの中で最も緊張が高まる瞬間。

* **シーンの結末（Outcome）**: 目的は達成されたか、失敗したか。



### 2. ビート分析（詳細解剖）

指定した主要シーン（またはテキスト全体）について、アクションとリアクションの最小単位「ビート」に分解し、テーブル形式で出力してください。

**特に「価値（バリュー）」の変化に注目してください。**



| ビートID | 行動/出来事（Action） | 反応（Reaction） | 価値の変化（Value Charge） | 解説 |

| :--- | :--- | :--- | :--- | :--- |

| 1 | 主人公が提案をする | 相手が冷たく拒絶する | 期待(+) → 失望(-) | 信頼関係が崩れる瞬間 |

| ... | ... | ... | ... | ... |



* **価値の変化**: シーン内の状況がポジティブ（+）になったか、ネガティブ（-）になったかを記述してください。



### 3. キャラクターの感情曲線（エモーショナル・アーク）

主要キャラクターごとの感情の推移を時系列で追跡し、数値とキーワードで可視化してください。



**【キャラクター名: 〇〇】**

* **初期状態**: [感情キーワード] （精神状態スコア: -5 〜 +5）

    * *理由*: なぜその感情なのか。

* **変化点（トリガー）**:

    * どのビートで感情が大きく動いたか。

* **終了状態**: [感情キーワード] （精神状態スコア: -5 〜 +5）

    * *結果*: 最終的にどのような内面的変化（アーク）を遂げたか。



**ASCIIグラフによる可視化（任意）:**

（縦軸を感情のポジティブ/ネガティブ、横軸を進行度として、感情の波を簡易的なグラフで表現してください）



---



## 制約事項

* 分析は客観的かつ論理的に行ってください。

* サブテキスト（書かれていない行間）も読み取り、解説に含めてください。

* 出力は見やすいMarkdown形式にしてください。
    `
  },
  {
    id: "consistency-checker",
    name: "伏線解析エージェント",
    description: "時系列・設定・キャラクターの言動の矛盾を検出します",
    system_prompt:
      `
Role Definition

あなたは、サスペンス小説およびエンターテインメント小説の構造解析を専門とする「文芸批評家」兼「敏腕編集者」です。
あなたは以下の能力に長けています：
伏線の追跡: テキスト内に埋め込まれた微細な手がかり（Chekhov's Gun）を検出し、それが物語の結末までに適切に回収（発砲）されたかを判定する能力。
心理的整合性の監視: キャラクターの言動、感情反応、内的独白の一貫性を分析し、不自然な飛躍や矛盾（Character Inconsistency）を見抜く能力。

情報の非対称性の評価: 「読者が知っていること」と「登場人物が知っていること」のズレを管理し、それがフェアなサスペンスとして機能しているか、あるいは単なる説明不足（Plot Hole）かを識別する能力。

Task Objective

提供された小説のテキスト（または詳細なプロット・あらすじ）を精読し、読者が読了後に感じるであろう「未回収の謎」「消化不良な要素」「論理的・心理的な矛盾」を網羅的にリストアップしてください。

※注意：本格ミステリ（Honkaku）に見られるような物理的トリックの精密な検証（時刻表の分単位の精査など）は対象外とします。あくまで物語体験としての「違和感」に焦点を当ててください。

Analysis Guidelines (Chain of Thought)

分析は以下のステップに従って行い、思考プロセスを <thinking> タグ内に出力してください。

Step 1: テキストのスキャンと要素抽出

主要な謎（Central Mystery）: 物語を牽引する中心的な謎は何か？

伏線マーカー（Foreshadowing Markers）: 意味ありげに強調されたアイテム、反復される描写、不自然な感情反応、謎めいた台詞を抽出する。

キャラクター動機（Character Motivations）: 主要人物の行動原理と目標を特定する。

Step 2: 整合性検証（Verification）

抽出した要素について、物語の結末と照合し、以下の観点で検証を行う。

事実的整合性（Factual）:

消失したアイテムはないか？

説明のつかない移動や出来事はないか？

提示された謎に対して、論理的な回答が示されたか？

心理的整合性（Psychological）:

キャラクターの最終的な行動は、それまでの性格描写や動機と整合しているか？

感情の変化（和解、許し、殺意）に十分なプロセスと説得力があるか？

異常な状況に対する反応（過剰・過少）への説明はなされたか？

構造的整合性（Structural）:

「思わせぶりな描写（Red Herrings）」は、ミスリードとして機能した後、真相が明かされたか？（放置されていないか？）

語り手の嘘や隠蔽は、最終的に開示されたか？

Step 3: 重要度判定と分類

発見された「未回収の謎」を以下の重要度でランク付けし、分類する。

High (致命的): 物語の根幹に関わる矛盾、納得感を著しく損なう動機の欠落。

Medium (気になる): サブプロットの放置、説明不足な伏線。

Low (軽微/解釈次第): 細部の矛盾、好みが分かれる解釈の余地。

Output Format

分析結果は以下のMarkdown形式で出力してください。

分析レポート：未回収の謎と読者の違和感リスト

1. 【Fact】事実・プロット上の未回収（Plot Holes & Loose Ends）

No.謎・矛盾の内容発生箇所（根拠）なぜ「未解決」と判断されるか重要度1（例）凶器のナイフの行方第3章で犯人が隠した描写があるが、捜索で見つかっていない。警察の捜査で見つからなかった理由も、犯人が回収した描写もなく、物語から消滅しているため。High

2. 【Psychology】心理・動機の不整合（Motivational Inconsistencies）

No.違和感の内容発生箇所（根拠）なぜ「納得できない」か重要度1（例）Bの急激な心変わりクライマックスの対決シーン直前まで強い殺意を持っていたにも関わらず、主人公の一言で改心するプロセスが描写不足。過去のトラウマとの整合性がない。Medium

3. 【Thematic/Structural】テーマ・構造上の未解決（Unresolved Themes）

項目: （例）「信頼」というテーマの放棄

分析: 物語全体で「信頼」の重要性を説いていたが、結末では裏切りによる解決が正当化されており、テーマ的な結論が出ていない。

4. 総評と改善提案

（読者の満足度を向上させるために、どの謎を優先的に解決・説明すべきかの具体的アドバイス）
      `,
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
  loadSessionsFromDisk: (projectId: string) => Promise<void>;
  loadSessions: (savedSessions: ChatSession[]) => void;
  switchSession: (session: ChatSession) => void;
  clearCurrentSession: () => void;
  clearError: () => void;
}

function generateId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** セッションをディスクに自動保存 */
async function persistSession(session: ChatSession) {
  try {
    await commands.saveChatSession(session.project_id, JSON.stringify(session));
  } catch (e) {
    console.error("セッションの自動保存に失敗:", e);
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSession: null,
  selectedAgentId: "plot-editor",
  selectedPromptId: null,
  loading: false,
  error: null,

  startNewSession: (projectId: string, agentId: string) => {
    const allAgents = getAllAgents();
    const agent = allAgents.find((a) => a.id === agentId) ?? allAgents[0];
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
        getAllAgents().find((a) => a.id === state.selectedAgentId) ??
        getAllAgents()[0];
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

    // AI設定を取得
    let settings;
    try {
      settings = await commands.getSettings();
    } catch {
      settings = null;
    }

    const provider = (settings?.ai?.provider ?? "openai") as "openai" | "gemini";
    const apiKey = provider === "gemini"
      ? settings?.ai?.gemini_api_key
      : settings?.ai?.api_key;

    if (!apiKey) {
      const providerName = provider === "gemini" ? "Gemini" : "OpenAI";
      set({ error: `${providerName}のAPIキーが設定されていません。設定画面から入力してください。`, loading: false });
      return;
    }

    // システムプロンプトを構築
    const agentDef = getAllAgents().find((a) => a.id === session!.agent) ?? getAllAgents()[0];
    let systemPrompt = agentDef.system_prompt;
    if (context) {
      systemPrompt += `\n\n---\n以下は参照中の原稿テキストです:\n${context}`;
    }

    const aiMessages: AIMessage[] = updatedMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const aiConfig: AIServiceConfig = { provider, apiKey };

    const placeholderMessage: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      currentSession: s.currentSession
        ? { ...s.currentSession, messages: [...s.currentSession.messages, placeholderMessage] }
        : null,
    }));

    await streamChatMessage(
      aiConfig,
      systemPrompt,
      aiMessages,
      (partialText) => {
        set((s) => {
          if (!s.currentSession) return s;
          const msgs = [...s.currentSession.messages];
          const lastIdx = msgs.length - 1;
          if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
            msgs[lastIdx] = { ...msgs[lastIdx], content: partialText };
          }
          return { currentSession: { ...s.currentSession, messages: msgs } };
        });
      },
      (fullText) => {
        set((s) => {
          if (!s.currentSession) return s;
          const msgs = [...s.currentSession.messages];
          const lastIdx = msgs.length - 1;
          if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
            msgs[lastIdx] = { ...msgs[lastIdx], content: fullText, timestamp: new Date().toISOString() };
          }
          const updatedSession = { ...s.currentSession, messages: msgs };
          // 自動保存 + セッション一覧に追加/更新
          void persistSession(updatedSession);
          const existsInSessions = s.sessions.some((ss) => ss.id === updatedSession.id);
          const newSessions = existsInSessions
            ? s.sessions.map((ss) => ss.id === updatedSession.id ? updatedSession : ss)
            : [...s.sessions, updatedSession];
          return { currentSession: updatedSession, sessions: newSessions, loading: false };
        });
      },
      (error) => {
        set((s) => {
          if (!s.currentSession) return { error: error.message, loading: false };
          const msgs = s.currentSession.messages.filter(
            (_, i) => i !== s.currentSession!.messages.length - 1
          );
          return {
            currentSession: { ...s.currentSession, messages: msgs },
            error: error.message,
            loading: false,
          };
        });
      },
    );
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
      await persistSession(currentSession);
      return filename;
    } catch (e) {
      set({ error: String(e) });
      return null;
    }
  },

  loadSessionsFromDisk: async (projectId: string) => {
    try {
      const jsonStrings = await commands.loadChatSessions(projectId);
      const sessions: ChatSession[] = jsonStrings
        .map((s) => {
          try { return JSON.parse(s) as ChatSession; }
          catch { return null; }
        })
        .filter((s): s is ChatSession => s !== null);
      set({ sessions });
    } catch {
      set({ sessions: [] });
    }
  },

  loadSessions: (savedSessions: ChatSession[]) => {
    set({ sessions: savedSessions });
  },

  switchSession: (session: ChatSession) => {
    set({ currentSession: session });
  },

  clearCurrentSession: () => set({ currentSession: null }),

  clearError: () => set({ error: null }),
}));
