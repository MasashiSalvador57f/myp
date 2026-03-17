import { useState, useCallback, useRef } from 'react';
import type { WritingDirection } from '@/types';
import { useCharacterCount } from './useCharacterCount';
import { useWritingMode } from './useWritingMode';
import { useAutoSave } from './useAutoSave';

export interface EditorConfig {
  charsPerLine: number;
  fontFamily: string;
  fontSize: number;
  direction: WritingDirection;
}

const DEFAULT_CONFIG: EditorConfig = {
  charsPerLine: 40,
  fontFamily: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif',
  fontSize: 16,
  direction: 'vertical',
};

interface UseEditorOptions {
  initialContent?: string;
  initialConfig?: Partial<EditorConfig>;
  onSave?: (content: string) => Promise<void>;
}

export function useEditor({
  initialContent = '',
  initialConfig,
  onSave,
}: UseEditorOptions = {}) {
  const [content, setContent] = useState(initialContent);
  const [config, setConfig] = useState<EditorConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const writingMode = useWritingMode(config.direction);
  const charCount = useCharacterCount(content);

  const saveFn = useCallback(
    async (text: string) => {
      if (onSave) await onSave(text);
    },
    [onSave],
  );

  const autoSave = useAutoSave({
    content,
    onSave: saveFn,
    enabled: !!onSave,
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [],
  );

  const updateConfig = useCallback((partial: Partial<EditorConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const setCharsPerLine = useCallback(
    (n: number) => updateConfig({ charsPerLine: n }),
    [updateConfig],
  );

  const setFontFamily = useCallback(
    (f: string) => updateConfig({ fontFamily: f }),
    [updateConfig],
  );

  const setFontSize = useCallback(
    (s: number) => updateConfig({ fontSize: s }),
    [updateConfig],
  );

  return {
    content,
    setContent,
    config,
    updateConfig,
    setCharsPerLine,
    setFontFamily,
    setFontSize,
    textareaRef,
    writingMode,
    charCount,
    autoSave,
    handleChange,
  };
}
