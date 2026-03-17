import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import CheckIcon from "@mui/icons-material/Check";
import { Button } from "../ui";
import { useSettingsStore } from "../../stores/settingsStore";

const JAPANESE_FONTS = [
  { label: "明朝体（Noto Serif JP）", value: "Noto Serif JP" },
  { label: "源ノ明朝（Source Han Serif JP）", value: "Source Han Serif JP" },
  { label: "游明朝", value: "Yu Mincho" },
  { label: "ヒラギノ明朝", value: "Hiragino Mincho ProN" },
  { label: "ゴシック体（Noto Sans JP）", value: "Noto Sans JP" },
  { label: "游ゴシック", value: "Yu Gothic" },
  { label: "ヒラギノ角ゴ", value: "Hiragino Kaku Gothic ProN" },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24];

export function FontSettings() {
  const { settings, updateEditorSettings } = useSettingsStore();
  const { font_family, font_size } = settings.editor;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.04em' }}>
          フォント
        </Typography>
        <List disablePadding>
          {JAPANESE_FONTS.map((font) => (
            <ListItemButton
              key={font.value}
              selected={font_family === font.value}
              onClick={() => updateEditorSettings({ font_family: font.value })}
              sx={{
                borderRadius: 'var(--radius-lg)',
                mb: 0.5,
                py: 1.25,
                px: 1.5,
                border: '1px solid',
                borderColor: font_family === font.value ? 'primary.main' : 'transparent',
                bgcolor: font_family === font.value ? 'var(--accent-subtle)' : 'transparent',
                '&.Mui-selected': {
                  bgcolor: 'var(--accent-subtle)',
                },
                '&.Mui-selected:hover': {
                  bgcolor: 'var(--accent-subtle)',
                },
              }}
            >
              <Typography
                component="span"
                sx={{ mr: 1.5, fontSize: '1rem', fontFamily: `${font.value}, serif` }}
              >
                あ
              </Typography>
              <ListItemText
                primary={font.label}
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
              {font_family === font.value && (
                <CheckIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box>
        <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 1, letterSpacing: '0.04em' }}>
          文字サイズ
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {FONT_SIZES.map((size) => (
            <Button
              key={size}
              variant={font_size === size ? "primary" : "secondary"}
              size="sm"
              onClick={() => updateEditorSettings({ font_size: size })}
            >
              {size}px
            </Button>
          ))}
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 'var(--radius-lg)' }}>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>プレビュー</Typography>
        <Typography
          sx={{
            fontFamily: `${font_family}, serif`,
            fontSize: `${font_size}px`,
            lineHeight: 1.8,
            color: 'text.primary',
          }}
        >
          吾輩は猫である。名前はまだ無い。
        </Typography>
      </Paper>
    </Box>
  );
}
