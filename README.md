# MyPWriter

日本語執筆支援デスクトップアプリケーション。

Tauri v2 + React + TypeScript で構築されたネイティブアプリで、AIチャットによる執筆サポート、縦書き表示、執筆ログなどの機能を備えています。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| デスクトップシェル | Tauri v2 |
| フロントエンド | React 19 + TypeScript 5 |
| ビルドツール | Vite 6 |
| スタイリング | Tailwind CSS v4 |
| 状態管理 | Zustand 5 |
| バックエンド | Rust (2021 edition) |

## 必要な環境

- **Node.js** v18 以上
- **Rust** (stable)
- **Tauri v2 の前提条件** — [公式ガイド](https://v2.tauri.app/start/prerequisites/) を参照

## セットアップ

```bash
# 依存パッケージのインストール
npm install
```

## 起動方法

```bash
# Tauri アプリとして起動（フロントエンド + Rust バックエンド）
npx tauri dev
```

フロントエンドの開発サーバーのみ起動する場合:

```bash
npm run dev
```

## ビルド

```bash
# プロダクションビルド（インストーラー生成）
npx tauri build
```

## 型チェック

```bash
# TypeScript
npx tsc --noEmit

# Rust
cd src-tauri && cargo check
```

## データ保存先

アプリのデータは `~/.mypwriter/` 以下に格納されます。

| 種類 | 形式 |
|------|------|
| 原稿 | プレーンテキスト (`.txt`) |
| 設定 | TOML |
| 執筆ログ | NDJSON (追記型) |
| チャット履歴 | Markdown (YAML frontmatter 付き) |

## ライセンス

Private
