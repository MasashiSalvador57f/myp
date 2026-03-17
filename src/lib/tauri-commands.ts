/**
 * Tauri コマンドへの型付きラッパー
 * Rust バックエンドのコマンド名・引数・戻り値と1:1対応
 */

import { invoke } from "@tauri-apps/api/core";
import type {
  ProjectSummary,
  ProjectConfig,
  ManuscriptFile,
  GetProjectResult,
} from "../types/project";
import type { AppSettings } from "../types/settings";
import type {
  WritingLogEntry,
  DailyStat,
  WeeklySummary,
  ChatHistoryInfo,
} from "../types/writing-log";
import type { ChatMessage } from "../types/chat";

// ─── プロジェクト管理 ───

/** プロジェクト新規作成 → ProjectSummary を返す */
export async function createProject(
  name: string,
  target_char_count?: number | null
): Promise<ProjectSummary> {
  return invoke<ProjectSummary>("create_project", {
    name,
    targetCharCount: target_char_count ?? null,
  });
}

/** 全プロジェクト一覧 (更新日時降順) */
export async function listProjects(): Promise<ProjectSummary[]> {
  return invoke<ProjectSummary[]>("list_projects");
}

/** プロジェクト詳細 */
export async function getProject(
  projectId: string
): Promise<GetProjectResult> {
  return invoke<GetProjectResult>("get_project", { projectId });
}

/** プロジェクト更新 (名前・目標文字数) */
export async function updateProject(
  projectId: string,
  name?: string | null,
  target_char_count?: number | null
): Promise<ProjectConfig> {
  return invoke<ProjectConfig>("update_project", {
    projectId,
    name: name ?? null,
    targetCharCount: target_char_count ?? null,
  });
}

/** プロジェクト削除 */
export async function deleteProject(projectId: string): Promise<void> {
  return invoke("delete_project", { projectId });
}

// ─── 章ファイル操作 ───

/** 章ファイル一覧 */
export async function listChapters(
  projectId: string
): Promise<ManuscriptFile[]> {
  return invoke<ManuscriptFile[]>("list_chapters", {
    projectId,
  });
}

/** 章ファイル読み込み */
export async function readChapter(
  projectId: string,
  filename: string
): Promise<{ content: string; char_count: number }> {
  return invoke("read_chapter", { projectId, filename });
}

/** 章ファイル保存 */
export async function saveChapter(
  projectId: string,
  filename: string,
  content: string
): Promise<void> {
  return invoke("save_chapter", { projectId, filename, content });
}

/** 章ファイル新規作成 */
export async function createChapter(
  projectId: string,
  title?: string | null
): Promise<ManuscriptFile> {
  return invoke<ManuscriptFile>("create_chapter", {
    projectId,
    title: title ?? null,
  });
}

/** 章ファイルリネーム */
export async function renameChapter(
  projectId: string,
  oldName: string,
  newName: string
): Promise<void> {
  return invoke("rename_chapter", {
    projectId,
    oldName,
    newName,
  });
}

/** 章ファイル削除 */
export async function deleteChapter(
  projectId: string,
  filename: string
): Promise<void> {
  return invoke("delete_chapter", { projectId, filename });
}

// ─── 設定 ───

/** 設定読み込み */
export async function getSettings(): Promise<AppSettings> {
  return invoke<AppSettings>("get_settings");
}

/** 設定保存 (全体を上書き) */
export async function saveSettings(settings: AppSettings): Promise<void> {
  return invoke("save_settings", { settings });
}

/** 現在のデータ保存先ディレクトリを取得 */
export async function getDataDirPath(): Promise<string> {
  return invoke<string>("get_data_dir_path");
}

// ─── 執筆ログ ───

/** 執筆ログ追記 */
export async function appendWritingLog(
  projectId: string,
  chapter: string,
  charsDelta: number,
  sessionChars: number
): Promise<void> {
  return invoke("append_writing_log", {
    projectId,
    chapter,
    charsDelta,
    sessionChars,
  });
}

/** 執筆ログ取得 (フィルタ付き) */
export async function getWritingLogs(
  projectId?: string | null,
  from?: string | null,
  to?: string | null
): Promise<WritingLogEntry[]> {
  return invoke<WritingLogEntry[]>("get_writing_logs", {
    projectId: projectId ?? null,
    from: from ?? null,
    to: to ?? null,
  });
}

/** 日次集計 (直近N日分) */
export async function getDailyStats(days: number): Promise<DailyStat[]> {
  return invoke<DailyStat[]>("get_daily_stats", { days });
}

