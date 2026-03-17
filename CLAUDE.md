# MyPWriter - 開発規約

## プロジェクト概要

日本語執筆支援デスクトップアプリ（Tauri v2 + React + TypeScript）

## ビルド・実行コマンド

```bash
# フロントエンド開発サーバー
npm run dev

# Tauri アプリ起動（フロントエンド + Rust バックエンド）
npx tauri dev

# TypeScript 型チェック
npx tsc --noEmit

# Rust 型チェック
cd src-tauri && cargo check

# プロダクションビルド
npx tauri build
```

## コーディング規約

### 全般
- 言語: TypeScript (フロントエンド), Rust (バックエンド)
- UIテキスト: 日本語で記述すること
- コメント: 日本語 or 英語（コード内は英語推奨、UIは日本語必須）
- フォーマッタ: Prettier (TS), rustfmt (Rust)

### フロントエンド
- React コンポーネント: 関数コンポーネント + hooks
- スタイリング: Tailwind CSS v4 のユーティリティクラス
- 状態管理: Zustand ストア (`src/stores/`)
- 型定義: `src/types/` に集約、Rust の構造体と対応させる
- Tauri 呼び出し: `@tauri-apps/api` の `invoke()` を使用

### バックエンド (Rust)
- コマンド: `src-tauri/src/commands/` 以下にモジュール分割
- シリアライゼーション: `serde` derive マクロを使用
- 設定ファイル: `toml` クレートで読み書き
- エラー: `Result<T, String>` で Tauri コマンドのエラーを返す

## ファイルオーナーシップ

### Lead Architect (T1)
- `ARCHITECTURE.md`, `CLAUDE.md`
- `src/types/**`
- `src/App.tsx`, `src/main.tsx`
- ルート設定ファイル (`package.json`, `tsconfig.json`, `vite.config.ts`)
- `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`

### ダッシュボード担当 (T2)
- `src/pages/Home.tsx`
- `src/components/dashboard/**`
- `src/stores/projectStore.ts`（ダッシュボード関連部分）

### エディタ担当 (T3)
- `src/pages/Editor.tsx`
- `src/components/editor/**`
- `src/stores/editorStore.ts`

### AIチャット担当 (T4)
- `src/components/chat/**`
- `src/stores/chatStore.ts`
- `src-tauri/src/commands/chat.rs`

### バックエンド担当 (T5)
- `src-tauri/src/commands/project.rs`
- `src-tauri/src/commands/file.rs`
- `src-tauri/src/commands/settings.rs`
- `src-tauri/src/commands/writing_log.rs`
- `src/pages/ProjectDetail.tsx`
- `src/pages/Settings.tsx`
- `src/stores/settingsStore.ts`

## ブランチ戦略

- `main`: 安定版
- `feature/*`: 機能開発ブランチ
- 各チームメンバーは自身のオーナーシップ範囲のファイルのみ変更する

## 重要な設計決定

- データディレクトリ: `~/.mypwriter/` 以下にプロジェクトとアプリ設定を格納
- 原稿: プレーンテキスト `.txt`
- 設定: TOML 形式
- 執筆ログ: ndjson 追記型
- チャット履歴: Markdown (YAML frontmatter 付き)
- 縦書き: CSS `writing-mode: vertical-rl` ベース (MVP)
