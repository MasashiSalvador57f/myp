import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import type { MemoInfo, MemoDetail } from '@/types/memo';
import * as commands from '@/lib/tauri-commands';
import { emit, on } from '@/lib/events';

interface MemoPanelProps {
  projectId: string;
  /** チャットセッションリンクがクリックされた時 */
  onOpenChatSession?: (sessionId: string) => void;
}

export function MemoPanel({ projectId, onOpenChatSession }: MemoPanelProps) {
  const [memos, setMemos] = useState<MemoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [detail, setDetail] = useState<MemoDetail | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [dirty, setDirty] = useState(false);

  // 新規メモ
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const loadMemos = useCallback(async () => {
    setLoading(true);
    try {
      const all = await commands.listMemos();
      const filtered = all.filter((m) => m.project_id === projectId);
      setMemos(filtered);
    } catch {
      setMemos([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadMemos();
    return on("memo:changed", loadMemos);
  }, [loadMemos]);

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
      const d = await commands.readMemo(filename);
      setDetail(d);
      setEditTitle(d.title === '(無題)' ? '' : d.title);
      setEditBody(d.body);
    } catch (e) {
      console.error('メモの読み込みに失敗:', e);
    }
  };

  const saveEdit = async () => {
    if (!expandedFile || !dirty) return;
    try {
      await commands.updateMemo(expandedFile, editTitle.trim() || '(無題)', editBody, projectId);
      setDirty(false);
      emit("memo:changed");
    } catch (e) {
      console.error('メモの更新に失敗:', e);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (related?.closest(`[data-memo-panel="${expandedFile}"]`)) return;
    if (dirty) saveEdit();
  };

  const handleDelete = async (filename: string) => {
    try {
      await commands.deleteMemo(filename);
      if (expandedFile === filename) {
        setExpandedFile(null);
        setDetail(null);
      }
      emit("memo:changed");
    } catch (e) {
      console.error('メモの削除に失敗:', e);
    }
  };

  const handleCreateMemo = async () => {
    if (!newTitle.trim() && !newBody.trim()) return;
    try {
      await commands.createMemo(newTitle.trim() || '(無題)', newBody, projectId);
      setNewTitle('');
      setNewBody('');
      setAdding(false);
      emit("memo:changed");
    } catch (e) {
      console.error('メモの作成に失敗:', e);
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
          メモ
        </Typography>
        <Chip label={memos.length} size="small" sx={{ fontSize: '0.625rem', height: 20 }} />
      </Box>

      {/* メモ一覧 */}
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
                    handleCreateMemo();
                  }
                  if (e.key === 'Escape') setAdding(false);
                }}
                placeholder="タイトル"
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
                    handleCreateMemo();
                  }
                  if (e.key === 'Escape') setAdding(false);
                }}
                placeholder="メモの内容..."
                multiline
                rows={3}
              />
              <Box display="flex" justifyContent="flex-end" gap={0.5}>
                <IconButton size="small" onClick={() => setAdding(false)} title="キャンセル">
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCreateMemo}
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
              <Typography variant="caption">メモを追加</Typography>
            </Box>
          )}
        </Box>

        {loading ? (
          <Typography variant="caption" color="text.disabled" sx={{ px: 2 }}>
            読み込み中...
          </Typography>
        ) : memos.length === 0 && !adding ? (
          <Typography variant="caption" color="text.disabled" sx={{ px: 2 }}>
            このプロジェクトに紐づくメモはありません
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {memos.map((memo) => {
              const isExpanded = expandedFile === memo.filename;
              return (
                <Box
                  key={memo.filename}
                  data-memo-panel={memo.filename}
                  sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                >
                  {/* メモヘッダー */}
                  <Box
                    onClick={() => handleToggle(memo.filename)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'var(--bg-hover)' },
                      transition: 'background 150ms',
                    }}
                  >
                    {isExpanded
                      ? <ExpandLessIcon sx={{ fontSize: 16, color: 'text.tertiary', mr: 1 }} />
                      : <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.tertiary', mr: 1 }} />
                    }
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        fontWeight={500}
                        color="text.primary"
                        sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {memo.title}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                        {memo.created_at}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleDelete(memo.filename); }}
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
                        placeholder="タイトル"
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
                        placeholder="メモの内容..."
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
                      {/* チャットセッションリンク */}
                      {onOpenChatSession && detail.body && (() => {
                        const match = detail.body.match(/📎 チャットセッション: (session-[\w-]+)/);
                        if (!match) return null;
                        const sessionId = match[1];
                        return (
                          <Box
                            onClick={() => onOpenChatSession(sessionId)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              cursor: 'pointer',
                              color: 'primary.main',
                              '&:hover': { textDecoration: 'underline' },
                              mt: 0.5,
                            }}
                          >
                            <ChatBubbleOutlineIcon sx={{ fontSize: 12 }} />
                            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                              元のチャットを開く
                            </Typography>
                          </Box>
                        );
                      })()}
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
