import { useCallback, useState } from 'react';
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-b-[var(--border-subtle)] shrink-0">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          原稿一覧
        </span>
        <button
          onClick={() => setIsCreating(true)}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          title="新規ファイル"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
        </button>
      </div>

      {/* File list */}
      <nav className="flex-1 overflow-y-auto scrollbar-on-hover py-2">
        {/* New file input */}
        {isCreating && (
          <div className="px-3 py-1">
            <input
              autoFocus
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
              className={[
                'w-full h-7 px-2 text-xs rounded-[var(--radius-md)]',
                'bg-[var(--bg-tertiary)] border border-[var(--border-focus)]',
                'text-[var(--text-primary)]',
                'outline-none',
              ].join(' ')}
            />
          </div>
        )}

        {files.length === 0 && !isCreating && (
          <p className="px-4 py-3 text-xs text-[var(--text-tertiary)]">
            原稿ファイルがありません
          </p>
        )}

        {files.map((file) => (
          <div key={file.filename} className="group">
            {renamingFile === file.filename ? (
              <div className="px-3 py-1">
                <input
                  autoFocus
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
                  className={[
                    'w-full h-7 px-2 text-xs rounded-[var(--radius-md)]',
                    'bg-[var(--bg-tertiary)] border border-[var(--border-focus)]',
                    'text-[var(--text-primary)]',
                    'outline-none',
                  ].join(' ')}
                />
              </div>
            ) : (
              <SidebarItem
                active={currentFile?.filename === file.filename}
                onClick={() => onFileSelect?.(file)}
                onDoubleClick={() => {
                  setRenamingFile(file.filename);
                  setRenameValue(file.filename);
                }}
                trailing={
                  <span className="text-[0.625rem]">
                    {file.char_count.toLocaleString()}字
                  </span>
                }
              >
                {file.filename}
              </SidebarItem>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
