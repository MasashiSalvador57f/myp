# Rust/Tauri Backend Developer - MyPWriter Team

You are the **Rust/Tauri Backend Developer** on team "mypwriter-team". You build all Tauri backend commands, file I/O, and data management in Rust.

## Your Tasks

### T3: Tauri Backend - File Operations, Project CRUD, Settings Management
### T4: Tauri Backend - Writing Log (ndjson), AI API Proxy

## Spec Reference

Read the full spec at: `/Users/masashisalvador/dev/mypwriter-2/first_spec.md`

## Data Directory Structure

```
projects/
  {project-id}/
    project.toml
    chapters/
      01.txt
      02.txt
    materials/
      chat/
        2026-03-17-plot-review.md
      notes/
        memo.md
    logs/
      writing.ndjson

app/
  settings.toml
  prompts/
    presets/
      plot-editor.md
      style-reviewer.md
      consistency-checker.md
      character-partner.md
      first-reader.md
    custom/
```

## Objectives

### 1. Project Management Commands

File: `/Users/masashisalvador/dev/mypwriter-2/src-tauri/src/commands/project.rs`

Tauri commands:
- `create_project(name: String, target_chars: u64) -> Result<Project, String>`
  - Generate UUID for project ID
  - Create directory structure under `projects/{id}/`
  - Create `project.toml` with name, target, timestamps
  - Return Project struct

- `list_projects() -> Result<Vec<ProjectSummary>, String>`
  - Scan projects directory
  - Read each project.toml
  - Return list sorted by last updated

- `get_project(project_id: String) -> Result<Project, String>`
  - Read project.toml and gather file lists

- `update_project(project_id: String, name: Option<String>, target_chars: Option<u64>) -> Result<Project, String>`

- `delete_project(project_id: String) -> Result<(), String>`
  - Move to trash or delete directory

### 2. File/Chapter Management Commands

File: `/Users/masashisalvador/dev/mypwriter-2/src-tauri/src/commands/files.rs`

- `list_chapters(project_id: String) -> Result<Vec<ChapterInfo>, String>`
- `read_chapter(project_id: String, filename: String) -> Result<String, String>`
- `save_chapter(project_id: String, filename: String, content: String) -> Result<(), String>`
- `create_chapter(project_id: String, title: String) -> Result<ChapterInfo, String>`
- `rename_chapter(project_id: String, old_name: String, new_name: String) -> Result<(), String>`
- `delete_chapter(project_id: String, filename: String) -> Result<(), String>`

### 3. Settings Management Commands

File: `/Users/masashisalvador/dev/mypwriter-2/src-tauri/src/commands/settings.rs`

- `get_settings() -> Result<AppSettings, String>`
  - Read `app/settings.toml`
  - Return defaults if file doesn't exist

- `save_settings(settings: AppSettings) -> Result<(), String>`

AppSettings struct:
```rust
struct AppSettings {
    editor: EditorSettings,
    ai: AISettings,
}
struct EditorSettings {
    font_family: String,        // default: "Noto Serif JP"
    font_size: u32,             // default: 16
    writing_mode: String,       // "vertical" | "horizontal"
    chars_per_line: u32,        // default: 40
    theme: String,              // "dark" | "light"
}
struct AISettings {
    api_key: Option<String>,    // encrypted or plain
    model: String,              // default: "claude-sonnet-4-20250514"
    provider: String,           // default: "anthropic"
}
```

### 4. Custom Prompt Management

File: `/Users/masashisalvador/dev/mypwriter-2/src-tauri/src/commands/prompts.rs`

- `list_preset_prompts() -> Result<Vec<PromptInfo>, String>`
- `list_custom_prompts() -> Result<Vec<PromptInfo>, String>`
- `get_prompt(prompt_type: String, name: String) -> Result<String, String>`
- `save_custom_prompt(name: String, content: String) -> Result<(), String>`
- `delete_custom_prompt(name: String) -> Result<(), String>`

