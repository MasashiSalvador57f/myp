import { useNavigate } from "react-router-dom";
import MuiCard from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import type { ProjectSummary } from "../../types";

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const progress =
    project.target_char_count && project.target_char_count > 0
      ? Math.min(100, (project.total_char_count / project.target_char_count) * 100)
      : null;

  const updatedDate = new Date(project.updated_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <MuiCard
      variant="outlined"
      onClick={() => navigate(`/project/${project.id}`)}
      sx={{
        p: 2.5,
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        '&:hover': {
          boxShadow: 'var(--shadow-sm)',
          borderColor: 'var(--border-default)',
        },
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Typography
          variant="body1"
          fontWeight={500}
          color="text.primary"
          sx={{
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.name}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
          {updatedDate}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          {project.total_char_count.toLocaleString()}字
        </Typography>
        {project.target_char_count && (
          <Typography variant="caption" color="text.disabled">
            目標: {project.target_char_count.toLocaleString()}字
          </Typography>
        )}
      </Box>

      {progress !== null && (
        <Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 'var(--radius-lg)',
              bgcolor: 'var(--bg-tertiary)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'primary.main',
                borderRadius: 'var(--radius-lg)',
              },
            }}
          />
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
            {Math.round(progress)}%
          </Typography>
        </Box>
      )}
    </MuiCard>
  );
}
