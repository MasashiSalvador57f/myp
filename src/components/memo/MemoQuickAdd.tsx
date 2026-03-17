import { useState } from "react";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button } from "../ui";
import * as commands from "../../lib/tauri-commands";

interface MemoQuickAddProps {
  onCreated: () => void;
}

export function MemoQuickAdd({ onCreated }: MemoQuickAddProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() && !body.trim()) return;
    setSaving(true);
    try {
      await commands.createMemo(title.trim() || "(無題)", body);
      setTitle("");
      setBody("");
      onCreated();
    } catch (e) {
      console.error("メモ作成に失敗:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <TextField
        fullWidth
        variant="standard"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="メモのタイトル"
        slotProps={{
          input: {
            disableUnderline: true,
            sx: { fontWeight: 500, fontSize: '0.875rem', mb: 1 },
          },
        }}
      />
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="アイデアを書き留める..."
        multiline
        rows={3}
      />
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
        <Typography variant="caption" color="text.disabled">
          Cmd+Enter で送信
        </Typography>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={saving || (!title.trim() && !body.trim())}
        >
          {saving ? "保存中..." : "メモを追加"}
        </Button>
      </Box>
    </Paper>
  );
}
