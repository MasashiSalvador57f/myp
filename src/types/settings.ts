/**
 * アプリ設定の型定義
 * Rust settings.rs に対応
 */

/** エディタ表示方向 */
export type WritingDirection = "vertical" | "horizontal";

/** エディタ設定 (Rust EditorSettings に対応) */
export interface EditorSettings {
  /** フォントファミリー */
  font_family: string;
  /** フォントサイズ (px) */
  font_size: number;
  /** 表示方向 "vertical" | "horizontal" */
  writing_mode: string;
  /** 一行あたりの文字数 */
  chars_per_line: number;
  /** テーマ "dark" | "light" */
  theme: string;
}

/** AI設定 (Rust AiSettings に対応) */
export interface AiSettings {
  /** APIキー (null=未設定) */
  api_key: string | null;
  /** 使用モデル */
  model: string;
  /** プロバイダー */
  provider: string;
}

/** ストレージ設定 */
export interface StorageSettings {
  /** データ保存先ディレクトリ (null=デフォルト ~/.mypwriter) */
  data_dir: string | null;
  /** メモ保存先ディレクトリ (null=デフォルト ~/.mypwriter/memos/) */
  memo_dir: string | null;
}

/** アプリ全体設定 (settings.toml) */
export interface AppSettings {
  editor: EditorSettings;
  ai: AiSettings;
  storage: StorageSettings;
}
