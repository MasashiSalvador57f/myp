// TODO: Implement by Dashboard team member
// - 日次執筆ヒートマップ (GitHub Contribution Chart風)
// - 平均執筆文字数
// - 直近7日間の執筆文字数
// - プロジェクト一覧
// - プロジェクト新規作成ボタン

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">MyPWriter</h1>
      <p className="text-gray-600 mb-4">ホームダッシュボード（実装予定）</p>
      <div className="flex gap-4">
        <Link
          to="/settings"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          設定
        </Link>
      </div>
    </div>
  );
}
