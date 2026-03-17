/**
 * 執筆ログの型定義
 * Rust writing_log.rs に対応
 */

/** 執筆ログエントリ (ndjson 1行分, Rust WritingLogEntry に対応) */
export interface WritingLogEntry {
  /** 記録日時 (ISO 8601) */
  timestamp: string;
  /** プロジェクトID */
  project_id: string;
  /** 章ファイル名 */
  chapter: string;
  /** 文字数の増減 (マイナスは削除) */
  chars_delta: number;
  /** セッション内の累積執筆量 */
  session_chars: number;
}

/** 日次集計 (Rust DailyStat に対応) */
export interface DailyStat {
  /** 日付 (YYYY-MM-DD) */
  date: string;
  /** 合計執筆文字数 */
  total_chars: number;
}

/** 週次サマリー (Rust WeeklySummary に対応) */
export interface WeeklySummary {
  days: DailyStat[];
  total_chars: number;
  average_chars: number;
  active_days: number;
}

/** チャット履歴メタ (Rust ChatHistoryInfo に対応) */
export interface ChatHistoryInfo {
  filename: string;
  agent: string;
  date: string;
  updated_at: string;
}
