/**
 * アイデアメモの型定義
 * Rust memo.rs に対応
 */

/** メモ一覧用の概要情報 */
export interface MemoInfo {
  filename: string;
  title: string;
  created_at: string;
}

/** メモ詳細 (本文を含む) */
export interface MemoDetail {
  filename: string;
  title: string;
  body: string;
  created_at: string;
}
