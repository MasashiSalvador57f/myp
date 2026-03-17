import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button } from "../ui";
import { useSettingsStore } from "../../stores/settingsStore";
import type { WritingDirection } from "../../types";

const CHARS_PER_LINE_OPTIONS = [20, 25, 30, 35, 40, 45, 50, 60];

export function LayoutSettings() {
  const { settings, updateEditorSettings } = useSettingsStore();
  const { writing_mode, chars_per_line } = settings.editor;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.04em' }}>
          デフォルト表示方向
        </Typography>
        <Box display="flex" gap={1}>
          {(
            [
              { value: "vertical" as WritingDirection, label: "縦書き", icon: "縦" },
              { value: "horizontal" as WritingDirection, label: "横書き", icon: "横" },
            ] as const
          ).map(({ value, label, icon }) => (
            <Box
              key={value}
              component="button"
              onClick={() => updateEditorSettings({ writing_mode: value })}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                py: 2,
                borderRadius: 'var(--radius-xl)',
                border: '1px solid',
                borderColor: writing_mode === value ? 'primary.main' : 'divider',
                bgcolor: writing_mode === value ? 'var(--accent-subtle)' : 'transparent',
                color: writing_mode === value ? 'text.primary' : 'text.secondary',
                cursor: 'pointer',
                transition: 'all 200ms',
                '&:hover': {
                  bgcolor: writing_mode === value ? 'var(--accent-subtle)' : 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  writingMode: value === "vertical" ? "vertical-rl" : "horizontal-tb",
                }}
              >
                {icon}
              </Typography>
              <Typography variant="body2">{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.04em' }}>
          一行あたりの文字数（初期値）
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {CHARS_PER_LINE_OPTIONS.map((n) => (
            <Button
              key={n}
              variant={chars_per_line === n ? "primary" : "secondary"}
              size="sm"
              onClick={() => updateEditorSettings({ chars_per_line: n })}
            >
              {n}字
            </Button>
          ))}
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
          エディタで個別に変更することもできます
        </Typography>
      </Box>
    </Box>
  );
}
