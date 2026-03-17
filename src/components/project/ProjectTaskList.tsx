import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiCheckbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import type { TaskInfo } from "../../types/task";
import * as commands from "../../lib/tauri-commands";

interface ProjectTaskListProps {
  projectId: string;
}

export function ProjectTaskList({ projectId }: ProjectTaskListProps) {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const all = await commands.listTasks(projectId);
      setTasks(all);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggleDone = async (task: TaskInfo) => {
    try {
      const d = await commands.readTask(task.filename);
      await commands.updateTask(task.filename, d.title, d.body, !task.done, projectId);
      loadTasks();
    } catch (e) {
      console.error("タスクの完了切替に失敗:", e);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      await commands.deleteTask(filename);
      loadTasks();
    } catch (e) {
      console.error("タスクの削除に失敗:", e);
    }
  };

  const incompleteTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);
  const sorted = [...incompleteTasks, ...completedTasks];

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
        <CheckBoxOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="body1" fontWeight={500} color="text.primary">
          タスク
        </Typography>
        {tasks.length > 0 && (
          <Chip
            label={`${incompleteTasks.length}/${tasks.length}`}
            size="small"
            sx={{ fontSize: "0.625rem", height: 20 }}
          />
        )}
      </Box>

      {loading ? (
        <Typography variant="caption" color="text.disabled">
          読み込み中...
        </Typography>
      ) : tasks.length === 0 ? (
        <Typography variant="caption" color="text.disabled">
          タスクはありません
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {sorted.map((task) => (
            <Box
              key={task.filename}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 0.5,
                p: 1,
                borderRadius: "var(--radius-md)",
                "&:hover": { bgcolor: "var(--bg-hover)" },
                transition: "background 150ms",
              }}
            >
              <MuiCheckbox
                checked={task.done}
                onClick={() => handleToggleDone(task)}
                size="small"
                sx={{ p: 0.25, mt: 0.1 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color={task.done ? "text.disabled" : "text.primary"}
                  sx={{
                    fontSize: "0.8rem",
                    textDecoration: task.done ? "line-through" : "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.title}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>
                  {task.created_at}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => handleDelete(task.filename)}
                sx={{ opacity: 0.3, "&:hover": { opacity: 1 }, transition: "opacity 150ms", p: 0.25 }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
