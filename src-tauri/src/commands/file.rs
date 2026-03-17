use serde::{Deserialize, Serialize};

use crate::utils;

// ─── Data structures ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct ChapterInfo {
    pub filename: String,
    pub char_count: u64,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReadChapterResult {
    pub content: String,
    pub char_count: u64,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn chapters_dir(project_id: &str) -> Result<std::path::PathBuf, String> {
    let dir = utils::project_dir(project_id)?.join("chapters");
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("chapters ディレクトリの作成に失敗: {e}"))?;
    Ok(dir)
}

fn mtime_string(path: &std::path::PathBuf) -> String {
    path.metadata()
        .and_then(|m| m.modified())
        .ok()
        .and_then(|t| {
            let dt: chrono::DateTime<chrono::Local> = t.into();
            Some(dt.to_rfc3339())
        })
        .unwrap_or_default()
}

/// 次の章ファイル番号を `NN.txt` 形式で返す (e.g. "03.txt").
fn next_chapter_filename(chapters_dir: &std::path::PathBuf) -> String {
    let count = std::fs::read_dir(chapters_dir)
        .map(|entries| {
            entries
                .filter_map(|e| e.ok())
                .filter(|e| e.path().extension().map_or(false, |x| x == "txt"))
                .count()
        })
        .unwrap_or(0);
    format!("{:02}.txt", count + 1)
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/// プロジェクト内の章ファイル一覧をファイル名昇順で返す。
#[tauri::command]
pub fn list_chapters(project_id: String) -> Result<Vec<ChapterInfo>, String> {
    let dir = chapters_dir(&project_id)?;
    let Ok(entries) = std::fs::read_dir(&dir) else {
        return Ok(vec![]);
    };

    let mut chapters: Vec<ChapterInfo> = entries
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |x| x == "txt"))
        .map(|e| {
            let path = e.path();
            let filename = path.file_name().unwrap().to_string_lossy().to_string();
            let char_count = std::fs::read_to_string(&path)
                .map(|s| s.chars().count() as u64)
                .unwrap_or(0);
            let updated_at = mtime_string(&path);
            ChapterInfo { filename, char_count, updated_at }
        })
        .collect();

    chapters.sort_by(|a, b| a.filename.cmp(&b.filename));
    Ok(chapters)
}

/// 章ファイルの内容を読み込む。
#[tauri::command]
pub fn read_chapter(project_id: String, filename: String) -> Result<ReadChapterResult, String> {
    let path = chapters_dir(&project_id)?.join(&filename);
    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("ファイルの読み込みに失敗 ({filename}): {e}"))?;
    let char_count = content.chars().count() as u64;
    Ok(ReadChapterResult { content, char_count })
}

/// 章ファイルの内容を保存し、project.toml の updated_at を更新する。
#[tauri::command]
pub fn save_chapter(project_id: String, filename: String, content: String) -> Result<(), String> {
    let path = chapters_dir(&project_id)?.join(&filename);
    std::fs::write(&path, content.as_bytes())
        .map_err(|e| format!("ファイルの書き込みに失敗 ({filename}): {e}"))?;

    // Update project updated_at
    let project_dir = utils::project_dir(&project_id)?;
    let config_path = project_dir.join("project.toml");
    if let Ok(raw) = std::fs::read_to_string(&config_path) {
        if let Ok(mut config) = toml::from_str::<crate::commands::project::ProjectConfig>(&raw) {
            config.updated_at = chrono::Local::now().to_rfc3339();
            if let Ok(updated) = toml::to_string(&config) {
                let _ = std::fs::write(&config_path, updated);
            }
        }
    }
    Ok(())
}

/// 新しい章ファイルを作成する (空ファイル)。
#[tauri::command]
pub fn create_chapter(project_id: String, title: Option<String>) -> Result<ChapterInfo, String> {
    let dir = chapters_dir(&project_id)?;
    let filename = title
        .map(|t| {
            // Sanitize: keep alphanumeric, CJK, spaces, dots; replace rest with _
            let safe: String = t
                .chars()
                .map(|c| if c.is_alphanumeric() || c == '.' || c == ' ' { c } else { '_' })
                .collect();
            if safe.ends_with(".txt") {
                safe
            } else {
                format!("{safe}.txt")
            }
        })
        .unwrap_or_else(|| next_chapter_filename(&dir));

    let path = dir.join(&filename);
    if path.exists() {
        return Err(format!("ファイルが既に存在します: {filename}"));
    }
    std::fs::write(&path, b"")
        .map_err(|e| format!("ファイルの作成に失敗 ({filename}): {e}"))?;

    Ok(ChapterInfo {
        filename,
        char_count: 0,
        updated_at: chrono::Local::now().to_rfc3339(),
    })
}

/// 章ファイルをリネームする。
#[tauri::command]
pub fn rename_chapter(project_id: String, old_name: String, new_name: String) -> Result<(), String> {
    let dir = chapters_dir(&project_id)?;
    let old_path = dir.join(&old_name);
    let new_path = dir.join(&new_name);
    if !old_path.exists() {
        return Err(format!("ファイルが見つかりません: {old_name}"));
    }
    if new_path.exists() {
        return Err(format!("同名のファイルが既に存在します: {new_name}"));
    }
    std::fs::rename(&old_path, &new_path)
        .map_err(|e| format!("リネームに失敗: {e}"))
}

/// 章ファイルを削除する。
#[tauri::command]
pub fn delete_chapter(project_id: String, filename: String) -> Result<(), String> {
    let path = chapters_dir(&project_id)?.join(&filename);
    if !path.exists() {
        return Err(format!("ファイルが見つかりません: {filename}"));
    }
    std::fs::remove_file(&path)
        .map_err(|e| format!("ファイルの削除に失敗: {e}"))
}
