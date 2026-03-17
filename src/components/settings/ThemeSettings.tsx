import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import { useTheme } from "../ui/ThemeProvider";
import { useSettingsStore } from "../../stores/settingsStore";
import { THEME_PRESETS } from "../../styles/theme-presets";

export function ThemeSettings() {
  const { colorPreset, setColorPreset } = useTheme();
  const { updateEditorSettings } = useSettingsStore();

  const handleSelect = (presetId: string) => {
    setColorPreset(presetId);
    // Also persist to settings store / backend
    updateEditorSettings({ color_preset: presetId });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box>
        <Typography
          variant="caption"
          fontWeight={500}
          color="text.secondary"
          sx={{ display: "block", mb: 1.5, letterSpacing: "0.04em" }}
        >
          カラープリセット
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1.5,
          }}
        >
          {THEME_PRESETS.map((preset) => {
            const isSelected = colorPreset === preset.id;
            const displayColor = preset.previewColor;

            return (
              <Box
                key={preset.id}
                component="button"
                onClick={() => handleSelect(preset.id)}
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  py: 2,
                  px: 1.5,
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  bgcolor: isSelected
                    ? "var(--accent-subtle)"
                    : "transparent",
                  cursor: "pointer",
                  transition: "all 200ms",
                  "&:hover": {
                    bgcolor: isSelected
                      ? "var(--accent-subtle)"
                      : "action.hover",
                  },
                }}
              >
                {/* Color circle */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: displayColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: preset.minimal
                      ? "2px dashed"
                      : "2px solid",
                    borderColor: isSelected
                      ? "primary.main"
                      : "transparent",
                    transition: "border-color 200ms",
                  }}
                >
                  {isSelected && (
                    <CheckIcon
                      sx={{
                        fontSize: 16,
                        color: "#fff",
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
                      }}
                    />
                  )}
                </Box>

                {/* Label */}
                <Typography
                  variant="body2"
                  fontWeight={isSelected ? 500 : 400}
                  color={isSelected ? "text.primary" : "text.secondary"}
                  sx={{ fontSize: "0.8125rem" }}
                >
                  {preset.name}
                </Typography>

                {/* Description */}
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{
                    fontSize: "0.6875rem",
                    lineHeight: 1.3,
                    textAlign: "center",
                  }}
                >
                  {preset.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
