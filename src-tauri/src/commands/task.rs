use chrono::Local;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use crate::utils;

// ─── Data structures ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskInfo {
    pub filename: String,
    pub title: String,
    pub done: bool,
    pub created_at: String,
    pub project_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskDetail {
    pub filename: String,
    pub title: String,
    pub body: String,
    pub done: bool,
    pub created_at: String,
    pub project_id: Option<String>,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/// タスク保存先ディレクトリを返す。
/// settings.toml の storage.task_dir が設定されていればそれを、
/// なければ ~/.mypwriter/tasks/ を返す。
fn task_dir() -> Result<PathBuf, String> {
    let app = utils::app_dir()?;
    let settings_path = app.join("settings.toml");
    if settings_path.exists() {
        if let Ok(raw) = std::fs::read_to_string(&settings_path) {
            if let Ok(settings) = toml::from_str::<toml::Value>(&raw) {
                if let Some(dir_str) = settings
                    .get("storage")
                    .and_then(|s| s.get("task_dir"))
                    .and_then(|v| v.as_str())
                {
                    if !dir_str.is_empty() {
                        let custom = PathBuf::from(dir_str);
                        std::fs::create_dir_all(&custom)
                            .map_err(|e| format!("タスクディレクトリの作成に失敗: {e}"))?;
                        return Ok(custom);
                    }
                }
            }
        }
    }
    // デフォルト: ~/.mypwriter/tasks/
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .map_err(|_| "ホームディレクトリが見つかりません".to_string())?;
    let default = PathBuf::from(home).join(".mypwriter").join("tasks");
    std::fs::create_dir_all(&default)
        .map_err(|e| format!("タスクディレクトリの作成に失敗: {e}"))?;
    Ok(default)
}

/// ファイル名 ("2026-03-17-143025.md") から日時文字列 ("2026-03-17 14:30:25") を生成。
fn filename_to_datetime(filename: &str) -> String {
    let stem = filename.trim_end_matches(".md");
    if stem.len() >= 17 {
        format!(
            "{} {}:{}:{}",
            &stem[0..10],
            &stem[11..13],
            &stem[13..15],
            &stem[15..17]
        )
    } else {
        stem.to_string()
    }
}

/// タスクファイルの1行目をタイトルとして取得。空なら "(無題)" を返す。
fn extract_title(content: &str) -> String {
    content
        .lines()
        .next()
        .map(|l| l.trim().to_string())
        .filter(|l| !l.is_empty())
        .unwrap_or_else(|| "(無題)".to_string())
}

/// メタデータ行 `<!-- project: xxx -->` からproject_idを抽出
fn extract_project_id(content: &str) -> Option<String> {
    for line in content.lines() {
        let trimmed = line.trim();
        if let Some(rest) = trimmed.strip_prefix("<!-- project:") {
            if let Some(id) = rest.strip_suffix("-->") {
                let id = id.trim();
                if !id.is_empty() {
                    return Some(id.to_string());
                }
            }
        }
    }
    None
}

/// メタデータ行 `<!-- done: true -->` から完了フラグを抽出
fn extract_done(content: &str) -> bool {
    for line in content.lines() {
        let trimmed = line.trim();
        if let Some(rest) = trimmed.strip_prefix("<!-- done:") {
            if let Some(val) = rest.strip_suffix("-->") {
                return val.trim() == "true";
            }
        }
    }
    false
}

/// タスクのファイル内容を生成（タイトル + メタデータ行 + 本文）
fn build_task_content(title: &str, body: &str, done: bool, project_id: &Option<String>) -> String {
    let mut content = format!("{}\n", title);
    if let Some(pid) = project_id {
        if !pid.is_empty() {
            content.push_str(&format!("<!-- project: {} -->\n", pid));
        }
    }
    if done {
        content.push_str("<!-- done: true -->\n");
    }
    if !body.trim().is_empty() {
        content.push_str(body);
        if !body.ends_with('\n') {
            content.push('\n');
        }
    }
    content
}

/// タスク本文を取得（タイトル行とメタデータ行を除く）
fn extract_body(content: &str) -> String {
    content
        .lines()
        .skip(1) // タイトル行
        .filter(|l| {
            let t = l.trim();
            !t.starts_with("<!-- project:") && !t.starts_with("<!-- done:")
        })
        .collect::<Vec<_>>()
        .join("\n")
        .trim()
        .to_string()
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/// タスク一覧を新しい順に返す。project_id が指定されていればフィルタする。
#[tauri::command]
pub fn list_tasks(project_id: Option<String>) -> Result<Vec<TaskInfo>, String> {
    let dir = task_dir()?;
    let mut tasks: Vec<TaskInfo> = Vec::new();

    if !dir.exists() {
        return Ok(tasks);
    }

    let entries = std::fs::read_dir(&dir)
        .map_err(|e| format!("タスクディレクトリの読み込みに失敗: {e}"))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("md") {
            let filename = entry.file_name().to_string_lossy().to_string();
            let content = std::fs::read_to_string(&path).unwrap_or_default();
            let title = extract_title(&content);
            let task_project_id = extract_project_id(&content);
            let done = extract_done(&content);
            let created_at = filename_to_datetime(&filename);

            // project_id フィルタ
            if let Some(ref pid) = project_id {
                if task_project_id.as_deref() != Some(pid.as_str()) {
                    continue;
                }
            }

            tasks.push(TaskInfo {
                filename,
                title,
                done,
                created_at,
                project_id: task_project_id,
            });
        }
    }

    // 新しい順（ファイル名降順）
    tasks.sort_by(|a, b| b.filename.cmp(&a.filename));
    Ok(tasks)
}

/// タスクの詳細を読み込む。
#[tauri::command]
pub fn read_task(filename: String) -> Result<TaskDetail, String> {
    let path = task_dir()?.join(&filename);
    if !path.exists() {
        return Err(format!("タスクが見つかりません: {filename}"));
    }
    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("タスクの読み込みに失敗: {e}"))?;
    let title = extract_title(&content);
    let body = extract_body(&content);
    let done = extract_done(&content);
    let project_id = extract_project_id(&content);
    let created_at = filename_to_datetime(&filename);
    Ok(TaskDetail {
        filename,
        title,
        body,
        done,
        created_at,
        project_id,
    })
}

