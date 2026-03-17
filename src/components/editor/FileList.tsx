import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import type { ManuscriptFile } from '@/types';
import { useEditorStore } from '@/stores/editorStore';
import { SidebarItem } from '@/components/ui';

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
        <IconButton
          size="small"
          onClick={() => setIsCreating(true)}
          title="新規ファイル"
          sx={{ color: 'text.disabled' }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
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

        {files.map((file) => (
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
