/**
 * プロジェクト関連の型定義
 * Rust側 (src-tauri) のデータ構造と1:1対応
 */

/** プロジェクト設定 (project.toml に対応) */
export interface ProjectConfig {
  /** プロジェクト名 */
  name: string;
  /** 作成日時 (ISO 8601) */
  created_at: string;
  /** 更新日時 (ISO 8601) */
  updated_at: string;
  /** 目標執筆文字数 */
  target_char_count: number | null;
}

/** プロジェクト一覧用のサマリー */
export interface ProjectSummary {
  /** プロジェクトID (ディレクトリ名) */
  id: string;
  /** プロジェクト名 */
  name: string;
  /** 総文字数 */
  total_char_count: number;
  /** 目標文字数 */
  target_char_count: number | null;
  /** 更新日時 */
  updated_at: string;
}

/** 原稿ファイル情報 (Rust ManuscriptFile / ChapterInfo に対応) */
export interface ManuscriptFile {
  /** ファイル名 (例: "01.txt") */
  filename: string;
  /** 文字数 */
  char_count: number;
  /** 更新日時 */
  updated_at: string;
}

/** 資料ファイル情報 (Rust MaterialFile に対応) */
export interface MaterialFile {
  /** ファイル名 */
  filename: string;
  /** 種別: "chat" | "notes" */
  kind: string;
  /** 更新日時 */
  updated_at: string;
}

/** get_project の戻り値 (Rust GetProjectResult に対応) */
export interface GetProjectResult {
  id: string;
  config: ProjectConfig;
  manuscripts: ManuscriptFile[];
  materials: MaterialFile[];
  total_char_count: number;
}
