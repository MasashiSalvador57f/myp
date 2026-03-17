import { useCallback, useEffect, useRef, type CSSProperties } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useCharacterCount } from '@/hooks/useCharacterCount';
import { useAutoSave, type SaveStatus } from '@/hooks/useAutoSave';

interface EditorProps {
  onSave?: (content: string) => Promise<void>;
}

export function Editor({ onSave }: EditorProps) {
  const {
    content,
    setContent,
    markClean,
    direction,
    charsPerLine,
    fontFamily,
    fontSize,
  } = useEditorStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editableDivRef = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);
  /** Track whether the latest content change came from user input (not external) */
  const isUserInputRef = useRef(false);
  const charCount = useCharacterCount(content);

  const saveFn = useCallback(
    async (text: string) => {
      if (onSave) {
        await onSave(text);
        markClean();
      }
    },
    [onSave, markClean],
  );

  const autoSave = useAutoSave({
    content,
    onSave: saveFn,
    interval: 30_000,
    enabled: !!onSave,
  });

  // Cmd+S / Ctrl+S: manual save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        void autoSave.save();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [autoSave]);

  // Warn before closing if there are unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (autoSave.isDirty) {
        e.preventDefault();
        // Save on unload attempt
        void autoSave.save();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSave]);

  // --- Handlers for horizontal mode (textarea) ---

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [setContent],
  );

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
    autoSave.setComposing(true);
  }, [autoSave]);

  const handleCompositionEnd = useCallback(() => {
    composingRef.current = false;
    autoSave.setComposing(false);
  }, [autoSave]);

  // --- Handlers for vertical mode (contentEditable div) ---

  /** Extract plain text from contentEditable div */
  const getEditableText = useCallback((): string => {
    const el = editableDivRef.current;
    if (!el) return '';
    // innerText preserves line breaks from <br> / block elements
    return el.innerText;
  }, []);

  const handleEditableInput = useCallback(() => {
    if (composingRef.current) return;
    isUserInputRef.current = true;
    const text = getEditableText();
    setContent(text);
  }, [setContent, getEditableText]);

  const handleEditableCompositionStart = useCallback(() => {
    composingRef.current = true;
    autoSave.setComposing(true);
  }, [autoSave]);

  const handleEditableCompositionEnd = useCallback(() => {
    composingRef.current = false;
    autoSave.setComposing(false);
    // After composition ends, sync content
    isUserInputRef.current = true;
    const text = getEditableText();
    setContent(text);
  }, [autoSave, setContent, getEditableText]);

  /** Paste: force plain text only */
  const handleEditablePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    },
    [],
  );

  /** Prevent rich content from being inserted (e.g. drag-and-drop) */
  const handleEditableBeforeInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const inputEvent = e as unknown as InputEvent;
      // Block insertFromDrop of HTML, etc. We only allow plain text types.
      if (
        inputEvent.inputType === 'insertFromDrop' &&
        inputEvent.dataTransfer
      ) {
        const hasHtml = inputEvent.dataTransfer.types.includes('text/html');
        if (hasHtml) {
          e.preventDefault();
          const text = inputEvent.dataTransfer.getData('text/plain');
          if (text) {
            document.execCommand('insertText', false, text);
          }
        }
      }
    },
    [],
  );

  /**
   * Sync external content changes (file switch, undo from outside, etc.)
   * into the contentEditable div. Skip if the change came from user input
   * to avoid clobbering the cursor position.
   */
  useEffect(() => {
    if (isUserInputRef.current) {
      // This content update was caused by our own input handler; don't touch the DOM.
      isUserInputRef.current = false;
      return;
    }
    const el = editableDivRef.current;
    if (!el) return;
    // Only update if actually different (avoid unnecessary DOM writes)
    if (el.innerText !== content) {
      el.innerText = content;
    }
  }, [content]);

  const isVertical = direction === 'vertical';

  // lineHeight は整数pxに丸めてカーソル位置ズレを防ぐ
  const lineHeightPx = Math.round(fontSize * (isVertical ? 1.7 : 1.8));

  const editorBaseStyle: CSSProperties = {
    fontFamily,
    fontSize: `${fontSize}px`,
    lineHeight: `${lineHeightPx}px`,
    letterSpacing: 'normal',
    padding: '8px',
    fontFeatureSettings: 'normal',
    wordBreak: 'break-all',
  };

  const textareaStyle: CSSProperties = {
    ...editorBaseStyle,
    ...(isVertical
      ? {
          writingMode: 'vertical-rl',
          textOrientation: 'mixed' as const,
          height: `${charsPerLine * fontSize}px`,
          width: 'auto',
          minWidth: '100%',
        }
      : {
          writingMode: 'horizontal-tb',
          width: `${charsPerLine * fontSize}px`,
          maxWidth: '100%',
        }),
  };

  const editableDivStyle: CSSProperties = {
    ...editorBaseStyle,
    writingMode: 'vertical-rl',
    textOrientation: 'mixed' as const,
    height: `${charsPerLine * fontSize}px`,
    width: 'auto',
    minWidth: '100%',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Editor area */}
      <div
        className={[
          'flex-1 overflow-auto scrollbar-on-hover',
          isVertical ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto',
        ].join(' ')}
      >
        <div
          className={[
            isVertical
              ? 'inline-flex items-start p-8'
              : 'h-full flex justify-center p-8',
          ].join(' ')}
          style={isVertical ? { minWidth: '100%', minHeight: '100%' } : undefined}
        >
          {isVertical ? (
            <div
              ref={editableDivRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditableInput}
              onCompositionStart={handleEditableCompositionStart}
              onCompositionEnd={handleEditableCompositionEnd}
              onPaste={handleEditablePaste}
              onBeforeInput={handleEditableBeforeInput}
              spellCheck={false}
              className={[
                'editor-editable',
                'bg-transparent text-[var(--text-primary)] resize-none',
                'outline-none border-none',
              ].join(' ')}
              style={editableDivStyle}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              spellCheck={false}
              className={[
                'editor-textarea',
                'bg-transparent text-[var(--text-primary)] resize-none',
                'outline-none border-none',
                'placeholder:text-[var(--text-tertiary)]',
              ].join(' ')}
              style={textareaStyle}
              placeholder="ここに本文を入力..."
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <EditorStatusBar
        charCount={charCount.total}
        lineCount={charCount.lineCount}
        saveStatus={autoSave.status}
      />
    </div>
  );
}

function EditorStatusBar({
  charCount,
  lineCount,
  saveStatus,
}: {
  charCount: number;
  lineCount: number;
  saveStatus: SaveStatus;
}) {
  const statusText: Record<SaveStatus, string> = {
    idle: '',
    unsaved: '未保存の変更あり',
    saving: '保存中...',
    saved: '保存済み',
    error: '保存エラー',
  };

  const statusColor: Record<SaveStatus, string> = {
    idle: '',
    unsaved: 'text-[var(--text-tertiary)]',
    saving: 'text-[var(--info)]',
    saved: 'text-[var(--success)]',
    error: 'text-[var(--error)]',
  };

  return (
    <footer
      className={[
        'flex items-center h-7 px-4 bg-[var(--bg-secondary)]',
        'border-t border-t-[var(--border-subtle)]',
        'text-[0.6875rem] text-[var(--text-tertiary)]',
        'select-none shrink-0 gap-4',
      ].join(' ')}
    >
      <span>{charCount.toLocaleString()} 文字</span>
      <span>{lineCount} 行</span>
      {statusText[saveStatus] && (
        <span className={`ml-auto ${statusColor[saveStatus]}`}>
          {statusText[saveStatus]}
        </span>
      )}
    </footer>
  );
}
