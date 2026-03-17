use std::path::PathBuf;

/// デフォルトの設定ディレクトリ `~/.mypwriter/` を返す（設定ファイルの保存先として常に使用）。
fn default_base_dir() -> Result<PathBuf, String> {
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .map_err(|_| "ホームディレクトリが見つかりません".to_string())?;
    let dir = PathBuf::from(home).join(".mypwriter");
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("データディレクトリの作成に失敗: {e}"))?;
    Ok(dir)
}

/// settings.toml から data_dir を読み取る。未設定ならデフォルトを返す。
pub fn get_data_dir() -> Result<PathBuf, String> {
    let base = default_base_dir()?;
    let settings_path = base.join("app").join("settings.toml");
    if settings_path.exists() {
        if let Ok(raw) = std::fs::read_to_string(&settings_path) {
            if let Ok(settings) = toml::from_str::<toml::Value>(&raw) {
                if let Some(dir_str) = settings
                    .get("storage")
                    .and_then(|s| s.get("data_dir"))
                    .and_then(|v| v.as_str())
                {
                    if !dir_str.is_empty() {
                        let custom_dir = PathBuf::from(dir_str);
                        std::fs::create_dir_all(&custom_dir)
                            .map_err(|e| format!("カスタムデータディレクトリの作成に失敗: {e}"))?;
                        return Ok(custom_dir);
                    }
                }
            }
        }
    }
    Ok(base)
}

/// Returns `~/.mypwriter/projects/`, creating it if absent.
pub fn projects_dir() -> Result<PathBuf, String> {
    let dir = get_data_dir()?.join("projects");
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("プロジェクトディレクトリの作成に失敗: {e}"))?;
    Ok(dir)
}

/// Returns `~/.mypwriter/projects/{id}/`. Errors if the project does not exist.
pub fn project_dir(project_id: &str) -> Result<PathBuf, String> {
    let dir = projects_dir()?.join(project_id);
    if !dir.exists() {
        return Err(format!("プロジェクトが見つかりません: {project_id}"));
    }
    Ok(dir)
}

/// Returns `~/.mypwriter/app/`, creating it if absent.
/// 設定ファイルは常にデフォルトのベースディレクトリに保存する。
pub fn app_dir() -> Result<PathBuf, String> {
    let dir = default_base_dir()?.join("app");
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("アプリディレクトリの作成に失敗: {e}"))?;
    Ok(dir)
}

/// Initializes the full data directory skeleton on first launch.
pub fn init_data_dirs() -> Result<(), String> {
    let base = get_data_dir()?;
    for path in &[
        "projects",
        "app",
        "app/prompts/presets",
        "app/prompts/custom",
    ] {
        std::fs::create_dir_all(base.join(path))
            .map_err(|e| format!("ディレクトリの作成に失敗 ({path}): {e}"))?;
    }
    Ok(())
}
