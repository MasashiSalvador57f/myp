import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Input, Button } from "../ui";
import { useSettingsStore } from "../../stores/settingsStore";

const PROVIDERS = [
  { value: "openai", label: "OpenAI", model: "gpt-5", placeholder: "sk-...", hint: "platform.openai.com から取得" },
  { value: "gemini", label: "Gemini", model: "gemini-3-flash", placeholder: "AIza...", hint: "aistudio.google.com から取得" },
];

export function AISettings() {
  const { settings, updateAiSettings } = useSettingsStore();
  const { api_key, gemini_api_key, provider } = settings.ai;
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* プロバイダー選択 */}
      <Box>
        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: "block", mb: 1.5, letterSpacing: "0.04em" }}>
          使用するプロバイダー
        </Typography>
        <Box display="flex" gap={1}>
          {PROVIDERS.map((p) => (
            <Box
              key={p.value}
              component="button"
              onClick={() => updateAiSettings({ provider: p.value })}
              sx={{
                flex: 1,
                py: 1.5,
                px: 2,
                borderRadius: "var(--radius-lg)",
                border: "1px solid",
                borderColor: provider === p.value ? "primary.main" : "divider",
                bgcolor: provider === p.value ? "var(--accent-subtle)" : "transparent",
                cursor: "pointer",
                transition: "all 200ms",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                "&:hover": {
                  bgcolor: provider === p.value ? "var(--accent-subtle)" : "action.hover",
                },
              }}
            >
              {provider === p.value && <CheckIcon sx={{ fontSize: 14, color: "primary.main" }} />}
              <Box>
                <Typography variant="body2" fontWeight={provider === p.value ? 600 : 400} color={provider === p.value ? "text.primary" : "text.secondary"}>
                  {p.label}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
                  {p.model}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* OpenAI APIキー */}
      <Box>
        <Input
          label="OpenAI APIキー"
          type={showOpenAIKey ? "text" : "password"}
          value={api_key ?? ""}
          onChange={(e) => updateAiSettings({ api_key: e.target.value || null })}
          placeholder="sk-..."
          hint="platform.openai.com から取得"
          iconRight={
            <IconButton onClick={() => setShowOpenAIKey((v) => !v)} edge="end" size="small">
              {showOpenAIKey ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          }
        />
      </Box>

      {/* Gemini APIキー */}
      <Box>
        <Input
          label="Gemini APIキー"
          type={showGeminiKey ? "text" : "password"}
          value={gemini_api_key ?? ""}
          onChange={(e) => updateAiSettings({ gemini_api_key: e.target.value || null })}
          placeholder="AIza..."
          hint="aistudio.google.com から取得"
          iconRight={
            <IconButton onClick={() => setShowGeminiKey((v) => !v)} edge="end" size="small">
              {showGeminiKey ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          }
        />
      </Box>

      <Box display="flex" alignItems="center" gap={1.5}>
        <Button variant="primary" onClick={handleSave}>
          {saved ? "保存しました" : "設定を保存"}
        </Button>
      </Box>
    </Box>
  );
}