/** 週次サマリー */
export async function getWeeklySummary(): Promise<WeeklySummary> {
  return invoke<WeeklySummary>("get_weekly_summary");
}

// ─── AI チャット ───

/** AIメッセージ送信 (Anthropic API経由) */
export async function sendChatMessage(
  projectId: string,
  agent: string,
  messages: ChatMessage[],
  context?: string | null
): Promise<string> {
  return invoke<string>("send_chat_message", {
    projectId,
    agent,
    messages,
    context: context ?? null,
  });
}

/** チャット履歴保存 */
export async function saveChatHistory(
  projectId: string,
  agent: string,
  messages: ChatMessage[]
): Promise<string> {
  return invoke<string>("save_chat_history", {
    projectId,
    agent,
    messages,
  });
}

/** チャット履歴一覧 */
export async function listChatHistories(
  projectId: string
): Promise<ChatHistoryInfo[]> {
  return invoke<ChatHistoryInfo[]>("list_chat_histories", {
    projectId,
  });
}

/** チャット履歴読み込み */
export async function readChatHistory(
  projectId: string,
  filename: string
): Promise<string> {
  return invoke<string>("read_chat_history", {
    projectId,
    filename,
  });
}

// ─── アイデアメモ ───

import type { MemoInfo, MemoDetail } from "../types/memo";

/** 現在のメモ保存先ディレクトリパスを取得 */
export async function getMemoDirPath(): Promise<string> {
  return invoke<string>("get_memo_dir");
}

/** メモ一覧 (新しい順) */
export async function listMemos(): Promise<MemoInfo[]> {
  return invoke<MemoInfo[]>("list_memos");
}

/** メモ詳細読み込み */
export async function readMemo(filename: string): Promise<MemoDetail> {
  return invoke<MemoDetail>("read_memo", { filename });
}

/** 新規メモ作成 */
export async function createMemo(
  title: string,
  body: string,
  projectId?: string | null
): Promise<MemoInfo> {
  return invoke<MemoInfo>("create_memo", { title, body, projectId: projectId ?? null });
}

/** メモ更新 */
export async function updateMemo(
  filename: string,
  title: string,
  body: string,
  projectId?: string | null
): Promise<MemoInfo> {
  return invoke<MemoInfo>("update_memo", { filename, title, body, projectId: projectId ?? null });
}

/** メモ削除 */
export async function deleteMemo(filename: string): Promise<void> {
  return invoke("delete_memo", { filename });
}

// ─── プロンプト管理 ───

export interface PromptInfo {
  id: string;
  name: string;
  kind: string;
}

/** プリセットプロンプト一覧 */
export async function listPresetPrompts(): Promise<PromptInfo[]> {
  return invoke<PromptInfo[]>("list_preset_prompts");
}

/** カスタムプロンプト一覧 */
export async function listCustomPrompts(): Promise<PromptInfo[]> {
  return invoke<PromptInfo[]>("list_custom_prompts");
}

/** プロンプト内容取得 */
export async function getPrompt(
  kind: string,
  id: string
): Promise<string> {
  return invoke<string>("get_prompt", { kind, id });
}

/** カスタムプロンプト保存 */
export async function saveCustomPrompt(
  id: string,
  content: string
): Promise<void> {
  return invoke("save_custom_prompt", { id, content });
}

/** カスタムプロンプト削除 */
export async function deleteCustomPrompt(id: string): Promise<void> {
  return invoke("delete_custom_prompt", { id });
}

// ─── タスク管理 ───

import type { TaskInfo, TaskDetail } from "../types/task";

/** タスク一覧 (新しい順、project_id でフィルタ可能) */
export async function listTasks(projectId?: string | null): Promise<TaskInfo[]> {
  return invoke<TaskInfo[]>("list_tasks", { projectId: projectId ?? null });
}

/** タスク詳細読み込み */
export async function readTask(filename: string): Promise<TaskDetail> {
  return invoke<TaskDetail>("read_task", { filename });
}

/** 新規タスク作成 */
export async function createTask(
  title: string,
  body: string,
  projectId?: string | null
): Promise<TaskInfo> {
  return invoke<TaskInfo>("create_task", { title, body, projectId: projectId ?? null });
}

/** タスク更新 */
export async function updateTask(
  filename: string,
  title: string,
  body: string,
  done: boolean,
  projectId?: string | null
): Promise<TaskInfo> {
  return invoke<TaskInfo>("update_task", { filename, title, body, done, projectId: projectId ?? null });
}

/** タスク削除 (アーカイブ) */
export async function deleteTask(filename: string): Promise<void> {
  return invoke("delete_task", { filename });
}
