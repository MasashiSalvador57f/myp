import { useEffect, type ReactNode } from 'react';
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
    <div className="flex flex-col h-screen bg-[var(--bg-primary)]">
      {/* Toolbar */}
      {toolbar}

      {/* Main content: 3-column layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar - file list */}
        <aside
          className={[
            'shrink-0 border-r border-r-[var(--border-subtle)] bg-[var(--bg-secondary)]',
            'transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-default)]',
            'overflow-hidden',
          ].join(' ')}
          style={{ width: leftSidebarOpen ? '220px' : '0px' }}
          aria-hidden={!leftSidebarOpen}
        >
          {leftSidebar}
        </aside>

        {/* Center editor */}
        <main className="flex-1 min-w-0">{editor}</main>

        {/* Right panel - AI/materials */}
        {rightPanel && (
          <aside
            className={[
              'shrink-0 border-l border-l-[var(--border-subtle)] bg-[var(--bg-secondary)]',
              'transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-default)]',
              'overflow-hidden',
            ].join(' ')}
            style={{ width: rightSidebarOpen ? '320px' : '0px' }}
            aria-hidden={!rightSidebarOpen}
          >
            <div className="w-[320px] h-full flex flex-col">
              <div className="flex items-center justify-between h-12 px-4 border-b border-b-[var(--border-subtle)] shrink-0">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  AI相談
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-xs text-[var(--text-tertiary)]">
                  AI相談パネル（実装予定）
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