/// 新規タスクを作成する。
#[tauri::command]
pub fn create_task(
    title: String,
    body: String,
    project_id: Option<String>,
) -> Result<TaskInfo, String> {
    let dir = task_dir()?;
    let now = Local::now();
    let filename = format!("{}.md", now.format("%Y-%m-%d-%H%M%S"));
    let path = dir.join(&filename);

    let content = build_task_content(&title, &body, false, &project_id);

    std::fs::write(&path, &content)
        .map_err(|e| format!("タスクの保存に失敗: {e}"))?;

    let created_at = filename_to_datetime(&filename);
    Ok(TaskInfo {
        filename,
        title: if title.is_empty() {
            "(無題)".to_string()
        } else {
            title
        },
        done: false,
        created_at,
        project_id,
    })
}

/// タスクを更新する。
#[tauri::command]
pub fn update_task(
    filename: String,
    title: String,
    body: String,
    done: bool,
    project_id: Option<String>,
) -> Result<TaskInfo, String> {
    let path = task_dir()?.join(&filename);
    if !path.exists() {
        return Err(format!("タスクが見つかりません: {filename}"));
    }

    let content = build_task_content(&title, &body, done, &project_id);

    std::fs::write(&path, &content)
        .map_err(|e| format!("タスクの保存に失敗: {e}"))?;

    let created_at = filename_to_datetime(&filename);
    Ok(TaskInfo {
        filename,
        title: if title.is_empty() {
            "(無題)".to_string()
        } else {
            title
        },
        done,
        created_at,
        project_id,
    })
}

/// タスクをアーカイブする（archived/ ディレクトリに移動）。
#[tauri::command]
pub fn delete_task(filename: String) -> Result<(), String> {
    let dir = task_dir()?;
    let path = dir.join(&filename);
    if !path.exists() {
        return Err(format!("タスクが見つかりません: {filename}"));
    }
    let archived_dir = dir.join("archived");
    std::fs::create_dir_all(&archived_dir)
        .map_err(|e| format!("archivedディレクトリの作成に失敗: {e}"))?;
    let dest = archived_dir.join(&filename);
    std::fs::rename(&path, &dest)
        .map_err(|e| format!("タスクのアーカイブに失敗: {e}"))?;
    Ok(())
}
