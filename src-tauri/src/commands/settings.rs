use serde::{Deserialize, Serialize};

use crate::utils;

// ─── Data structures ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EditorSettings {
    pub font_family: String,
    pub font_size: u32,
    pub writing_mode: String,  // "vertical" | "horizontal"
    pub chars_per_line: u32,
    pub theme: String,         // "dark" | "light"
    #[serde(default = "default_color_preset")]
    pub color_preset: String,  // "default" | "ocean" | "forest" | "sakura" | "twilight" | "minimal"
}

fn default_color_preset() -> String {
    "default".into()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AiSettings {
    pub api_key: Option<String>,
    #[serde(default)]
    pub gemini_api_key: Option<String>,
    pub model: String,
    pub provider: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StorageSettings {
    /// プロジェクトデータの保存先ディレクトリ (None = デフォルト ~/.mypwriter)
    pub data_dir: Option<String>,
    /// メモの保存先ディレクトリ (None = デフォルト ~/.mypwriter/memos/)
    pub memo_dir: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub editor: EditorSettings,
    pub ai: AiSettings,
    #[serde(default)]
    pub storage: StorageSettings,
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

impl Default for EditorSettings {
    fn default() -> Self {
        Self {
            font_family: "Noto Serif JP".into(),
            font_size: 16,
            writing_mode: "vertical".into(),
            chars_per_line: 40,
            theme: "dark".into(),
            color_preset: "default".into(),
        }
    }
}

impl Default for AiSettings {
    fn default() -> Self {
        Self {
            api_key: None,
            gemini_api_key: None,
            model: "gpt-5".into(),
            provider: "openai".into(),
        }
    }
}

impl Default for StorageSettings {
    fn default() -> Self {
        Self {
            data_dir: None,
            memo_dir: None,
        }
    }
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            editor: EditorSettings::default(),
            ai: AiSettings::default(),
            storage: StorageSettings::default(),
        }
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn settings_path() -> Result<std::path::PathBuf, String> {
    Ok(utils::app_dir()?.join("settings.toml"))
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/// `app/settings.toml` を読み込む。ファイルがなければデフォルト値を返す。
#[tauri::command]
pub fn get_settings() -> Result<AppSettings, String> {
    let path = settings_path()?;
    if !path.exists() {
        return Ok(AppSettings::default());
    }
    let raw = std::fs::read_to_string(&path)
        .map_err(|e| format!("設定ファイルの読み込みに失敗: {e}"))?;
    toml::from_str(&raw).map_err(|e| format!("設定ファイルのパースに失敗: {e}"))
}

/// 現在のデータ保存先ディレクトリのパスを返す。
#[tauri::command]
pub fn get_data_dir_path() -> Result<String, String> {
    let dir = utils::get_data_dir()?;
    Ok(dir.to_string_lossy().to_string())
}

/// `app/settings.toml` に設定を保存する。
#[tauri::command]
pub fn save_settings(settings: AppSettings) -> Result<(), String> {
    let path = settings_path()?;
    let raw = toml::to_string(&settings)
        .map_err(|e| format!("設定のシリアライズに失敗: {e}"))?;
    std::fs::write(&path, raw)
        .map_err(|e| format!("設定ファイルの書き込みに失敗: {e}"))
}
