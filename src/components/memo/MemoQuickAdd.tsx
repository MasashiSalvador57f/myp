import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { Button } from "../ui";
import { useProjectStore } from "../../stores/projectStore";
import * as commands from "../../lib/tauri-commands";

interface MemoQuickAddProps {
  onCreated: () => void;
}

export function MemoQuickAdd({ onCreated }: MemoQuickAddProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const { projects, loadProjects } = useProjectStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() && !body.trim()) return;
    setSaving(true);
    try {
      await commands.createMemo(
        title.trim() || "(無題)",
        body,
        projectId || null
      );
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} gap={1}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography variant="caption" color="text.disabled">
            Cmd+Enter で送信
          </Typography>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.75rem', height: 28 }}
            >
              <MenuItem value="">
                <Typography variant="caption" color="text.secondary">プロジェクトなし</Typography>
              </MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  <Typography variant="caption">{p.name}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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
