import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import type { TaskInfo, TaskDetail } from '@/types/task';
import * as commands from '@/lib/tauri-commands';
import { emit, on } from '@/lib/events';

interface TaskPanelProps {
  projectId: string;
}

export function TaskPanel({ projectId }: TaskPanelProps) {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [dirty, setDirty] = useState(false);

  // 新規タスク
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

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
    return on("task:changed", loadTasks);
  }, [loadTasks]);

  // 未完了タスクを上、完了タスクを下に並べる
  const incompleteTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);
  const sortedTasks = [...incompleteTasks, ...completedTasks];

  const incompleteCount = incompleteTasks.length;
  const totalCount = tasks.length;

  const handleToggle = async (filename: string) => {
    // 閉じる前に保存
    if (expandedFile && dirty) {
      await saveEdit();
    }
    if (expandedFile === filename) {
      setExpandedFile(null);
      setDetail(null);
      return;
    }
    setExpandedFile(filename);
    setDirty(false);
    try {
      const d = await commands.readTask(filename);
      setDetail(d);
      setEditTitle(d.title === '(無題)' ? '' : d.title);
      setEditBody(d.body);
    } catch (e) {
      console.error('タスクの読み込みに失敗:', e);
    }
  };

  const saveEdit = async () => {
    if (!expandedFile || !dirty) return;
    const task = tasks.find((t) => t.filename === expandedFile);
    if (!task) return;
    try {
      await commands.updateTask(
        expandedFile,
        editTitle.trim() || '(無題)',
        editBody,
        task.done,
        projectId
      );
      setDirty(false);
      emit("task:changed");
    } catch (e) {
      console.error('タスクの更新に失敗:', e);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (related?.closest(`[data-task-panel="${expandedFile}"]`)) return;
    if (dirty) saveEdit();
  };

  const handleDoneToggle = async (task: TaskInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // もし展開中のタスクなら現在の編集内容を使う
      if (expandedFile === task.filename && detail) {
        await commands.updateTask(
          task.filename,
          editTitle.trim() || '(無題)',
          editBody,
          !task.done,
          projectId
        );
        setDirty(false);
      } else {
        // 読み込んでから更新する
        const d = await commands.readTask(task.filename);
        await commands.updateTask(
          task.filename,
          d.title,
          d.body,
          !task.done,
          projectId
        );
      }
      emit("task:changed");
    } catch (e2) {
      console.error('タスクの完了切替に失敗:', e2);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      await commands.deleteTask(filename);
      if (expandedFile === filename) {
        setExpandedFile(null);
        setDetail(null);
      }
      emit("task:changed");
    } catch (e) {
      console.error('タスクの削除に失敗:', e);
    }
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim() && !newBody.trim()) return;
    try {
      await commands.createTask(newTitle.trim() || '(無題)', newBody, projectId);
      setNewTitle('');
      setNewBody('');
      setAdding(false);
      emit("task:changed");
    } catch (e) {
      console.error('タスクの作成に失敗:', e);
    }
  };

  return (
    <>
      {/* ヘッダー */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        px: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
      }}>
        <Typography variant="body1" fontWeight={500} color="text.primary">
          タスク
        </Typography>
        <Chip
          label={`${incompleteCount}/${totalCount}`}
          size="small"
          sx={{ fontSize: '0.625rem', height: 20 }}
        />
      </Box>

      {/* タスク一覧 */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* 新規追加ボタン */}
        <Box sx={{ p: 1.5 }}>
          {adding ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                fullWidth
                variant="standard"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleCreateTask();
                  }
                  if (e.key === 'Escape') setAdding(false);
                }}
                placeholder="タスク名"
                autoFocus
                slotProps={{
                  input: {
                    disableUnderline: true,
                    sx: { fontWeight: 500, fontSize: '0.8125rem' },
                  },
                }}
              />
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleCreateTask();
                  }
                  if (e.key === 'Escape') setAdding(false);
                }}
                placeholder="メモ（任意）..."
                multiline
                rows={3}
              />
              <Box display="flex" justifyContent="flex-end" gap={0.5}>
                <IconButton size="small" onClick={() => setAdding(false)} title="キャンセル">
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCreateTask}
                  disabled={!newTitle.trim() && !newBody.trim()}
                  color="primary"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Box
              onClick={() => setAdding(true)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': { bgcolor: 'var(--bg-hover)', color: 'text.primary' },
                transition: 'all 150ms',
              }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">タスクを追加</Typography>
            </Box>
          )}
        </Box>

        {loading ? (
          <Typography variant="caption" color="text.disabled" sx={{ px: 2 }}>
            読み込み中...
          </Typography>
        ) : tasks.length === 0 && !adding ? (
          <Typography variant="caption" color="text.disabled" sx={{ px: 2 }}>
            このプロジェクトに紐づくタスクはありません
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {sortedTasks.map((task) => {
              const isExpanded = expandedFile === task.filename;
              return (
                <Box
                  key={task.filename}
                  data-task-panel={task.filename}
                  sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                >
                  {/* タスクヘッダー */}
                  <Box
                    onClick={() => handleToggle(task.filename)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 1,
                      py: 0.5,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'var(--bg-hover)' },
                      transition: 'background 150ms',
                    }}
                  >
                    <Checkbox
                      checked={task.done}
                      onClick={(e) => handleDoneToggle(task, e)}
                      size="small"
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    {isExpanded
                      ? <ExpandLessIcon sx={{ fontSize: 16, color: 'text.tertiary', mr: 0.5 }} />
                      : <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.tertiary', mr: 0.5 }} />
                    }
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        fontWeight={500}
                        color={task.done ? 'text.disabled' : 'text.primary'}
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textDecoration: task.done ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                        {task.created_at}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleDelete(task.filename); }}
                      sx={{ opacity: 0.3, '&:hover': { opacity: 1 }, transition: 'opacity 150ms' }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>

                  {/* 展開時: インライン編集 */}
                  {isExpanded && detail && (
                    <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        fullWidth
                        variant="standard"
                        value={editTitle}
                        onChange={(e) => { setEditTitle(e.target.value); setDirty(true); }}
                        onBlur={handleBlur}
                        placeholder="タスク名"
                        slotProps={{
                          input: {
                            disableUnderline: true,
                            sx: { fontWeight: 500, fontSize: '0.8125rem' },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        variant="standard"
                        value={editBody}
                        onChange={(e) => { setEditBody(e.target.value); setDirty(true); }}
                        onBlur={handleBlur}
                        placeholder="メモ（任意）..."
                        multiline
                        minRows={2}
                        slotProps={{
                          input: {
                            disableUnderline: true,
                            sx: { fontSize: '0.75rem', lineHeight: 1.6 },
                          },
                        }}
                      />
                      {dirty && (
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                          未保存 — フォーカスを外すと自動保存
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </>
  );
}
