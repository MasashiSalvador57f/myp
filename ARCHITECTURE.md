# MyPWriter アーキテクチャ設計書

## 1. 概要

MyPWriter は日本語執筆支援デスクトップアプリケーション。Tauri v2 + React + TypeScript で構築する。

## 2. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| デスクトップシェル | Tauri v2 | 2.10.x |
| フロントエンド | React + TypeScript | React 19, TS 5.x |
| ビルドツール | Vite | 6.x |
| スタイリング | Tailwind CSS | v4 |
| 状態管理 | Zustand | 5.x |
| ルーティング | React Router | 7.x |
| バックエンド言語 | Rust | 2021 edition |
| シリアライゼーション | serde + toml + serde_json | — |
| 日時処理 | chrono | 0.4 |

## 3. ディレクトリ構成

```
mypwriter-2/
├── index.html                  # Vite エントリ HTML
├── package.json
├── tsconfig.json
├── vite.config.ts
├── ARCHITECTURE.md             # 本文書
├── CLAUDE.md                   # 開発規約
├── first_spec.md               # 要件定義書
│
├── src/                        # フロントエンド
│   ├── main.tsx                # React エントリポイント
│   ├── App.tsx                 # ルーティング定義
│   ├── styles.css              # グローバルスタイル (Tailwind)
│   ├── vite-env.d.ts
│   │
│   ├── types/                  # 共有型定義 (Rust ↔ TS)
│   │   ├── index.ts
│   │   ├── project.ts          # プロジェクト関連
│   │   ├── settings.ts         # 設定関連
│   │   ├── writing-log.ts      # 執筆ログ
│   │   ├── chat.ts             # AIチャット
│   │   └── commands.ts         # Tauri コマンドI/F
│   │
│   ├── pages/                  # 画面コンポーネント
│   │   ├── Home.tsx            # ホームダッシュボード
│   │   ├── ProjectDetail.tsx   # プロジェクト詳細
│   │   ├── Editor.tsx          # エディタ
│   │   └── Settings.tsx        # 設定
│   │
│   ├── components/             # 再利用UIコンポーネント
│   │   ├── dashboard/          # ダッシュボード系
│   │   ├── editor/             # エディタ系
│   │   ├── chat/               # AIチャット系
│   │   └── common/             # 共通UI
│   │
│   ├── stores/                 # Zustand ストア
│   │   ├── projectStore.ts     # プロジェクト状態
│   │   ├── editorStore.ts      # エディタ状態
│   │   ├── settingsStore.ts    # 設定状態
│   │   └── chatStore.ts        # チャット状態
│   │
│   ├── hooks/                  # カスタムフック
│   │   └── useTauriCommand.ts  # Tauri invoke ラッパー
│   │
│   └── lib/                    # ユーティリティ
│       └── tauri.ts            # invoke ヘルパー
│
└── src-tauri/                  # Rust バックエンド
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── capabilities/
    │   └── default.json
    ├── src/
    │   ├── main.rs             # エントリポイント
    │   ├── lib.rs              # Tauri Builder 設定
    │   └── commands/           # コマンド実装
    │       ├── mod.rs
    │       ├── project.rs      # プロジェクト CRUD
    │       ├── file.rs         # ファイル読み書き
    │       ├── settings.rs     # 設定読み書き
    │       ├── writing_log.rs  # 執筆ログ
    │       └── chat.rs         # AI チャットプロキシ
    └── icons/
```

## 4. データフローアーキテクチャ

```
┌─────────────────────────────────────────────────┐
│  React Frontend (WebView)                       │
│                                                 │
│  Pages ──▶ Zustand Store ──▶ Components         │
│    │              │                             │
│    └── invoke() ──┘                             │
│         │                                       │
└─────────┼───────────────────────────────────────┘
          │  Tauri IPC (JSON)
┌─────────┼───────────────────────────────────────┐
│  Rust Backend                                   │
│         │                                       │
│  #[tauri::command] handlers                     │
│         │                                       │
│    ┌────┼────┬──────────┬──────────┐            │
│    ▼    ▼    ▼          ▼          ▼            │
│  FS   TOML  ndjson   Markdown   HTTP            │
│  (.txt) (.toml) (logs)  (chat)  (AI API)        │
└─────────────────────────────────────────────────┘
```

### データフロー詳細

1. **ユーザー操作** → React コンポーネントがイベントハンドラで処理
2. **状態更新** → Zustand ストアを更新（楽観的更新）
3. **永続化** → `invoke()` で Tauri コマンドを呼び出し
4. **Rust 処理** → ファイルシステム操作、API呼び出し
5. **結果返却** → JSON シリアライズして React に返す

