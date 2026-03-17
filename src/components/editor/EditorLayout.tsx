import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useEditorStore } from '@/stores/editorStore';

const LEFT_STORAGE_KEY = 'mypwriter-left-sidebar-width';
const RIGHT_STORAGE_KEY = 'mypwriter-right-sidebar-width';
const LEFT_DEFAULT = 220;
const RIGHT_DEFAULT = 320;
const MIN_WIDTH = 160;
const MAX_WIDTH = 600;

function loadWidth(key: string, fallback: number): number {
  const saved = localStorage.getItem(key);
  if (saved) {
    const n = parseInt(saved, 10);
    if (!isNaN(n) && n >= MIN_WIDTH && n <= MAX_WIDTH) return n;
  }
  return fallback;
}

interface EditorLayoutProps {
  toolbar: ReactNode;
  leftSidebar: ReactNode;
  editor: ReactNode;
  rightPanel?: ReactNode;
}

export function EditorLayout({
  toolbar,
  leftSidebar,
  editor,
  rightPanel,
}: EditorLayoutProps) {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar,
  } = useEditorStore();

  const [leftWidth, setLeftWidth] = useState(() => loadWidth(LEFT_STORAGE_KEY, LEFT_DEFAULT));
  const [rightWidth, setRightWidth] = useState(() => loadWidth(RIGHT_STORAGE_KEY, RIGHT_DEFAULT));
  const draggingRef = useRef<'left' | 'right' | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleLeftSidebar();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        toggleRightSidebar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLeftSidebar, toggleRightSidebar]);

  // Drag resize handlers
  const handleMouseDown = useCallback((side: 'left' | 'right', e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = side;
    startXRef.current = e.clientX;
    startWidthRef.current = side === 'left' ? leftWidth : rightWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [leftWidth, rightWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientX - startXRef.current;
      if (draggingRef.current === 'left') {
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
        setLeftWidth(newWidth);
      } else {
        // 右パネルはドラッグ方向が逆
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current - delta));
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (!draggingRef.current) return;
      const side = draggingRef.current;
      draggingRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // 永続化
      if (side === 'left') {
        localStorage.setItem(LEFT_STORAGE_KEY, String(leftWidth));
      } else {
        localStorage.setItem(RIGHT_STORAGE_KEY, String(rightWidth));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [leftWidth, rightWidth]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'var(--bg-primary)' }}>
      {toolbar}

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left sidebar */}
        <Box
          component="aside"
          sx={{
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'var(--bg-secondary)',
            overflow: 'hidden',
            width: leftSidebarOpen ? leftWidth : 0,
            transition: draggingRef.current === 'left' ? 'none' : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-hidden={!leftSidebarOpen}
        >
          <Box sx={{ width: leftWidth, height: '100%' }}>
            {leftSidebar}
          </Box>
        </Box>

        {/* Left resize handle */}
        {leftSidebarOpen && (
          <Box
            onMouseDown={(e) => handleMouseDown('left', e)}
            sx={{
              width: 4,
              cursor: 'col-resize',
              flexShrink: 0,
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'var(--accent-subtle)' },
              transition: 'background 150ms',
              zIndex: 1,
            }}
          />
        )}

        {/* Center editor */}
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          {editor}
        </Box>

        {/* Right resize handle */}
        {rightPanel && rightSidebarOpen && (
          <Box
            onMouseDown={(e) => handleMouseDown('right', e)}
            sx={{
              width: 4,
              cursor: 'col-resize',
              flexShrink: 0,
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'var(--accent-subtle)' },
              transition: 'background 150ms',
              zIndex: 1,
            }}
          />
        )}

        {/* Right panel */}
        {rightPanel && (
          <Box
            component="aside"
            sx={{
              flexShrink: 0,
              borderLeft: '1px solid',
              borderColor: 'divider',
              bgcolor: 'var(--bg-secondary)',
              overflow: 'hidden',
              width: rightSidebarOpen ? rightWidth : 0,
              transition: draggingRef.current === 'right' ? 'none' : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            aria-hidden={!rightSidebarOpen}
          >
            <Box sx={{ width: rightWidth, height: '100%' }}>
              {rightPanel}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
