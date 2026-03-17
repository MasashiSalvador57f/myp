import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";

interface ProgressBarProps {
  current: number;
  target: number | null;
}

export function ProgressBar({ current, target }: ProgressBarProps) {
  if (!target || target === 0) {
    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">現在の文字数</Typography>
          <Typography variant="body2" fontWeight={500} color="text.primary">
            {current.toLocaleString()}字
          </Typography>
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>目標未設定</Typography>
      </Box>
    );
  }

  const pct = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">執筆進捗</Typography>
        <Typography variant="body2" fontWeight={500} color="text.primary">
          {current.toLocaleString()}
          <Typography component="span" variant="body2" color="text.disabled" fontWeight={400}>
            {" "}/ {target.toLocaleString()}字
          </Typography>
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 10,
          borderRadius: 'var(--radius-lg)',
          bgcolor: 'var(--bg-tertiary)',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'primary.main',
            borderRadius: 'var(--radius-lg)',
            transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={target}
      />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.disabled">{pct}% 達成</Typography>
        {remaining > 0 && (
          <Typography variant="caption" color="text.disabled">残り {remaining.toLocaleString()}字</Typography>
        )}
        {remaining === 0 && (
          <Typography variant="caption" color="success.main">目標達成！</Typography>
        )}
      </Box>
    </Box>
  );
}
