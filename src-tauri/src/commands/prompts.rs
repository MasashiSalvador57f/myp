use serde::{Deserialize, Serialize};

use crate::utils;

// ─── Preset prompt content (embedded at compile time) ────────────────────────

const PRESET_PLOT_EDITOR: &str =
    include_str!("../../resources/prompts/presets/plot-editor.md");
const PRESET_STYLE_REVIEWER: &str =
    include_str!("../../resources/prompts/presets/style-reviewer.md");
const PRESET_CONSISTENCY_CHECKER: &str =
    include_str!("../../resources/prompts/presets/consistency-checker.md");
const PRESET_CHARACTER_PARTNER: &str =
    include_str!("../../resources/prompts/presets/character-partner.md");
const PRESET_FIRST_READER: &str =
    include_str!("../../resources/prompts/presets/first-reader.md");

/// (id, display_name) のペア
const PRESETS: &[(&str, &str, &str)] = &[
    ("plot-editor",          "プロット編集者",         PRESET_PLOT_EDITOR),
    ("style-reviewer",       "文体レビュワー",         PRESET_STYLE_REVIEWER),
    ("consistency-checker",  "整合性チェッカー",       PRESET_CONSISTENCY_CHECKER),
    ("character-partner",    "キャラクター壁打ち役",   PRESET_CHARACTER_PARTNER),
    ("first-reader",         "初見読者レビュー",       PRESET_FIRST_READER),
];

// ─── Data structures ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct PromptInfo {
    pub id: String,
    pub name: String,
    pub kind: String, // "preset" | "custom"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn custom_prompts_dir() -> Result<std::path::PathBuf, String> {
    let dir = utils::app_dir()?.join("prompts").join("custom");
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("カスタムプロンプトディレクトリの作成に失敗: {e}"))?;
    Ok(dir)
}

/// エージェント名から対応するシステムプロンプトを返す公開ヘルパー。
/// chat.rs から呼ばれる。
pub fn resolve_system_prompt(agent: &str) -> Result<String, String> {
    // Check presets first
    if let Some(&(_, _, content)) = PRESETS.iter().find(|&&(id, _, _)| id == agent) {
        return Ok(content.to_string());
    }
    // Fall back to custom prompt file
    let path = custom_prompts_dir()?.join(format!("{agent}.md"));
    if path.exists() {
        return std::fs::read_to_string(&path)
            .map_err(|e| format!("カスタムプロンプトの読み込みに失敗: {e}"));
    }
    Err(format!("エージェント '{agent}' が見つかりません"))
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/// プリセットエージェント一覧を返す。
#[tauri::command]
pub fn list_preset_prompts() -> Result<Vec<PromptInfo>, String> {
    Ok(PRESETS
        .iter()
        .map(|&(id, name, _)| PromptInfo {
            id: id.to_string(),
            name: name.to_string(),
            kind: "preset".to_string(),
        })
        .collect())
}

/// カスタムプロンプト一覧を返す（`app/prompts/custom/*.md`）。
#[tauri::command]
pub fn list_custom_prompts() -> Result<Vec<PromptInfo>, String> {
    let dir = custom_prompts_dir()?;
    let Ok(entries) = std::fs::read_dir(&dir) else {
        return Ok(vec![]);
    };
    let mut list: Vec<PromptInfo> = entries
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |x| x == "md"))
        .map(|e| {
            let path = e.path();
            let id = path.file_stem().unwrap().to_string_lossy().to_string();
            PromptInfo {
                name: id.clone(),
                id,
                kind: "custom".to_string(),
            }
        })
        .collect();
    list.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(list)
}

/// プリセットまたはカスタムプロンプトの内容を返す。
#[tauri::command]
pub fn get_prompt(kind: String, id: String) -> Result<String, String> {
    if kind == "preset" {
        PRESETS
            .iter()
            .find(|&&(pid, _, _)| pid == id.as_str())
            .map(|&(_, _, content)| content.to_string())
            .ok_or_else(|| format!("プリセット '{id}' が見つかりません"))
    } else {
        let path = custom_prompts_dir()?.join(format!("{id}.md"));
        std::fs::read_to_string(&path)
            .map_err(|e| format!("カスタムプロンプトの読み込みに失敗: {e}"))
    }
}

/// カスタムプロンプトを保存する。
#[tauri::command]
pub fn save_custom_prompt(id: String, content: String) -> Result<(), String> {
    // Prevent overwriting presets
    if PRESETS.iter().any(|&(pid, _, _)| pid == id.as_str()) {
        return Err(format!("'{id}' はプリセット名のため使用できません"));
    }
    let path = custom_prompts_dir()?.join(format!("{id}.md"));
    std::fs::write(&path, content.as_bytes())
        .map_err(|e| format!("カスタムプロンプトの保存に失敗: {e}"))
}

/// カスタムプロンプトを削除する。
#[tauri::command]
pub fn delete_custom_prompt(id: String) -> Result<(), String> {
    let path = custom_prompts_dir()?.join(format!("{id}.md"));
    if !path.exists() {
        return Err(format!("カスタムプロンプトが見つかりません: {id}"));
    }
    std::fs::remove_file(&path)
        .map_err(|e| format!("カスタムプロンプトの削除に失敗: {e}"))
}
