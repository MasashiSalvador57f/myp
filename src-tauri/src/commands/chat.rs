use serde::{Deserialize, Serialize};

use crate::utils;

// ─── Data structures ──────────────────────────────────────────────────────────

/// フロントエンドとのやり取りに使うメッセージ型（timestamp 付き）。
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,    // "user" | "assistant"
    pub content: String,
    pub timestamp: String,
}

/// チャット履歴ファイルのメタ情報。
#[derive(Debug, Serialize, Deserialize)]
pub struct ChatHistoryInfo {
    pub filename: String,
    pub agent: String,
    pub date: String,
    pub updated_at: String,
}

// ─── Anthropic API internal types ────────────────────────────────────────────

#[derive(Serialize)]
struct ApiMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct AnthropicRequest {
    model: String,
    max_tokens: u32,
    system: String,
    messages: Vec<ApiMessage>,
}

#[derive(Deserialize)]
struct ContentBlock {
    #[serde(rename = "type")]
    kind: String,
    text: Option<String>,
}

#[derive(Deserialize)]
struct AnthropicResponse {
    content: Vec<ContentBlock>,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn chat_dir(project_id: &str) -> Result<std::path::PathBuf, String> {
    let dir = utils::project_dir(project_id)?.join("materials").join("chat");
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("chat ディレクトリの作成に失敗: {e}"))?;
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

// ─── Commands ─────────────────────────────────────────────────────────────────

/// Anthropic Claude API にメッセージを送信し、アシスタントの返答を返す。
/// 設定ファイルから API キーとモデルを読み込む。
#[tauri::command]
pub async fn send_chat_message(
    project_id: String,
    agent: String,
    messages: Vec<ChatMessage>,
    context: Option<String>,
) -> Result<String, String> {
    let _ = project_id; // used for future context injection

    // Load settings to get API key and model
    let settings = crate::commands::settings::get_settings()?;
    let api_key = settings
        .ai
        .api_key
        .as_deref()
        .filter(|k| !k.is_empty())
        .ok_or_else(|| "APIキーが設定されていません。設定画面から入力してください。".to_string())?
        .to_string();

    // Build system prompt from the selected agent
    let system_prompt = crate::commands::prompts::resolve_system_prompt(&agent)?;

    // Optionally prepend context (e.g. selected manuscript text)
    let system_with_context = if let Some(ctx) = context {
        format!("{system_prompt}\n\n---\n以下は参照中の原稿テキストです:\n{ctx}")
    } else {
        system_prompt
    };

    // Convert to Anthropic message format (strip timestamp, skip system messages)
    let api_messages: Vec<ApiMessage> = messages
        .iter()
        .filter(|m| m.role == "user" || m.role == "assistant")
        .map(|m| ApiMessage {
            role: m.role.clone(),
            content: m.content.clone(),
        })
        .collect();

    if api_messages.is_empty() {
        return Err("メッセージが空です".to_string());
    }

    let request_body = AnthropicRequest {
        model: settings.ai.model.clone(),
        max_tokens: 4096,
        system: system_with_context,
        messages: api_messages,
    };

    let client = reqwest::Client::new();
    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", &api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("API リクエストに失敗: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("API エラー ({status}): {body}"));
    }

    let parsed: AnthropicResponse = response
        .json()
        .await
        .map_err(|e| format!("API レスポンスのパースに失敗: {e}"))?;

    parsed
        .content
        .into_iter()
        .find(|b| b.kind == "text")
        .and_then(|b| b.text)
        .ok_or_else(|| "API レスポンスにテキストが含まれていません".to_string())
}

/// チャット履歴を Markdown (YAML frontmatter 付き) でプロジェクトの
/// `materials/chat/` に保存し、ファイル名を返す。
#[tauri::command]
pub fn save_chat_history(
    project_id: String,
    agent: String,
    messages: Vec<ChatMessage>,
) -> Result<String, String> {
    let dir = chat_dir(&project_id)?;
    let date = chrono::Local::now().format("%Y-%m-%d").to_string();
    let filename = format!("{date}-{agent}.md");
    let path = dir.join(&filename);

    // Build Markdown content
    let mut md = format!(
        "---\ndate: \"{date}\"\nagent: \"{agent}\"\nproject_id: \"{project_id}\"\n---\n\n"
    );

    for msg in &messages {
        let role_label = if msg.role == "user" { "**ユーザー**" } else { "**アシスタント**" };
        md.push_str(&format!("{role_label} ({}):\n\n{}\n\n---\n\n", msg.timestamp, msg.content));
    }

    std::fs::write(&path, md.as_bytes())
        .map_err(|e| format!("チャット履歴の保存に失敗: {e}"))?;

    Ok(filename)
}

/// プロジェクトのチャット履歴ファイル一覧を更新日時降順で返す。
#[tauri::command]
pub fn list_chat_histories(project_id: String) -> Result<Vec<ChatHistoryInfo>, String> {
    let dir = chat_dir(&project_id)?;
    let Ok(entries) = std::fs::read_dir(&dir) else {
        return Ok(vec![]);
    };

    let mut histories: Vec<ChatHistoryInfo> = entries
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |x| x == "md"))
        .map(|e| {
            let path = e.path();
            let filename = path.file_name().unwrap().to_string_lossy().to_string();
            let updated_at = mtime_string(&path);
            // Parse "YYYY-MM-DD-agent-name.md"
            let stem = path.file_stem().unwrap_or_default().to_string_lossy().to_string();
            let mut parts = stem.splitn(4, '-');
            let year = parts.next().unwrap_or("");
            let month = parts.next().unwrap_or("");
            let day = parts.next().unwrap_or("");
            let agent = parts.next().unwrap_or(&stem).to_string();
            let date = format!("{year}-{month}-{day}");
            ChatHistoryInfo { filename, agent, date, updated_at }
        })
        .collect();

    histories.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    Ok(histories)
}

/// チャット履歴の Markdown テキストを返す。
#[tauri::command]
pub fn read_chat_history(project_id: String, filename: String) -> Result<String, String> {
    let path = chat_dir(&project_id)?.join(&filename);
    std::fs::read_to_string(&path)
        .map_err(|e| format!("チャット履歴の読み込みに失敗 ({filename}): {e}"))
}
