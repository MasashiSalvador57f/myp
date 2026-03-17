import { useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { useWritingLogStore } from '@/stores/writingLogStore';
import { Editor } from '@/components/editor/Editor';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { FileList } from '@/components/editor/FileList';
import { Button } from '@/components/ui';
import type { ManuscriptFile } from '@/types';
import * as commands from '@/lib/tauri-commands';

export default function EditorPage() {
  const { projectId, fileId } = useParams();
  const {
    setProjectId,
    setFiles,
    setCurrentFile,
    setContent,
    content,
    isDirty,
    markClean,
    currentFile,
    toggleLeftSidebar,
    toggleRightSidebar,
  } = useEditorStore();

  const { recordWriting } = useWritingLogStore();

  // 前回保存時の文字数を追跡（差分計算用）
  const lastSavedCharCountRef = useRef(0);

  // Ref to access latest values in callbacks without stale closures
  const stateRef = useRef({ projectId, currentFile, content, isDirty });
  stateRef.current = { projectId, currentFile, content, isDirty };

  /** Save current file if dirty (used before file switch and on unmount) */
  const saveCurrentIfDirty = useCallback(async () => {
    const { projectId: pid, currentFile: cf, content: c, isDirty: dirty } = stateRef.current;
    if (!pid || !cf || !dirty) return;
    try {
      await commands.saveChapter(pid, cf.filename, c);
      markClean();
    } catch (err) {
      console.error('Auto-save on switch failed:', err);
    }
  }, [markClean]);

  // Load project on mount
  useEffect(() => {
    if (!projectId) return;
    setProjectId(projectId);

    commands
      .getProject(projectId)
      .then((result) => {
        setFiles(result.manuscripts);
        // Auto-select file by route param or first file
        const target = fileId
          ? result.manuscripts.find((f) => f.filename === fileId)
          : result.manuscripts[0];
        if (target) {
          selectFile(target);
        }
      })
      .catch((err) => {
        console.error('Failed to load project:', err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const selectFile = useCallback(
    (file: ManuscriptFile) => {
      if (!projectId) return;
      // Save current file before switching
      void saveCurrentIfDirty().then(() => {
        setCurrentFile(file);
        commands
          .readChapter(projectId, file.filename)
          .then((result) => {
            setContent(result.content);
            lastSavedCharCountRef.current = [...result.content].length;
          })
          .catch((err) => {
            console.error('Failed to read file:', err);
          });
      });
    },
    [projectId, setCurrentFile, setContent, saveCurrentIfDirty],
  );

  // Save on unmount (leaving editor page)
  useEffect(() => {
    return () => {
      void saveCurrentIfDirty();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = useCallback(
    async (text: string) => {
      if (!projectId || !currentFile) return;
      await commands.saveChapter(projectId, currentFile.filename, text);

      // 執筆ログを記録（文字数差分）
      const currentCharCount = [...text].length;
      const delta = currentCharCount - lastSavedCharCountRef.current;
      lastSavedCharCountRef.current = currentCharCount;

      if (delta !== 0) {
        void recordWriting(projectId, currentFile.filename, delta, currentCharCount);
      }
    },
    [projectId, currentFile, recordWriting],
  );

  const handleCreateFile = useCallback(
    (filename: string) => {
      if (!projectId) return;
      commands
        .createChapter(projectId, filename)
        .then(() => {
          return commands.getProject(projectId);
        })
        .then((result) => {
          setFiles(result.manuscripts);
          const created = result.manuscripts.find(
            (f) => f.filename === filename,
          );
          if (created) selectFile(created);
        })
        .catch((err) => {
          console.error('Failed to create file:', err);
        });
    },
    [projectId, setFiles, selectFile],
  );

  return (
    <EditorLayout
      toolbar={
        <div className="flex flex-col">
          {/* Navigation bar */}
          <div className="flex items-center h-10 px-3 bg-[var(--bg-secondary)] border-b border-b-[var(--border-subtle)] gap-2">
            <Link to={`/project/${projectId}`}>
              <Button variant="ghost" size="sm">
                ← 戻る
              </Button>
            </Link>
            <span className="text-xs text-[var(--text-tertiary)]">
              {currentFile?.filename ?? 'ファイル未選択'}
            </span>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLeftSidebar}
              title="原稿一覧 (⌘B)"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="2" width="12" height="10" rx="1" />
                <line x1="5" y1="2" x2="5" y2="12" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRightSidebar}
              title="AI相談 (⌘J)"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="2" width="12" height="10" rx="1" />
                <line x1="9" y1="2" x2="9" y2="12" />
              </svg>
            </Button>
          </div>
          {/* Editor toolbar */}
          <EditorToolbar />
        </div>
      }
      leftSidebar={
        <FileList
          onFileSelect={selectFile}
          onCreateFile={handleCreateFile}
        />
      }
      editor={<Editor onSave={handleSave} />}
      rightPanel={<div />}
    />
  );
}
