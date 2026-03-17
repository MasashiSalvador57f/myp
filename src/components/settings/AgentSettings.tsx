import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MuiButton from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { PresetAgent } from "../../types";
import { PRESET_AGENTS } from "../../stores/chatStore";

const STORAGE_KEY = "mypwriter-custom-agents";

export interface CustomAgent {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
}

function loadCustomAgents(): CustomAgent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomAgents(agents: CustomAgent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
}

/** すべてのエージェント（プリセット + カスタム）を返す */
export function getAllAgents(): PresetAgent[] {
  const custom = loadCustomAgents();
  return [
    ...PRESET_AGENTS,
    ...custom.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      system_prompt: a.system_prompt,
    })),
  ];
}

export function AgentSettings() {
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>(loadCustomAgents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null);
  const [form, setForm] = useState({ name: "", description: "", system_prompt: "" });
  const [detailAgent, setDetailAgent] = useState<(PresetAgent & { isCustom?: boolean }) | null>(null);

  useEffect(() => {
    saveCustomAgents(customAgents);
  }, [customAgents]);

  const handleOpenNew = () => {
    setEditingAgent(null);
    setForm({ name: "", description: "", system_prompt: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (agent: CustomAgent) => {
    setEditingAgent(agent);
    setForm({ name: agent.name, description: agent.description, system_prompt: agent.system_prompt });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingAgent) {
      setCustomAgents((prev) =>
        prev.map((a) =>
          a.id === editingAgent.id
            ? { ...a, name: form.name.trim(), description: form.description.trim(), system_prompt: form.system_prompt.trim() }
            : a
        )
      );
    } else {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setCustomAgents((prev) => [
        ...prev,
        { id, name: form.name.trim(), description: form.description.trim(), system_prompt: form.system_prompt.trim() },
      ]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCustomAgents((prev) => prev.filter((a) => a.id !== id));
  };

  // 詳細ビュー
  if (detailAgent) {
    const isCustom = !!(detailAgent as CustomAgent & { isCustom?: boolean }).isCustom;
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small" onClick={() => setDetailAgent(null)} title="一覧に戻る">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" fontWeight={500} color="text.primary">
            {detailAgent.name}
          </Typography>
          <Chip
            label={isCustom ? "カスタム" : "プリセット"}
            size="small"
            color={isCustom ? "primary" : "default"}
            sx={{ fontSize: "0.6rem", height: 18 }}
          />
        </Box>
        <Box>
          <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: "block", mb: 0.5, letterSpacing: "0.04em" }}>
            役割
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {detailAgent.description}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: "block", mb: 0.5, letterSpacing: "0.04em" }}>
            システムプロンプト
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "var(--radius-lg)",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "var(--bg-tertiary)",
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            <Typography variant="caption" color="text.primary" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
              {detailAgent.system_prompt}
            </Typography>
          </Box>
        </Box>
        {isCustom && (
          <Box display="flex" gap={1}>
            <MuiButton
              size="small"
              variant="outlined"
              onClick={() => {
                const custom = customAgents.find((a) => a.id === detailAgent.id);
                if (custom) {
                  handleOpenEdit(custom);
                  setDetailAgent(null);
                }
              }}
              sx={{ textTransform: "none" }}
            >
              編集
            </MuiButton>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* プリセットエージェント */}
      <Box>
        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: "block", mb: 1.5, letterSpacing: "0.04em" }}>
          プリセットエージェント
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {PRESET_AGENTS.map((agent) => (
            <Box
              key={agent.id}
              onClick={() => setDetailAgent(agent)}
              sx={{
                p: 1.5,
                borderRadius: "var(--radius-lg)",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "var(--bg-tertiary)",
                cursor: "pointer",
                transition: "border-color 0.15s",
                "&:hover": { borderColor: "text.disabled" },
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  {agent.name}
                </Typography>
                <Chip label="プリセット" size="small" sx={{ fontSize: "0.6rem", height: 18 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                {agent.description}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem", display: "block", whiteSpace: "pre-wrap", maxHeight: 60, overflow: "hidden" }}>
                {agent.system_prompt.slice(0, 120)}...
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* カスタムエージェント */}
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ letterSpacing: "0.04em" }}>
            カスタムエージェント
          </Typography>
          <IconButton size="small" onClick={handleOpenNew} color="primary" title="エージェントを追加">
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        {customAgents.length === 0 ? (
          <Typography variant="caption" color="text.disabled">
            カスタムエージェントはまだありません。追加ボタンから作成できます。
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {customAgents.map((agent) => (
              <Box
                key={agent.id}
                onClick={() => setDetailAgent({ ...agent, isCustom: true })}
                sx={{
                  p: 1.5,
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid",
                  borderColor: "primary.main",
                  bgcolor: "var(--accent-subtle)",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                  "&:hover": { borderColor: "primary.dark" },
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={500} color="text.primary">
                      {agent.name}
                    </Typography>
                    <Chip label="カスタム" size="small" color="primary" sx={{ fontSize: "0.6rem", height: 18 }} />
                  </Box>
                  <Box display="flex" gap={0.5} onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => handleOpenEdit(agent)} title="編集">
                      <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(agent.id)} title="削除">
                      <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  {agent.description}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem", display: "block", whiteSpace: "pre-wrap", maxHeight: 60, overflow: "hidden" }}>
                  {agent.system_prompt.slice(0, 120)}...
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* 作成/編集ダイアログ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "1rem" }}>
          {editingAgent ? "エージェントを編集" : "新しいエージェントを作成"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField
            label="名前"
            fullWidth
            size="small"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="例: 校正エディター"
            autoFocus
          />
          <TextField
            label="役割（説明）"
            fullWidth
            size="small"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="例: 誤字脱字や文法ミスをチェックします"
          />
          <TextField
            label="プロンプト"
            fullWidth
            size="small"
            value={form.system_prompt}
            onChange={(e) => setForm((f) => ({ ...f, system_prompt: e.target.value }))}
            placeholder="あなたは..."
            multiline
            minRows={4}
            maxRows={10}
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDialogOpen(false)} sx={{ textTransform: "none" }}>
            キャンセル
          </MuiButton>
          <MuiButton
            onClick={handleSave}
            variant="contained"
            disabled={!form.name.trim()}
            sx={{ textTransform: "none" }}
          >
            {editingAgent ? "保存" : "作成"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
