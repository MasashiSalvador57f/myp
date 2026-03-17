import { useState, useEffect, useCallback } from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MuiButton from "@mui/material/Button";
import type { MemoInfo, MemoDetail } from "../../types/memo";
import * as commands from "../../lib/tauri-commands";

interface MemoListProps {
  memos: MemoInfo[];
  loading: boolean;
  onDeleted: () => void;
  onUpdated: () => void;
}

export function MemoList({ memos, loading, onDeleted, onUpdated }: MemoListProps) {
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [detail, setDetail] = useState<MemoDetail | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  // カードに本文プレビューを表示するため、全メモの先頭数行を取得
  useEffect(() => {
    const loadPreviews = async () => {
      const map: Record<string, string> = {};
      for (const memo of memos) {
        try {
          const d = await commands.readMemo(memo.filename);
          map[memo.filename] = d.body;
        } catch {
          map[memo.filename] = "";
        }
      }
      setPreviews(map);
    };
    if (memos.length > 0) loadPreviews();
  }, [memos]);

  const saveAndClose = useCallback(async () => {
    if (openFile && dirty) {
      setSaving(true);
      try {
        await commands.updateMemo(openFile, editTitle.trim() || "(無題)", editBody);
        setDirty(false);
        onUpdated();
      } catch (e) {
        console.error("メモの更新に失敗:", e);
      } finally {
        setSaving(false);
      }
    }
    setOpenFile(null);
    setDetail(null);
  }, [openFile, dirty, editTitle, editBody, onUpdated]);

  const handleOpen = async (filename: string) => {
    setOpenFile(filename);
    setDirty(false);
    try {
      const d = await commands.readMemo(filename);
      setDetail(d);
      setEditTitle(d.title === "(無題)" ? "" : d.title);
      setEditBody(d.body);
    } catch (e) {
      console.error("メモの読み込みに失敗:", e);
    }
  };

  const handleDelete = async () => {
    if (!openFile) return;
    try {
      await commands.deleteMemo(openFile);
      setOpenFile(null);
      setDetail(null);
      setDirty(false);
      onDeleted();
    } catch (e) {
      console.error("メモの削除に失敗:", e);
    }
  };

  if (loading) {
    return (
      <Typography variant="body2" color="text.disabled" textAlign="center" py={2}>
        読み込み中...
      </Typography>
    );
  }

  if (memos.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled" textAlign="center" py={2}>
        メモがありません
      </Typography>
    );
  }

  return (
    <>
      {/* カードグリッド */}
      <Box sx={{ columnCount: { xs: 2, md: 3, lg: 4, xl: 5 }, columnGap: 1.5 }}>
        {memos.map((memo) => {
          const preview = previews[memo.filename] ?? "";
          return (
            <Card
              key={memo.filename}
              variant="outlined"
              onClick={() => handleOpen(memo.filename)}
              sx={{
                breakInside: 'avoid',
                mb: 1.5,
                p: 1.5,
                cursor: 'pointer',
                transition: 'all 200ms',
                '&:hover': {
                  borderColor: 'var(--border-default)',
                  boxShadow: 'var(--shadow-sm)',
                },
                '& .delete-btn': { opacity: 0 },
                '&:hover .delete-btn': { opacity: 1 },
              }}
            >
              <Typography variant="body2" fontWeight={500} color="text.primary" sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
              }}>
                {memo.title}
              </Typography>
              {preview && (
                <Typography variant="caption" color="text.secondary" sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}>
                  {preview}
                </Typography>
              )}
              <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.625rem' }}>
                  {memo.created_at}
                </Typography>
                <IconButton
                  className="delete-btn"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    commands.deleteMemo(memo.filename).then(onDeleted).catch(console.error);
                  }}
                  title="削除"
                  sx={{ transition: 'opacity 200ms' }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* 編集モーダル (Google Keep風) */}
      <Dialog
        open={!!openFile}
        onClose={saveAndClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 'var(--radius-xl)' },
        }}
      >
        <DialogContent sx={{ p: 2.5 }}>
          {detail ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                fullWidth
                variant="standard"
                value={editTitle}
                onChange={(e) => { setEditTitle(e.target.value); setDirty(true); }}
                onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); saveAndClose(); } }}
                placeholder="タイトル"
                autoFocus
                slotProps={{
                  input: {
                    disableUnderline: true,
                    sx: { fontWeight: 600, fontSize: '1rem' },
                  },
                }}
              />
              <TextField
                fullWidth
                variant="standard"
                value={editBody}
                onChange={(e) => { setEditBody(e.target.value); setDirty(true); }}
                onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); saveAndClose(); } }}
                placeholder="メモを入力..."
                multiline
                minRows={4}
                slotProps={{
                  input: {
                    disableUnderline: true,
                    sx: { fontSize: '0.875rem', lineHeight: 1.6 },
                  },
                }}
              />
              <Box display="flex" alignItems="center" justifyContent="space-between" pt={1} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.625rem' }}>
                    {detail.created_at}
                  </Typography>
                  {saving && (
                    <Typography variant="caption" color="primary.main" sx={{ fontSize: '0.625rem' }}>保存中...</Typography>
                  )}
                  {dirty && !saving && (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.625rem' }}>未保存</Typography>
                  )}
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton size="small" onClick={handleDelete} title="削除">
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <MuiButton size="small" onClick={saveAndClose} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                    閉じる
                  </MuiButton>
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled">
              読み込み中...
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