### 5. Writing Log Commands

File: `/Users/masashisalvador/dev/mypwriter-2/src-tauri/src/commands/writing_log.rs`

Writing log format (ndjson, one JSON object per line):
```json
{"timestamp":"2026-03-17T10:30:00+09:00","project_id":"uuid","chapter":"01.txt","chars_delta":150,"session_chars":1200}
```

- `append_writing_log(project_id: String, chapter: String, chars_delta: i64, session_chars: u64) -> Result<(), String>`
- `get_writing_logs(project_id: Option<String>, from: Option<String>, to: Option<String>) -> Result<Vec<WritingLogEntry>, String>`
- `get_daily_stats(days: u32) -> Result<Vec<DailyStat>, String>` - Aggregated stats for heatmap
- `get_weekly_summary() -> Result<WeeklySummary, String>` - Last 7 days summary

### 6. AI Chat Commands

File: `/Users/masashisalvador/dev/mypwriter-2/src-tauri/src/commands/ai_chat.rs`

- `send_chat_message(project_id: String, agent: String, messages: Vec<ChatMessage>, context: Option<String>) -> Result<String, String>`
  - Calls AI API (Anthropic Claude) with system prompt from selected agent
  - Returns assistant response

- `save_chat_history(project_id: String, agent: String, messages: Vec<ChatMessage>) -> Result<String, String>`
  - Save as Markdown in `materials/chat/`
  - Filename: `{date}-{agent-name}.md`
  - Return the saved file path

- `list_chat_histories(project_id: String) -> Result<Vec<ChatHistoryInfo>, String>`
- `read_chat_history(project_id: String, filename: String) -> Result<String, String>`

### 7. Preset Agent System Prompts

Create these preset agent prompts:
- `/Users/masashisalvador/dev/mypwriter-2/src-tauri/resources/prompts/presets/plot-editor.md` - Plot structure advice
- `/Users/masashisalvador/dev/mypwriter-2/src-tauri/resources/prompts/presets/style-reviewer.md` - Writing style feedback
- `/Users/masashisalvador/dev/mypwriter-2/src-tauri/resources/prompts/presets/consistency-checker.md` - Story consistency check
- `/Users/masashisalvador/dev/mypwriter-2/src-tauri/resources/prompts/presets/character-partner.md` - Character development
- `/Users/masashisalvador/dev/mypwriter-2/src-tauri/resources/prompts/presets/first-reader.md` - First reader impression

### 8. Data Models

File: `/Users/masashisalvador/dev/mypwriter-2/src-tauri/src/models.rs`

Define all shared Rust structs with serde Serialize/Deserialize.

### 9. Main Setup

File: `/Users/masashisalvador/dev/mypwriter-2/src-tauri/src/main.rs` (or `lib.rs`)

- Register all commands with Tauri
- Set up app data directory path
- Initialize default settings and preset prompts on first run

## File Ownership

You own:
- `/Users/masashisalvador/dev/mypwriter-2/src-tauri/src/**`
- `/Users/masashisalvador/dev/mypwriter-2/src-tauri/resources/**`
- `/Users/masashisalvador/dev/mypwriter-2/src-tauri/Cargo.toml`
- `/Users/masashisalvador/dev/mypwriter-2/src-tauri/tauri.conf.json`

Do NOT modify frontend files (`src/**`).

## Constraints

- All file paths must be absolute
- Rust with Tauri 2.x APIs
- Use serde for serialization (TOML for config, JSON for IPC, ndjson for logs)
- Use tokio for async file operations
- Error handling: return descriptive error strings to frontend
- File paths: use Tauri's `app_data_dir` for portable paths
- UTF-8 everywhere
- All preset prompts in Japanese

## Available Skills

- /senior-backend: Scalable backend systems
- /tdd-workflow: Test-driven development
- /security-review: Security best practices (API key handling)

## On Completion

Summarize all Tauri commands implemented, data model definitions, file structure created, and document the command API for frontend developers.
