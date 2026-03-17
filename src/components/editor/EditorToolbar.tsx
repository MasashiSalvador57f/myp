import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useEditorStore } from '@/stores/editorStore';
import { Button } from '@/components/ui';

const FONT_OPTIONS = [
  { label: '明朝体', value: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif' },
  { label: 'ゴシック体', value: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif' },
];

const FONT_SIZE_OPTIONS = [14, 16, 18, 20, 24];

export function EditorToolbar() {
  const {
    direction,
    toggleDirection,
    charsPerLine,
    setCharsPerLine,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    isDirty,
  } = useEditorStore();

  const isVertical = direction === 'vertical';

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 48,
        px: 2,
        bgcolor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
        userSelect: 'none',
        gap: 1,
      }}
    >
      {/* Writing direction toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDirection}
        title={isVertical ? '横書きに切替' : '縦書きに切替'}
      >
        <Box component="span" display="flex" alignItems="center" gap={0.5}>
          {isVertical ? <VerticalIcon /> : <HorizontalIcon />}
          <Typography variant="caption">{isVertical ? '縦書き' : '横書き'}</Typography>
        </Box>
      </Button>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

      {/* Characters per line */}
      <Box display="flex" alignItems="center" gap={0.75}>
        <Typography variant="caption" color="text.secondary">字/行</Typography>
        <TextField
          type="number"
          size="small"
          value={charsPerLine}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 10 && v <= 80) setCharsPerLine(v);
          }}
          slotProps={{
            input: {
              inputProps: { min: 10, max: 80 },
            },
          }}
          sx={{
            width: 64,
            '& .MuiOutlinedInput-root': { height: 28 },
            '& .MuiOutlinedInput-input': { textAlign: 'center', fontSize: '0.75rem', p: '2px 8px' },
          }}
        />
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

      {/* Font selector */}
      <Select
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value)}
        size="small"
        sx={{
          height: 28,
          fontSize: '0.75rem',
          '& .MuiSelect-select': { py: '2px' },
        }}
      >
        {FONT_OPTIONS.map((opt) => (
          <MenuItem key={opt.label} value={opt.value} sx={{ fontSize: '0.75rem' }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>

      {/* Font size */}
      <Select
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        size="small"
        sx={{
          height: 28,
          fontSize: '0.75rem',
          '& .MuiSelect-select': { py: '2px' },
        }}
      >
        {FONT_SIZE_OPTIONS.map((s) => (
          <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem' }}>
            {s}px
          </MenuItem>
        ))}
      </Select>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Dirty indicator */}
      {isDirty && (
        <Typography variant="caption" sx={{ color: 'warning.main' }}>未保存</Typography>
      )}
    </Box>
  );
}

function VerticalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="10" y1="2" x2="10" y2="12" />
      <line x1="7" y1="2" x2="7" y2="12" />
      <line x1="4" y1="2" x2="4" y2="8" />
    </svg>
  );
}

function HorizontalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="4" x2="12" y2="4" />
      <line x1="2" y1="7" x2="12" y2="7" />
      <line x1="2" y1="10" x2="8" y2="10" />
    </svg>
  );
}
