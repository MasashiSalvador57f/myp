import { useEffect, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useEditorStore } from '@/stores/editorStore';

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

  // Keyboard shortcuts for panel toggling
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + B: toggle left sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleLeftSidebar();
      }
      // Cmd/Ctrl + J: toggle right panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        toggleRightSidebar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLeftSidebar, toggleRightSidebar]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'var(--bg-primary)' }}>
      {/* Toolbar */}
      {toolbar}

      {/* Main content: 3-column layout */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left sidebar - file list */}
        <Box
          component="aside"
          sx={{
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'var(--bg-secondary)',
            transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            width: leftSidebarOpen ? 220 : 0,
          }}
          aria-hidden={!leftSidebarOpen}
        >
          {leftSidebar}
        </Box>

        {/* Center editor */}
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          {editor}
        </Box>

        {/* Right panel - AI/materials */}
        {rightPanel && (
          <Box
            component="aside"
            sx={{
              flexShrink: 0,
              borderLeft: '1px solid',
              borderColor: 'divider',
              bgcolor: 'var(--bg-secondary)',
              transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              width: rightSidebarOpen ? 320 : 0,
            }}
            aria-hidden={!rightSidebarOpen}
          >
            <Box sx={{ width: 320, height: '100%' }}>
              {rightPanel}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
