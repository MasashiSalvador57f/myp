/**
 * AIチャット関連の型定義
 */

/** チャットメッセージのロール */
export type ChatRole = "user" | "assistant" | "system";

/** AI利用時のメタ情報 */
export interface AIUsageInfo {
  /** 使用モデル名 */
  model: string;
  /** 入力トークン数 */
  promptTokens: number;
  /** 出力トークン数 */
  completionTokens: number;
  /** 合計トークン数 */
  totalTokens: number;
}

/** チャットメッセージ */
export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: string;
  /** AI利用時のメタ情報（assistantメッセージのみ） */
  usage?: AIUsageInfo;
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
