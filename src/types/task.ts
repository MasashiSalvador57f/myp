/**
 * タスクの型定義
 * Rust task.rs に対応
 */

/** タスク一覧用の概要情報 */
export interface TaskInfo {
  filename: string;
  title: string;
  done: boolean;
  created_at: string;
  project_id: string | null;
}

/** タスク詳細 (本文を含む) */
export interface TaskDetail {
  filename: string;
  title: string;
  body: string;
  done: boolean;
  created_at: string;
  project_id: string | null;
}