## 5. 状態管理戦略 (Zustand)

各ストアの責務:

| ストア | 責務 |
|--------|------|
| `projectStore` | プロジェクト一覧、現在のプロジェクト、原稿一覧 |
| `editorStore` | 現在開いているファイル、エディタ設定、変更フラグ |
| `settingsStore` | アプリ全体設定 (フォント、表示方向等) |
| `chatStore` | チャットセッション、メッセージ履歴、エージェント選択 |

## 6. ルーティング設計

| パス | 画面 | 説明 |
|------|------|------|
| `/` | Home | ホームダッシュボード |
| `/project/:projectId` | ProjectDetail | プロジェクト詳細 |
| `/project/:projectId/editor/:fileId?` | Editor | エディタ |
| `/settings` | Settings | アプリ設定 |

## 7. データレイヤー設計

### 7.1 ファイル構成

```
~/.mypwriter/                     # アプリデータルート
├── projects/
│   └── {project-id}/
│       ├── project.toml          # プロジェクト設定
│       ├── chapters/
│       │   ├── 01.txt
│       │   └── 02.txt
│       ├── materials/
│       │   ├── chat/
│       │   │   └── 2026-03-17-plot-review.md
│       │   └── notes/
│       │       └── memo.md
│       └── logs/
│           └── writing.ndjson
│
└── app/
    ├── settings.toml
    └── prompts/
        ├── presets/
        │   ├── plot-editor.md
        │   ├── style-reviewer.md
        │   ├── consistency-checker.md
        │   ├── character-sparring.md
        │   └── first-reader.md
        └── custom/
```

### 7.2 project.toml スキーマ

```toml
[project]
name = "私の小説"
created_at = "2026-03-17T00:00:00+09:00"
updated_at = "2026-03-17T12:00:00+09:00"

[goals]
target_char_count = 100000
```

### 7.3 settings.toml スキーマ

```toml
[editor]
default_direction = "vertical"   # "vertical" | "horizontal"
chars_per_line = 40
font_family = "Noto Serif JP"
font_size = 16

[ai]
api_key = ""
model = "claude-sonnet-4-6"
endpoint = "https://api.anthropic.com"
```

### 7.4 writing.ndjson フォーマット

```json
{"timestamp":"2026-03-17T10:30:00+09:00","project_id":"my-novel","file_path":"chapters/01.txt","char_delta":150,"session_chars":150}
{"timestamp":"2026-03-17T10:45:00+09:00","project_id":"my-novel","file_path":"chapters/01.txt","char_delta":80,"session_chars":230}
```

### 7.5 チャット履歴 Markdown フォーマット

```markdown
---
title: プロット相談
agent: plot-editor
project_id: my-novel
created_at: 2026-03-17T14:00:00+09:00
---

## ユーザー

主人公の動機が弱い気がします。どうすればよいでしょうか？

## アシスタント

主人公の動機を強化するには...
```

## 8. Tauri コマンド一覧

### プロジェクト管理
- `create_project(name)` → `project_id`
- `list_projects()` → `ProjectSummary[]`
- `get_project(project_id)` → `{ config, manuscripts, materials }`
- `update_project(project_id, ...)` → `void`
- `delete_project(project_id)` → `void`

### ファイル操作
- `read_file(project_id, relative_path)` → `{ content, char_count }`
- `write_file(project_id, relative_path, content)` → `void`
- `create_manuscript(project_id, filename)` → `void`
- `delete_manuscript(project_id, relative_path)` → `void`

### 設定
- `get_settings()` → `AppSettings`
- `update_settings(...)` → `void`

### 執筆ログ
- `append_writing_log(entry)` → `void`
- `get_daily_summaries(from, to)` → `DailyWritingSummary[]`

### AI チャット
- `send_chat(project_id, messages, system_prompt)` → `{ reply }`
- `save_chat(project_id, title, agent, messages)` → `file_path`

## 9. エディタ実装方針

MVP では CSS ベースの縦書き対応を採用:

- `writing-mode: vertical-rl` で縦書き表示
- `contenteditable` または `textarea` ベースの入力
- 一行文字数は CSS `max-height` (縦書き時) / `max-width` (横書き時) で制御
- IME 対応は標準のブラウザ挙動に依存

将来的にはカスタムレンダリングエンジンへの移行を検討する。

## 10. セキュリティ方針

- AI API キーは Tauri の Rust 側で管理し、フロントエンドには露出させない
- HTTP リクエストは Rust 側 (`tauri-plugin-http`) 経由で送信
- ファイルアクセスは Tauri の capability で制限
- CSP は Tauri デフォルトに準拠
