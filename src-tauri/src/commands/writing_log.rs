use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::Write as IoWrite;

use crate::utils;

// ─── Data structures ──────────────────────────────────────────────────────────

/// 1行分の執筆ログエントリ (ndjson)。
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WritingLogEntry {
    pub timestamp: String,
    pub project_id: String,
    pub chapter: String,
    pub chars_delta: i64,
    pub session_chars: u64,
}

/// ヒートマップ用の日次集計。
#[derive(Debug, Serialize, Deserialize)]
pub struct DailyStat {
    pub date: String,   // "YYYY-MM-DD"
    pub total_chars: u64,
}

/// 直近7日間のサマリー。
#[derive(Debug, Serialize, Deserialize)]
pub struct WeeklySummary {
    pub days: Vec<DailyStat>,
    pub total_chars: u64,
    pub average_chars: u64,
    pub active_days: u32,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/// プロジェクトの執筆ログファイルパスを返す。
fn log_path(project_id: &str) -> Result<std::path::PathBuf, String> {
    let dir = utils::project_dir(project_id)?.join("logs");
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("logs ディレクトリ作成失敗: {e}"))?;
    Ok(dir.join("writing.ndjson"))
}

/// 全プロジェクトの全ログエントリを読み込む。
fn read_all_logs() -> Result<Vec<WritingLogEntry>, String> {
    let projects_dir = utils::projects_dir()?;
    let Ok(entries) = std::fs::read_dir(&projects_dir) else {
        return Ok(vec![]);
    };

    let mut all = Vec::new();
    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path().join("logs").join("writing.ndjson");
        if !path.exists() {
            continue;
        }
        let raw = std::fs::read_to_string(&path)
            .map_err(|e| format!("ログの読み込みに失敗: {e}"))?;
        for line in raw.lines() {
            let line = line.trim();
            if line.is_empty() {
                continue;
            }
            if let Ok(entry) = serde_json::from_str::<WritingLogEntry>(line) {
                all.push(entry);
            }
        }
    }
    Ok(all)
}

fn date_of(timestamp: &str) -> &str {
    // ISO 8601: take the first 10 chars "YYYY-MM-DD"
    if timestamp.len() >= 10 { &timestamp[..10] } else { timestamp }
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/// 執筆ログを対象プロジェクトの `logs/writing.ndjson` に追記する。
#[tauri::command]
pub fn append_writing_log(
    project_id: String,
    chapter: String,
    chars_delta: i64,
    session_chars: u64,
) -> Result<(), String> {
    let timestamp = chrono::Local::now().to_rfc3339();
    let entry = WritingLogEntry {
        timestamp,
        project_id: project_id.clone(),
        chapter,
        chars_delta,
        session_chars,
    };
    let line = serde_json::to_string(&entry)
        .map_err(|e| format!("ログのシリアライズに失敗: {e}"))?;

    let path = log_path(&project_id)?;
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| format!("ログファイルのオープンに失敗: {e}"))?;
    writeln!(file, "{line}").map_err(|e| format!("ログの書き込みに失敗: {e}"))
}

/// ログエントリを取得する。project_id / 期間でフィルタリング可能。
#[tauri::command]
pub fn get_writing_logs(
    project_id: Option<String>,
    from: Option<String>,
    to: Option<String>,
) -> Result<Vec<WritingLogEntry>, String> {
    let all = read_all_logs()?;
    let filtered = all
        .into_iter()
        .filter(|e| {
            if let Some(ref pid) = project_id {
                if &e.project_id != pid {
                    return false;
                }
            }
            let d = date_of(&e.timestamp);
            if let Some(ref f) = from {
                if d < f.as_str() {
                    return false;
                }
            }
            if let Some(ref t) = to {
                if d > t.as_str() {
                    return false;
                }
            }
            true
        })
        .collect();
    Ok(filtered)
}

/// 直近 `days` 日分の日次集計を返す（ヒートマップ用）。
#[tauri::command]
pub fn get_daily_stats(days: u32) -> Result<Vec<DailyStat>, String> {
    let all = read_all_logs()?;

    // Build map date -> total positive chars
    let mut map: HashMap<String, u64> = HashMap::new();
    for entry in &all {
        if entry.chars_delta > 0 {
            *map.entry(date_of(&entry.timestamp).to_string()).or_insert(0) +=
                entry.chars_delta as u64;
        }
    }

    // Generate last `days` dates
    let today = chrono::Local::now().date_naive();
    let stats: Vec<DailyStat> = (0..days)
        .rev()
        .map(|i| {
            let d = today - chrono::Duration::days(i as i64);
            let date = d.format("%Y-%m-%d").to_string();
            let total_chars = *map.get(&date).unwrap_or(&0);
            DailyStat { date, total_chars }
        })
        .collect();

    Ok(stats)
}

/// 直近7日間のサマリーを返す。
#[tauri::command]
pub fn get_weekly_summary() -> Result<WeeklySummary, String> {
    let days = get_daily_stats(7)?;
    let total_chars: u64 = days.iter().map(|d| d.total_chars).sum();
    let active_days = days.iter().filter(|d| d.total_chars > 0).count() as u32;
    let average_chars = if active_days > 0 { total_chars / active_days as u64 } else { 0 };

    Ok(WeeklySummary {
        days,
        total_chars,
        average_chars,
        active_days,
    })
}
