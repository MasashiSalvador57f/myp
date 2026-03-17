use chrono::Local;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use crate::utils;

// ─── Data structures ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoInfo {
    pub filename: String,
    pub title: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MemoDetail {
    pub filename: String,
    pub title: String,
    pub body: String,
    pub created_at: String,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/// メモ保存先ディレクトリを返す。
/// settings.toml の storage.memo_dir が設定されていればそれを、
/// なければ ~/.mypwriter/memos/ を返す。
fn memo_dir() -> Result<PathBuf, String> {
    // settings.toml から memo_dir を読み取る
    let app = utils::app_dir()?;
    let settings_path = app.join("settings.toml");
    if settings_path.exists() {
        if let Ok(raw) = std::fs::read_to_string(&settings_path) {
            if let Ok(settings) = toml::from_str::<toml::Value>(&raw) {
                if let Some(dir_str) = settings
                    .get("storage")
                    .and_then(|s| s.get("memo_dir"))
                    .and_then(|v| v.as_str())
                {
                    if !dir_str.is_empty() {
                        let custom = PathBuf::from(dir_str);
                        std::fs::create_dir_all(&custom)
                            .map_err(|e| format!("メモディレクトリの作成に失敗: {e}"))?;
                        return Ok(custom);
                    }
                }
            }
        }
    }
    // デフォルト: ~/.mypwriter/memos/
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .map_err(|_| "ホームディレクトリが見つかりません".to_string())?;
    let default = PathBuf::from(home).join(".mypwriter").join("memos");
    std::fs::create_dir_all(&default)
        .map_err(|e| format!("メモディレクトリの作成に失敗: {e}"))?;
    Ok(default)
}

/// ファイル名 ("2026-03-17-143025.md") から日時文字列 ("2026-03-17 14:30:25") を生成。
fn filename_to_datetime(filename: &str) -> String {
    let stem = filename.trim_end_matches(".md");
    if stem.len() >= 17 {
        // "2026-03-17-143025" → "2026-03-17 14:30:25"
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

/// メモファイルの1行目をタイトルとして取得。空なら "(無題)" を返す。
fn extract_title(content: &str) -> String {
    content
        .lines()
        .next()
        .map(|l| l.trim().to_string())
        .filter(|l| !l.is_empty())
        .unwrap_or_else(|| "(無題)".to_string())
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/// 現在のメモディレクトリパスを返す。
#[tauri::command]
pub fn get_memo_dir() -> Result<String, String> {
    let dir = memo_dir()?;
    Ok(dir.to_string_lossy().to_string())
}

/// メモ一覧を新しい順に返す。
#[tauri::command]
pub fn list_memos() -> Result<Vec<MemoInfo>, String> {
    let dir = memo_dir()?;
    let mut memos: Vec<MemoInfo> = Vec::new();

    if !dir.exists() {
        return Ok(memos);
    }

    let entries = std::fs::read_dir(&dir)
        .map_err(|e| format!("メモディレクトリの読み込みに失敗: {e}"))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("md") {
            let filename = entry.file_name().to_string_lossy().to_string();
            let content = std::fs::read_to_string(&path).unwrap_or_default();
            let title = extract_title(&content);
            let created_at = filename_to_datetime(&filename);
            memos.push(MemoInfo {
                filename,
                title,
                created_at,
            });
        }
    }

    // 新しい順（ファイル名降順）
    memos.sort_by(|a, b| b.filename.cmp(&a.filename));
    Ok(memos)
}

/// メモの詳細を読み込む。
#[tauri::command]
pub fn read_memo(filename: String) -> Result<MemoDetail, String> {
    let path = memo_dir()?.join(&filename);
    if !path.exists() {
        return Err(format!("メモが見つかりません: {filename}"));
    }
    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("メモの読み込みに失敗: {e}"))?;
    let title = extract_title(&content);
    // 本文は1行目以降
    let body = content
        .lines()
        .skip(1)
        .collect::<Vec<_>>()
        .join("\n")
        .trim_start_matches('\n')
        .to_string();
    let created_at = filename_to_datetime(&filename);
    Ok(MemoDetail {
        filename,
        title,
        body,
        created_at,
    })
}

/// 新規メモを作成する。
#[tauri::command]
pub fn create_memo(title: String, body: String) -> Result<MemoInfo, String> {
    let dir = memo_dir()?;
    let now = Local::now();
    let filename = format!("{}.md", now.format("%Y-%m-%d-%H%M%S"));
    let path = dir.join(&filename);

    let content = if body.trim().is_empty() {
        format!("{}\n", title)
    } else {
        format!("{}\n{}\n", title, body)
    };

    std::fs::write(&path, &content)
        .map_err(|e| format!("メモの保存に失敗: {e}"))?;

    let created_at = filename_to_datetime(&filename);
    Ok(MemoInfo {
        filename,
        title: if title.is_empty() {
            "(無題)".to_string()
        } else {
            title
        },
        created_at,
    })
}

/// メモを更新する。
#[tauri::command]
pub fn update_memo(filename: String, title: String, body: String) -> Result<MemoInfo, String> {
    let path = memo_dir()?.join(&filename);
    if !path.exists() {
        return Err(format!("メモが見つかりません: {filename}"));
    }

    let content = if body.trim().is_empty() {
        format!("{}\n", title)
    } else {
        format!("{}\n{}\n", title, body)
    };

    std::fs::write(&path, &content)
        .map_err(|e| format!("メモの保存に失敗: {e}"))?;

    let created_at = filename_to_datetime(&filename);
    Ok(MemoInfo {
        filename,
        title: if title.is_empty() {
            "(無題)".to_string()
        } else {
            title
        },
        created_at,
    })
}

/// メモをアーカイブする（archived/ ディレクトリに移動）。
#[tauri::command]
pub fn delete_memo(filename: String) -> Result<(), String> {
    let dir = memo_dir()?;
    let path = dir.join(&filename);
    if !path.exists() {
        return Err(format!("メモが見つかりません: {filename}"));
    }
    let archived_dir = dir.join("archived");
    std::fs::create_dir_all(&archived_dir)
        .map_err(|e| format!("archivedディレクトリの作成に失敗: {e}"))?;
    let dest = archived_dir.join(&filename);
    std::fs::rename(&path, &dest)
        .map_err(|e| format!("メモのアーカイブに失敗: {e}"))?;
    Ok(())
}
