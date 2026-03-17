import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Button } from "../ui";
import { useSettingsStore } from "../../stores/settingsStore";
import * as commands from "../../lib/tauri-commands";

export function StorageSettings() {
  const { settings, updateStorageSettings } = useSettingsStore();
  const [currentPath, setCurrentPath] = useState<string>("");
  const [memoPath, setMemoPath] = useState<string>("");

  useEffect(() => {
    commands.getDataDirPath().then(setCurrentPath).catch(() => {});
    commands.getMemoDirPath().then(setMemoPath).catch(() => {});
  }, [settings.storage.data_dir, settings.storage.memo_dir]);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.04em' }}>
          データ保存先ディレクトリ
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              px: 1.5,
              py: 1.25,
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentPath || "読み込み中..."}
          </Paper>
          <Button variant="secondary" size="sm" onClick={handleSelectDir}>
            変更
          </Button>
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
          プロジェクト・原稿・チャット履歴・執筆ログの保存先です。
          {isCustom
            ? "カスタムディレクトリが設定されています。"
            : "デフォルトのディレクトリを使用中です。"}
        </Typography>
      </Box>

      {isCustom && (
        <Box>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            デフォルトに戻す
          </Button>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75 }}>
            デフォルト: ~/.mypwriter
          </Typography>
        </Box>
      )}

      {/* メモ保存先 */}
      <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.04em' }}>
          メモ保存先ディレクトリ
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              px: 1.5,
              py: 1.25,
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {memoPath || "読み込み中..."}
          </Paper>
          <Button variant="secondary" size="sm" onClick={async () => {
            const selected = await open({
              directory: true,
              multiple: false,
              title: "メモ保存先を選択",
            });
            if (typeof selected === "string") {
              await updateStorageSettings({ memo_dir: selected });
              setMemoPath(selected);
            }
          }}>
            変更
          </Button>
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
          アイデアメモの保存先です。
          {settings.storage.memo_dir
            ? "カスタムディレクトリが設定されています。"
            : "デフォルトのディレクトリ (~/.mypwriter/memos/) を使用中です。"}
        </Typography>
      </Box>

      {settings.storage.memo_dir && (
        <Box>
          <Button variant="secondary" size="sm" onClick={async () => {
            await updateStorageSettings({ memo_dir: null });
            const defaultPath = await commands.getMemoDirPath();
            setMemoPath(defaultPath);
          }}>
            メモ保存先をデフォルトに戻す
          </Button>
        </Box>
      )}

      <Paper
        variant="outlined"
        sx={{ p: 1.5, borderRadius: 'var(--radius-lg)' }}
      >
        <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.6 }}>
          保存先を変更しても、既存のデータは自動的には移動されません。
          必要に応じて手動でファイルをコピーしてください。
        </Typography>
      </Paper>
    </Box>
  );
}
