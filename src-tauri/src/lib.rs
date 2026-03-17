mod commands;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            // データディレクトリの初期化（初回起動時にディレクトリ構造を作成）
            if let Err(e) = utils::init_data_dirs() {
                log::warn!("データディレクトリの初期化に失敗: {e}");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // ── プロジェクト管理 ──────────────────────────────
            commands::project::create_project,
            commands::project::list_projects,
            commands::project::get_project,
            commands::project::update_project,
            commands::project::delete_project,
            // ── 章ファイル操作 ────────────────────────────────
            commands::file::list_chapters,
            commands::file::read_chapter,
            commands::file::save_chapter,
            commands::file::create_chapter,
            commands::file::rename_chapter,
            commands::file::delete_chapter,
            // ── アプリ設定 ────────────────────────────────────
            commands::settings::get_settings,
            commands::settings::save_settings,
            commands::settings::get_data_dir_path,
            // ── 執筆ログ ──────────────────────────────────────
            commands::writing_log::append_writing_log,
            commands::writing_log::get_writing_logs,
            commands::writing_log::get_daily_stats,
            commands::writing_log::get_weekly_summary,
            // ── AI チャット ───────────────────────────────────
            commands::chat::send_chat_message,
            commands::chat::save_chat_history,
            commands::chat::list_chat_histories,
            commands::chat::read_chat_history,
            // ── プロンプト管理 ────────────────────────────────
            commands::prompts::list_preset_prompts,
            commands::prompts::list_custom_prompts,
            commands::prompts::get_prompt,
            commands::prompts::save_custom_prompt,
            commands::prompts::delete_custom_prompt,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
