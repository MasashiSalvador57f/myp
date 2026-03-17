import { useCallback, useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import type { ManuscriptFile } from '@/types';
import { useEditorStore } from '@/stores/editorStore';
import { SidebarItem } from '@/components/ui';

type SortMode = 'name-asc' | 'name-desc' | 'updated' | 'chars';

const SORT_CYCLE: SortMode[] = ['name-asc', 'name-desc', 'updated', 'chars'];

const SORT_LABELS: Record<SortMode, string> = {
  'name-asc': 'ファイル名 (昇順)',
  'name-desc': 'ファイル名 (降順)',
  'updated': '更新日時 (新しい順)',
  'chars': '文字数 (多い順)',
};

const SORT_ICONS: Record<SortMode, React.ReactNode> = {
  'name-asc': <SortByAlphaIcon sx={{ fontSize: 14 }} />,
  'name-desc': <SortByAlphaIcon sx={{ fontSize: 14, transform: 'scaleY(-1)' }} />,
  'updated': <AccessTimeIcon sx={{ fontSize: 14 }} />,
  'chars': <TextFieldsIcon sx={{ fontSize: 14 }} />,
};

const STORAGE_KEY = 'mypwriter-filelist-sort';

function loadSortMode(): SortMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SORT_CYCLE.includes(saved as SortMode)) return saved as SortMode;
  return 'name-asc';
}

interface FileListProps {
  onFileSelect?: (file: ManuscriptFile) => void;
  onCreateFile?: (filename: string) => void;
  onRenameFile?: (file: ManuscriptFile, newName: string) => void;
}

export function FileList({ onFileSelect, onCreateFile, onRenameFile }: FileListProps) {
  const { files, currentFile } = useEditorStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>(loadSortMode);

  const handleToggleSort = useCallback(() => {
    setSortMode((prev) => {
      const idx = SORT_CYCLE.indexOf(prev);
      const next = SORT_CYCLE[(idx + 1) % SORT_CYCLE.length];
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const sortedFiles = useMemo(() => {
    const sorted = [...files];
    switch (sortMode) {
      case 'name-asc':
        sorted.sort((a, b) => a.filename.localeCompare(b.filename, 'ja'));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.filename.localeCompare(a.filename, 'ja'));
        break;
      case 'updated':
        sorted.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
        break;
      case 'chars':
        sorted.sort((a, b) => b.char_count - a.char_count);
        break;
    }
    return sorted;
  }, [files, sortMode]);

  const handleCreate = useCallback(() => {
    const name = newFileName.trim();
    if (name) {
      const filename = name.endsWith('.txt') ? name : `${name}.txt`;
      onCreateFile?.(filename);
      setNewFileName('');
      setIsCreating(false);
    }
  }, [newFileName, onCreateFile]);

  const handleRename = useCallback(
    (file: ManuscriptFile) => {
      const name = renameValue.trim();
      if (name && name !== file.filename) {
        onRenameFile?.(file, name);
      }
      setRenamingFile(null);
      setRenameValue('');
    },
    [renameValue, onRenameFile],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
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
          原稿一覧
        </Typography>
        <Box display="flex" alignItems="center" gap={0.25}>
          <Tooltip title={SORT_LABELS[sortMode]} arrow placement="top">
            <IconButton
              size="small"
              onClick={handleToggleSort}
              sx={{ color: 'text.disabled' }}
            >
              {SORT_ICONS[sortMode]}
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => setIsCreating(true)}
            title="新規ファイル"
            sx={{ color: 'text.disabled' }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Sort indicator */}
      <Box sx={{ px: 2, py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
          {SORT_LABELS[sortMode]}
        </Typography>
      </Box>

      {/* File list */}
      <Box component="nav" sx={{ flex: 1, overflowY: 'auto', py: 1 }} className="scrollbar-on-hover">
        {/* New file input */}
        {isCreating && (
          <Box sx={{ px: 1.5, py: 0.5 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewFileName('');
                }
              }}
              onBlur={() => {
                if (newFileName.trim()) handleCreate();
                else setIsCreating(false);
              }}
              placeholder="ファイル名.txt"
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 28,
                  fontSize: '0.75rem',
                },
                '& .MuiOutlinedInput-input': {
                  px: 1,
                  py: 0.5,
                },
              }}
            />
          </Box>
        )}

        {files.length === 0 && !isCreating && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', px: 2, py: 1.5 }}>
            原稿ファイルがありません
          </Typography>
        )}

        {sortedFiles.map((file) => (
          <Box key={file.filename}>
            {renamingFile === file.filename ? (
              <Box sx={{ px: 1.5, py: 0.5 }}>
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(file);
                    if (e.key === 'Escape') {
                      setRenamingFile(null);
                      setRenameValue('');
                    }
                  }}
                  onBlur={() => handleRename(file)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 28,
                      fontSize: '0.75rem',
                    },
                    '& .MuiOutlinedInput-input': {
                      px: 1,
                      py: 0.5,
                    },
                  }}
                />
              </Box>
            ) : (
              <SidebarItem
                active={currentFile?.filename === file.filename}
                onClick={() => onFileSelect?.(file)}
                onDoubleClick={() => {
                  setRenamingFile(file.filename);
                  setRenameValue(file.filename);
                }}
                trailing={
                  <span style={{ fontSize: '0.625rem' }}>
                    {file.char_count.toLocaleString()}字
                  </span>
                }
              >
                {file.filename}
              </SidebarItem>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
