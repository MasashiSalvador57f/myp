import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Input, Button } from "../ui";
import { useSettingsStore } from "../../stores/settingsStore";

const AI_MODELS = [
  { label: "Claude Opus 4.6（高性能）", value: "claude-opus-4-6" },
  { label: "Claude Sonnet 4.6（バランス）", value: "claude-sonnet-4-6" },
  { label: "Claude Haiku 4.5（高速）", value: "claude-haiku-4-5-20251001" },
];

export function AISettings() {
  const { settings, updateAiSettings } = useSettingsStore();
  const { api_key, model } = settings.ai;
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateAiSettings({ api_key, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Input
          label="APIキー"
          type={showKey ? "text" : "password"}
          value={api_key ?? ""}
          onChange={(e) => updateAiSettings({ api_key: e.target.value || null })}
          placeholder="sk-ant-..."
          hint="Anthropic Console から取得できます"
          iconRight={
            <IconButton
              onClick={() => setShowKey((v) => !v)}
              edge="end"
              size="small"
              aria-label={showKey ? "パスワードを隠す" : "パスワードを表示"}
            >
              {showKey ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          }
        />
      </Box>

      <Box>
        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.04em' }}>
          モデル
        </Typography>
        <List disablePadding>
          {AI_MODELS.map((m) => (
            <ListItemButton
              key={m.value}
              selected={model === m.value}
              onClick={() => updateAiSettings({ model: m.value })}
              sx={{
                borderRadius: 'var(--radius-lg)',
                mb: 0.5,
                py: 1.25,
                px: 1.5,
                border: '1px solid',
                borderColor: model === m.value ? 'primary.main' : 'transparent',
                bgcolor: model === m.value ? 'var(--accent-subtle)' : 'transparent',
                '&.Mui-selected': {
                  bgcolor: 'var(--accent-subtle)',
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'var(--accent-subtle)',
                },
              }}
            >
              <ListItemText
                primary={m.label}
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
              {model === m.value && (
                <CheckIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box display="flex" alignItems="center" gap={1.5}>
        <Button variant="primary" onClick={handleSave}>
          {saved ? "保存しました" : "設定を保存"}
        </Button>
      </Box>
    </Box>
  );
}
