use serde::{Deserialize, Serialize};
use std::path::PathBuf;

use crate::utils;

// ─── Data structures ──────────────────────────────────────────────────────────

/// Contents of `project.toml`.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectConfig {
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
    pub target_char_count: Option<u64>,
}

/// Lightweight entry for the project list on the dashboard.
#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectSummary {
    pub id: String,
    pub name: String,
    pub total_char_count: u64,
    pub target_char_count: Option<u64>,
    pub updated_at: String,
}

/// A single chapter file's metadata.
#[derive(Debug, Serialize, Deserialize)]
pub struct ManuscriptFile {
    pub filename: String,
    pub char_count: u64,
    pub updated_at: String,
}

/// A material file (chat history, note, …).
#[derive(Debug, Serialize, Deserialize)]
pub struct MaterialFile {
    pub filename: String,
    pub kind: String, // "chat" | "note"
    pub updated_at: String,
}

/// Full project detail returned by `get_project`.
#[derive(Debug, Serialize, Deserialize)]
pub struct GetProjectResult {
    pub id: String,
    pub config: ProjectConfig,
    pub manuscripts: Vec<ManuscriptFile>,
    pub materials: Vec<MaterialFile>,
    pub total_char_count: u64,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn now_rfc3339() -> String {
    chrono::Local::now().to_rfc3339()
}

fn read_project_config(project_dir: &PathBuf) -> Result<ProjectConfig, String> {
    let path = project_dir.join("project.toml");
    let raw = std::fs::read_to_string(&path)
        .map_err(|e| format!("project.toml の読み込みに失敗: {e}"))?;
    toml::from_str(&raw).map_err(|e| format!("project.toml のパースに失敗: {e}"))
}

fn write_project_config(project_dir: &PathBuf, config: &ProjectConfig) -> Result<(), String> {
    let raw = toml::to_string(config).map_err(|e| format!("project.toml のシリアライズに失敗: {e}"))?;
    std::fs::write(project_dir.join("project.toml"), raw)
        .map_err(|e| format!("project.toml の書き込みに失敗: {e}"))
}

fn count_chars_in_dir(dir: &PathBuf) -> u64 {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return 0;
    };
    entries
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |x| x == "txt"))
        .map(|e| {
            std::fs::read_to_string(e.path())
                .map(|s| s.chars().count() as u64)
                .unwrap_or(0)
        })
        .sum()
}

fn mtime_string(path: &PathBuf) -> String {
    path.metadata()
        .and_then(|m| m.modified())
        .ok()
        .and_then(|t| {
            let dt: chrono::DateTime<chrono::Local> = t.into();
            Some(dt.to_rfc3339())
        })
        .unwrap_or_default()
}

fn collect_manuscripts(project_dir: &PathBuf) -> Vec<ManuscriptFile> {
    let chapters_dir = project_dir.join("chapters");
    let Ok(entries) = std::fs::read_dir(&chapters_dir) else {
        return vec![];
    };
    let mut files: Vec<ManuscriptFile> = entries
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |x| x == "txt"))
        .map(|e| {
            let path = e.path();
            let filename = path.file_name().unwrap().to_string_lossy().to_string();
            let char_count = std::fs::read_to_string(&path)
                .map(|s| s.chars().count() as u64)
                .unwrap_or(0);
            let updated_at = mtime_string(&path);
            ManuscriptFile { filename, char_count, updated_at }
        })
        .collect();
    files.sort_by(|a, b| a.filename.cmp(&b.filename));
    files
}

fn collect_materials(project_dir: &PathBuf) -> Vec<MaterialFile> {
    let mut result = Vec::new();
    for kind in &["chat", "notes"] {
        let dir = project_dir.join("materials").join(kind);
        let Ok(entries) = std::fs::read_dir(&dir) else { continue };
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                let filename = path.file_name().unwrap().to_string_lossy().to_string();
                let updated_at = mtime_string(&path);
                result.push(MaterialFile {
                    filename,
                    kind: kind.to_string(),
                    updated_at,
                });
            }
        }
    }
    result.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    result
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/// プロジェクトを新規作成し、ディレクトリ構造を初期化する。
#[tauri::command]
pub fn create_project(name: String, target_char_count: Option<u64>) -> Result<ProjectSummary, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = now_rfc3339();
    let project_dir = utils::projects_dir()?.join(&id);

    // Create directory structure
    for sub in &[
        "chapters",
        "materials/chat",
        "materials/notes",
        "logs",
    ] {
        std::fs::create_dir_all(project_dir.join(sub))
            .map_err(|e| format!("ディレクトリ作成失敗 ({sub}): {e}"))?;
    }

    let config = ProjectConfig {
        name: name.clone(),
        created_at: now.clone(),
        updated_at: now.clone(),
        target_char_count,
    };
    write_project_config(&project_dir, &config)?;

    Ok(ProjectSummary {
        id,
        name,
        total_char_count: 0,
        target_char_count,
        updated_at: now,
    })
}

/// projects/ ディレクトリ内の全プロジェクトを更新日時降順で返す。
#[tauri::command]
pub fn list_projects() -> Result<Vec<ProjectSummary>, String> {
    let projects_dir = utils::projects_dir()?;
    let entries = std::fs::read_dir(&projects_dir)
        .map_err(|e| format!("プロジェクト一覧の読み込みに失敗: {e}"))?;

    let mut summaries: Vec<ProjectSummary> = entries
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir())
        .filter_map(|e| {
            let dir = e.path();
            let id = dir.file_name()?.to_string_lossy().to_string();
            let config = read_project_config(&dir).ok()?;
            let total_char_count = count_chars_in_dir(&dir.join("chapters"));
            Some(ProjectSummary {
                id,
                name: config.name,
                total_char_count,
                target_char_count: config.target_char_count,
                updated_at: config.updated_at,
            })
        })
        .collect();

    summaries.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(summaries)
}

/// 指定プロジェクトの詳細情報（設定・原稿一覧・資料一覧）を返す。
#[tauri::command]
pub fn get_project(project_id: String) -> Result<GetProjectResult, String> {
    let dir = utils::project_dir(&project_id)?;
    let config = read_project_config(&dir)?;
    let manuscripts = collect_manuscripts(&dir);
    let materials = collect_materials(&dir);
    let total_char_count = manuscripts.iter().map(|m| m.char_count).sum();

    Ok(GetProjectResult {
        id: project_id,
        config,
        manuscripts,
        materials,
        total_char_count,
    })
}

/// プロジェクトの名前・目標文字数を更新する。
#[tauri::command]
pub fn update_project(
    project_id: String,
    name: Option<String>,
    target_char_count: Option<u64>,
) -> Result<ProjectConfig, String> {
    let dir = utils::project_dir(&project_id)?;
    let mut config = read_project_config(&dir)?;

    if let Some(n) = name {
        config.name = n;
    }
    if let Some(t) = target_char_count {
        config.target_char_count = Some(t);
    }
    config.updated_at = now_rfc3339();

    write_project_config(&dir, &config)?;
    Ok(config)
}

/// プロジェクトディレクトリを削除する。
#[tauri::command]
pub fn delete_project(project_id: String) -> Result<(), String> {
    let dir = utils::project_dir(&project_id)?;
    std::fs::remove_dir_all(&dir)
        .map_err(|e| format!("プロジェクトの削除に失敗: {e}"))
}
