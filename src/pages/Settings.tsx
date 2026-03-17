// TODO: Implement by Settings team member
// - 本文フォント設定
// - レイアウト初期値 (縦書き/横書き、一行文字数)
// - AI関連設定 (APIキー、モデル選択)
// - プロンプト管理 (プリセット/カスタム)

import { Link } from "react-router-dom";

export default function Settings() {
  return (
    <div className="min-h-screen p-8">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← ホーム
      </Link>
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      <p className="text-gray-600">設定画面（実装予定）</p>
    </div>
  );
}
