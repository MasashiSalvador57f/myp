/**
 * AIチャット関連の型定義
 */

/** チャットメッセージのロール */
export type ChatRole = "user" | "assistant" | "system";

/** チャットメッセージ */
export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: string;
}

/** チャットセッション */
export interface ChatSession {
  /** セッションID */
  id: string;
  /** タイトル */
  title: string;
  /** 使用エージェント名 */
  agent: string;
  /** プロジェクトID */
  project_id: string;
  /** 作成日時 */
  created_at: string;
  /** メッセージ一覧 */
  messages: ChatMessage[];
}

/** プリセットエージェント定義 */
export interface PresetAgent {
  /** エージェントID */
  id: string;
  /** 表示名 */
  name: string;
  /** 説明 */
  description: string;
  /** システムプロンプト */
  system_prompt: string;
}

/** カスタムプロンプト */
export interface CustomPrompt {
  /** プロンプトID */
  id: string;
  /** 表示名 */
  name: string;
  /** プロンプト本文 */
  content: string;
  /** スコープ: グローバル or プロジェクト */
  scope: "global" | "project";
}
