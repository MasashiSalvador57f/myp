import { useNavigate } from "react-router-dom";
import { Card } from "../ui";
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
    <Card
      interactive
      onClick={() => navigate(`/project/${project.id}`)}
      className="flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[var(--text-primary)] font-medium text-sm leading-snug line-clamp-2">
          {project.name}
        </h3>
        <span className="text-[var(--text-tertiary)] text-xs shrink-0">{updatedDate}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>{project.total_char_count.toLocaleString()}字</span>
        {project.target_char_count && (
          <span className="text-[var(--text-tertiary)]">
            目標: {project.target_char_count.toLocaleString()}字
          </span>
        )}
      </div>

      {progress !== null && (
        <div className="space-y-1">
          <div className="bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-[var(--duration-slow)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[var(--text-tertiary)] text-[10px] text-right">
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </Card>
  );
}
