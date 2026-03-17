import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "../ui";
import { useSettingsStore } from "../../stores/settingsStore";
import * as commands from "../../lib/tauri-commands";

export function StorageSettings() {
  const { settings, updateStorageSettings } = useSettingsStore();
  const [currentPath, setCurrentPath] = useState<string>("");

  useEffect(() => {
    commands.getDataDirPath().then(setCurrentPath).catch(() => {});
  }, [settings.storage.data_dir]);

  const handleSelectDir = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "データ保存先を選択",
    });
    if (typeof selected === "string") {
      await updateStorageSettings({ data_dir: selected });
      setCurrentPath(selected);
    }
  };

  const handleReset = async () => {
    await updateStorageSettings({ data_dir: null });
    const defaultPath = await commands.getDataDirPath();
    setCurrentPath(defaultPath);
  };

  const isCustom = settings.storage.data_dir != null && settings.storage.data_dir !== "";

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-medium text-[var(--text-secondary)] tracking-wide block mb-2">
          データ保存先ディレクトリ
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-3 py-2.5 rounded-[var(--radius-lg)] bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] font-mono truncate">
            {currentPath || "読み込み中..."}
          </div>
          <Button variant="secondary" size="sm" onClick={handleSelectDir}>
            変更
          </Button>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          プロジェクト・原稿・チャット履歴・執筆ログの保存先です。
          {isCustom
            ? "カスタムディレクトリが設定されています。"
            : "デフォルトのディレクトリを使用中です。"}
        </p>
      </div>

      {isCustom && (
        <div>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            デフォルトに戻す
          </Button>
          <p className="text-xs text-[var(--text-tertiary)] mt-1.5">
            デフォルト: ~/.mypwriter
          </p>
        </div>
      )}

      <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
          保存先を変更しても、既存のデータは自動的には移動されません。
          必要に応じて手動でファイルをコピーしてください。
        </p>
      </div>
    </div>
  );
}
