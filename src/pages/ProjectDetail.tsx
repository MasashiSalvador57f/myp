// TODO: Implement by Project team member
// - 章・原稿ファイル一覧
// - 総文字数 / 目標文字数
// - 最近のAI相談履歴
// - 最近の資料
// - 原稿ファイルを開く / 新規作成
// - AI相談開始

import { useParams, Link } from "react-router-dom";

export default function ProjectDetail() {
  const { projectId } = useParams();

  return (
    <div className="min-h-screen p-8">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← ホーム
      </Link>
      <h1 className="text-2xl font-bold mb-6">
        プロジェクト: {projectId}
      </h1>
      <p className="text-gray-600">プロジェクト詳細画面（実装予定）</p>
    </div>
  );
}
