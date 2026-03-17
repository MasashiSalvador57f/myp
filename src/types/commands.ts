/**
 * Tauri コマンドインターフェース定義
 *
 * Rust 側の実装 (src-tauri/src/commands/) と1:1対応。
 */

import type { ProjectConfig, ProjectSummary, ManuscriptFile, MaterialFile, GetProjectResult } from "./project";
import type { AppSettings } from "./settings";
import type { WritingLogEntry, DailyStat, WeeklySummary, ChatHistoryInfo } from "./writing-log";
import type { ChatMessage } from "./chat";

// Re-export for convenience
export type {
  ProjectConfig,
  ProjectSummary,
  ManuscriptFile,
  MaterialFile,
  GetProjectResult,
  AppSettings,
  WritingLogEntry,
  DailyStat,
  WeeklySummary,
  ChatHistoryInfo,
  ChatMessage,
};
