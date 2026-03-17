import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import Tooltip from '@mui/material/Tooltip';
import { useEditorStore } from '@/stores/editorStore';
import { useWritingLogStore } from '@/stores/writingLogStore';
import { Editor } from '@/components/editor/Editor';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { FileList } from '@/components/editor/FileList';
import { LeftSidebarTabs } from '@/components/editor/LeftSidebarTabs';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useChatStore } from '@/stores/chatStore';
import { Button } from '@/components/ui';
import type { ManuscriptFile } from '@/types';
import * as commands from '@/lib/tauri-commands';

interface EditorLocationState {
  chatSessionFilename?: string;
}

export default function EditorPage() {
  const { projectId, fileId } = useParams();
  const location = useLocation();
  const locationState = (location.state ?? {}) as EditorLocationState;
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
    rightSidebarOpen,
  } = useEditorStore();

  const { sessions, switchSession, loadSessionsFromDisk } = useChatStore();

  const [focusMode, setFocusMode] = useState(false);

  // ESCでフォーカスモード解除
  useEffect(() => {
    if (!focusMode) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [focusMode]);

  // ProjectPageの「最近のAI相談」クリックでエディタに遷移した場合、対象セッションを開く
  useEffect(() => {
    const filename = locationState.chatSessionFilename;
    if (!filename || !projectId) return;

    // セッションIDはファイル名から拡張子を除いたもの（例: "session-xxx.json" -> "session-xxx"）
    const sessionId = filename.replace(/\.json$/, '');

    const openSession = async () => {
      // まだセッション一覧が読み込まれていなければ読み込む
      let targetSession = sessions.find((s) => s.id === sessionId);
      if (!targetSession) {
        await loadSessionsFromDisk(projectId);
        // storeが更新されるのを待つため、最新のsessionsはuseEffectが再実行されて参照する
        return;
      }
      switchSession(targetSession);
      if (!rightSidebarOpen) {
        toggleRightSidebar();
      }
    };

    void openSession();
  // sessions が変化したときに再試行できるよう依存に含める
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationState.chatSessionFilename, projectId, sessions]);

  // メモのチャットリンクからセッションを開く
  const handleOpenChatSession = useCallback((sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      switchSession(session);
      // 右サイドバーが閉じていたら開く
      if (!rightSidebarOpen) {
        toggleRightSidebar();
      }
    }
  }, [sessions, switchSession, rightSidebarOpen, toggleRightSidebar]);

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

  const handleRenameFile = useCallback(
    (file: ManuscriptFile, newName: string) => {
      if (!projectId) return;
      const finalName = newName.endsWith('.txt') ? newName : `${newName}.txt`;
      // リネーム前に未保存内容を保存してからリネーム（古いファイル名での保存が後から走るのを防ぐ）
      void saveCurrentIfDirty().then(() => {
        commands
          .renameChapter(projectId, file.filename, finalName)
          .then(() => commands.getProject(projectId))
          .then((result) => {
            setFiles(result.manuscripts);
            // リネームしたファイルが現在開いているファイルなら選択し直す
            if (currentFile?.filename === file.filename) {
              const renamed = result.manuscripts.find((f) => f.filename === finalName);
              if (renamed) selectFile(renamed);
            }
          })
          .catch((err) => {
            console.error('Failed to rename file:', err);
          });
      });
    },
    [projectId, setFiles, currentFile, selectFile, saveCurrentIfDirty],
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
      focusMode={focusMode}
      toolbar={
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* Navigation bar */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            height: 40,
            px: 1.5,
            bgcolor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            gap: 1,
          }}>
            <Link to={`/project/${projectId}`} style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm">
                ← 戻る
              </Button>
            </Link>
            <Typography variant="caption" color="text.disabled">
              {currentFile?.filename ?? 'ファイル未選択'}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="フォーカスモード" arrow>
              <IconButton
                size="small"
                onClick={() => setFocusMode(true)}
                sx={{ color: 'text.secondary' }}
              >
                <CenterFocusStrongIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              onClick={toggleLeftSidebar}
              title="原稿一覧 (⌘B)"
              sx={{ color: 'text.secondary' }}
            >
              <ViewSidebarIcon fontSize="small" sx={{ transform: 'scaleX(-1)' }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleRightSidebar}
              title="AI相談 (⌘J)"
              sx={{ color: 'text.secondary' }}
            >
              <ViewSidebarOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
          {/* Editor toolbar */}
          <EditorToolbar />
        </Box>
      }
      leftSidebar={
        projectId ? (
          <LeftSidebarTabs
            projectId={projectId}
            onFileSelect={selectFile}
            onCreateFile={handleCreateFile}
            onRenameFile={handleRenameFile}
            onOpenChatSession={handleOpenChatSession}
          />
        ) : (
          <FileList
            onFileSelect={selectFile}
            onCreateFile={handleCreateFile}
            onRenameFile={handleRenameFile}
          />
        )
      }
      editor={<Editor onSave={handleSave} />}
      rightPanel={projectId ? <ChatPanel projectId={projectId} manuscriptContext={content} /> : undefined}
    />
  );
}
