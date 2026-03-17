import { create } from 'zustand';
import type { WritingDirection, ManuscriptFile } from '@/types';

interface EditorState {
  // --- Project & file context ---
  projectId: string | null;
  currentFile: ManuscriptFile | null;
  files: ManuscriptFile[];

  // --- Editor settings ---
  direction: WritingDirection;
  charsPerLine: number;
  fontFamily: string;
  fontSize: number;

  // --- Editor content ---
  content: string;
  isDirty: boolean;

  // --- Sidebar state ---
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;

  // --- Actions ---
  setProjectId: (id: string | null) => void;
  setFiles: (files: ManuscriptFile[]) => void;
  setCurrentFile: (file: ManuscriptFile | null) => void;
  setContent: (content: string) => void;
  markClean: () => void;
  setDirection: (d: WritingDirection) => void;
  toggleDirection: () => void;
  setCharsPerLine: (n: number) => void;
  setFontFamily: (f: string) => void;
  setFontSize: (s: number) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  projectId: null,
  currentFile: null,
  files: [],
  direction: 'vertical',
  charsPerLine: 40,
  fontFamily: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif',
  fontSize: 16,
  content: '',
  isDirty: false,
  leftSidebarOpen: true,
  rightSidebarOpen: false,

  setProjectId: (id) => set({ projectId: id }),
  setFiles: (files) => set({ files }),
  setCurrentFile: (file) => set({ currentFile: file }),
  setContent: (content) => set({ content, isDirty: true }),
  markClean: () => set({ isDirty: false }),
  setDirection: (d) => set({ direction: d }),
  toggleDirection: () =>
    set((s) => ({
      direction: s.direction === 'vertical' ? 'horizontal' : 'vertical',
    })),
  setCharsPerLine: (n) => set({ charsPerLine: n }),
  setFontFamily: (f) => set({ fontFamily: f }),
  setFontSize: (s) => set({ fontSize: s }),
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightSidebar: () =>
    set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
}));
