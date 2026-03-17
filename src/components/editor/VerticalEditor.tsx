import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VerticalEditorProps {
  content: string;
  onChange: (content: string) => void;
  onCompositionChange?: (composing: boolean) => void;
  fontFamily: string;
  fontSize: number;
  charsPerLine: number;
  placeholder?: string;
}

interface TextModel {
  text: string;
  cursor: number;
  selection: { start: number; end: number } | null;
}

interface HistoryEntry {
  text: string;
  cursor: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HISTORY_LIMIT = 100;
const COMPOSITION_END_GRACE_MS = 50;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VerticalEditor({
  content,
  onChange,
  onCompositionChange,
  fontFamily,
  fontSize,
  charsPerLine,
  placeholder,
}: VerticalEditorProps) {
  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const compositionEndTimeRef = useRef(0);
  const compositionTextRef = useRef('');
  /** Guard to prevent external content sync from fighting user edits */
  const isInternalChangeRef = useRef(false);

  // --- State ---
  const [model, setModel] = useState<TextModel>(() => ({
    text: content,
    cursor: content.length,
    selection: null,
  }));
  const [compositionText, setCompositionText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // --- Undo / Redo ---
  const historyRef = useRef<HistoryEntry[]>([{ text: content, cursor: content.length }]);
  const historyIndexRef = useRef(0);

  const pushHistory = useCallback((text: string, cursor: number) => {
    const h = historyRef.current;
    const idx = historyIndexRef.current;
    // Truncate any redo entries
    historyRef.current = h.slice(0, idx + 1);
    historyRef.current.push({ text, cursor });
    if (historyRef.current.length > HISTORY_LIMIT) {
      historyRef.current.shift();
    }
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  // --- Derived values ---
  const lineHeightPx = useMemo(() => Math.round(fontSize * 1.7), [fontSize]);

  // Sync external content changes (file switch etc.) into model
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (content !== model.text) {
      setModel({ text: content, cursor: content.length, selection: null });
      historyRef.current = [{ text: content, cursor: content.length }];
      historyIndexRef.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // --- Helpers to mutate model & propagate ---
  const applyModel = useCallback(
    (next: TextModel) => {
      setModel(next);
      if (next.text !== model.text) {
        isInternalChangeRef.current = true;
        onChange(next.text);
        pushHistory(next.text, next.cursor);
      }
    },
    // model.text is used for comparison – safe to include
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, pushHistory, model.text],
  );

  // --- Focus management ---
  const focusTextarea = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  // --- Cursor offset from click ---
  const offsetFromPoint = useCallback((clientX: number, clientY: number): number => {
    const display = displayRef.current;
    if (!display) return 0;
    const spans = display.querySelectorAll<HTMLSpanElement>('span[data-offset]');
    let closest = 0;
    let minDist = Infinity;
    spans.forEach((span) => {
      const rect = span.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      if (dist < minDist) {
        minDist = dist;
        closest = Number(span.dataset.offset ?? 0);
        // If click is after the center of the character (below in vertical), place cursor after it
        if (clientY > cy) {
          closest += 1;
        }
      }
    });
    return closest;
  }, []);

  // --- Position hidden textarea at caret position ---
  const repositionTextarea = useCallback(() => {
    const display = displayRef.current;
    const container = containerRef.current;
    const ta = textareaRef.current;
    if (!display || !container || !ta) return;

    const cursorOffset = model.cursor;
    // Find the span just before cursor (cursor sits between characters)
    const targetOffset = cursorOffset > 0 ? cursorOffset - 1 : 0;
    const span = display.querySelector<HTMLSpanElement>(
      `span[data-offset="${targetOffset}"]`,
    );
    if (!span) {
      // Fallback: top-right of display
      ta.style.top = '8px';
      ta.style.left = '8px';
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    // For vertical-rl: caret is at the left edge of the span column if cursor>0
    // Position textarea to left by 2 column widths so IME popup doesn't overlap
    const caretX = spanRect.left - containerRect.left;
    const caretY =
      cursorOffset > 0
        ? spanRect.bottom - containerRect.top
        : spanRect.top - containerRect.top;

    const offsetX = lineHeightPx * 2;
    ta.style.left = `${Math.max(0, caretX - offsetX)}px`;
    ta.style.top = `${caretY}px`;
  }, [model.cursor, lineHeightPx]);

  useEffect(() => {
    repositionTextarea();
  }, [repositionTextarea]);

  // --- Keyboard handling ---
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (composingRef.current) return;

      const { text, cursor, selection } = model;
      const meta = e.metaKey || e.ctrlKey;

      // --- Undo / Redo ---
      if (meta && e.key === 'z') {
        e.preventDefault();
        const h = historyRef.current;
        if (e.shiftKey) {
          // Redo
          if (historyIndexRef.current < h.length - 1) {
            historyIndexRef.current += 1;
            const entry = h[historyIndexRef.current];
            const next: TextModel = { text: entry.text, cursor: entry.cursor, selection: null };
            setModel(next);
            isInternalChangeRef.current = true;
            onChange(next.text);
          }
        } else {
          // Undo
          if (historyIndexRef.current > 0) {
            historyIndexRef.current -= 1;
            const entry = h[historyIndexRef.current];
            const next: TextModel = { text: entry.text, cursor: entry.cursor, selection: null };
            setModel(next);
            isInternalChangeRef.current = true;
            onChange(next.text);
          }
        }
        return;
      }

      // --- Select All ---
      if (meta && e.key === 'a') {
        e.preventDefault();
        setModel((m) => ({ ...m, selection: { start: 0, end: m.text.length } }));
        return;
      }

      // --- Copy / Cut ---
      if (meta && (e.key === 'c' || e.key === 'x')) {
        if (selection) {
          const selStart = Math.min(selection.start, selection.end);
          const selEnd = Math.max(selection.start, selection.end);
          const selected = text.slice(selStart, selEnd);
          void navigator.clipboard.writeText(selected);
          if (e.key === 'x') {
            e.preventDefault();
            const newText = text.slice(0, selStart) + text.slice(selEnd);
            applyModel({ text: newText, cursor: selStart, selection: null });
          }
        }
        return;
      }

      // --- Paste ---
      if (meta && e.key === 'v') {
        e.preventDefault();
        void navigator.clipboard.readText().then((clipText) => {
          setModel((prev) => {
            const s = prev.selection;
            let newText: string;
            let newCursor: number;
            if (s) {
              const selStart = Math.min(s.start, s.end);
              const selEnd = Math.max(s.start, s.end);
              newText = prev.text.slice(0, selStart) + clipText + prev.text.slice(selEnd);
              newCursor = selStart + clipText.length;
            } else {
              newText = prev.text.slice(0, prev.cursor) + clipText + prev.text.slice(prev.cursor);
              newCursor = prev.cursor + clipText.length;
            }
            isInternalChangeRef.current = true;
            onChange(newText);
            pushHistory(newText, newCursor);
            return { text: newText, cursor: newCursor, selection: null };
          });
        });
        return;
      }

      // --- Enter ---
      if (e.key === 'Enter') {
        // IME変換中、または変換確定直後のEnterは無視する
        if (composingRef.current) return;
        if (Date.now() - compositionEndTimeRef.current < COMPOSITION_END_GRACE_MS) return;
        e.preventDefault();
        if (selection) {
          const selStart = Math.min(selection.start, selection.end);
          const selEnd = Math.max(selection.start, selection.end);
          const newText = text.slice(0, selStart) + '\n' + text.slice(selEnd);
          applyModel({ text: newText, cursor: selStart + 1, selection: null });
        } else {
          const newText = text.slice(0, cursor) + '\n' + text.slice(cursor);
          applyModel({ text: newText, cursor: cursor + 1, selection: null });
        }
        return;
      }

      // --- Backspace ---
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (selection) {
          const selStart = Math.min(selection.start, selection.end);
          const selEnd = Math.max(selection.start, selection.end);
          const newText = text.slice(0, selStart) + text.slice(selEnd);
          applyModel({ text: newText, cursor: selStart, selection: null });
        } else if (cursor > 0) {
          const newText = text.slice(0, cursor - 1) + text.slice(cursor);
          applyModel({ text: newText, cursor: cursor - 1, selection: null });
        }
        return;
      }

      // --- Delete ---
      if (e.key === 'Delete') {
        e.preventDefault();
        if (selection) {
          const selStart = Math.min(selection.start, selection.end);
          const selEnd = Math.max(selection.start, selection.end);
          const newText = text.slice(0, selStart) + text.slice(selEnd);
          applyModel({ text: newText, cursor: selStart, selection: null });
        } else if (cursor < text.length) {
          const newText = text.slice(0, cursor) + text.slice(cursor + 1);
          applyModel({ text: newText, cursor, selection: null });
        }
        return;
      }

      // --- Arrow keys (vertical writing) ---
      // Up = previous char, Down = next char
      // Left = next column (right in document), Right = previous column (left in document)
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        let newCursor = cursor;

        if (e.key === 'ArrowUp') {
          newCursor = Math.max(0, cursor - 1);
        } else if (e.key === 'ArrowDown') {
          newCursor = Math.min(text.length, cursor + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          // Move by ~charsPerLine to simulate column movement
          // Find current position within the current line
          const lines = text.split('\n');
          let offset = 0;
          let lineIdx = 0;
          let posInLine = 0;
          for (let i = 0; i < lines.length; i++) {
            if (cursor <= offset + lines[i].length) {
              lineIdx = i;
              posInLine = cursor - offset;
              break;
            }
            offset += lines[i].length + 1; // +1 for \n
          }

          if (e.key === 'ArrowLeft') {
            // Move to next line (right column in vertical)
            if (lineIdx < lines.length - 1) {
              const nextLineStart = offset + lines[lineIdx].length + 1;
              const nextLineLen = lines[lineIdx + 1].length;
              newCursor = nextLineStart + Math.min(posInLine, nextLineLen);
            }
          } else {
            // ArrowRight: Move to previous line (left column in vertical)
            if (lineIdx > 0) {
              let prevLineStart = 0;
              for (let i = 0; i < lineIdx - 1; i++) {
                prevLineStart += lines[i].length + 1;
              }
              const prevLineLen = lines[lineIdx - 1].length;
              newCursor = prevLineStart + Math.min(posInLine, prevLineLen);
            }
          }
        }

        if (e.shiftKey) {
          // Extend selection
          const anchor = selection ? selection.start : cursor;
          setModel((m) => ({
            ...m,
            cursor: newCursor,
            selection: anchor !== newCursor ? { start: anchor, end: newCursor } : null,
          }));
        } else {
          setModel((m) => ({ ...m, cursor: newCursor, selection: null }));
        }
        return;
      }

      // --- Home / End ---
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const lines = text.split('\n');
        let offset = 0;
        for (let i = 0; i < lines.length; i++) {
          if (cursor <= offset + lines[i].length) {
            const newCursor = e.key === 'Home' ? offset : offset + lines[i].length;
            if (e.shiftKey) {
              const anchor = selection ? selection.start : cursor;
              setModel((m) => ({
                ...m,
                cursor: newCursor,
                selection: anchor !== newCursor ? { start: anchor, end: newCursor } : null,
              }));
            } else {
              setModel((m) => ({ ...m, cursor: newCursor, selection: null }));
            }
            break;
          }
          offset += lines[i].length + 1;
        }
        return;
      }
    },
    [model, applyModel, onChange, pushHistory],
  );

  // --- Composition handling ---
  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
    compositionTextRef.current = '';
    setCompositionText('');
    onCompositionChange?.(true);
    // Clear textarea value for fresh composition
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
  }, [onCompositionChange]);

  const handleCompositionUpdate = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      compositionTextRef.current = e.data;
      setCompositionText(e.data);
    },
    [],
  );

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      composingRef.current = false;
      compositionEndTimeRef.current = Date.now();
      const finalText = e.data;
      compositionTextRef.current = '';
      setCompositionText('');
      onCompositionChange?.(false);

      if (finalText) {
        setModel((prev) => {
          const s = prev.selection;
          let newText: string;
          let newCursor: number;
          if (s) {
            const selStart = Math.min(s.start, s.end);
            const selEnd = Math.max(s.start, s.end);
            newText = prev.text.slice(0, selStart) + finalText + prev.text.slice(selEnd);
            newCursor = selStart + finalText.length;
          } else {
            newText = prev.text.slice(0, prev.cursor) + finalText + prev.text.slice(prev.cursor);
            newCursor = prev.cursor + finalText.length;
          }
          isInternalChangeRef.current = true;
          onChange(newText);
          pushHistory(newText, newCursor);
          return { text: newText, cursor: newCursor, selection: null };
        });
      }

      // Clear textarea
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
    },
    [onChange, onCompositionChange, pushHistory],
  );

  // --- Regular input (non-IME single characters) ---
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (composingRef.current) return;
      const ta = e.currentTarget;
      const inputText = ta.value;
      if (!inputText) return;
      ta.value = '';

      setModel((prev) => {
        const s = prev.selection;
        let newText: string;
        let newCursor: number;
        if (s) {
          const selStart = Math.min(s.start, s.end);
          const selEnd = Math.max(s.start, s.end);
          newText = prev.text.slice(0, selStart) + inputText + prev.text.slice(selEnd);
          newCursor = selStart + inputText.length;
        } else {
          newText = prev.text.slice(0, prev.cursor) + inputText + prev.text.slice(prev.cursor);
          newCursor = prev.cursor + inputText.length;
        }
        isInternalChangeRef.current = true;
        onChange(newText);
        pushHistory(newText, newCursor);
        return { text: newText, cursor: newCursor, selection: null };
      });
    },
    [onChange, pushHistory],
  );

  // --- Mouse handling ---
  const mouseDownRef = useRef(false);
  const anchorOffsetRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const offset = offsetFromPoint(e.clientX, e.clientY);
      mouseDownRef.current = true;
      anchorOffsetRef.current = offset;
      setModel((m) => ({ ...m, cursor: offset, selection: null }));
      focusTextarea();
    },
    [offsetFromPoint, focusTextarea],
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!mouseDownRef.current) return;
      const offset = offsetFromPoint(e.clientX, e.clientY);
      const anchor = anchorOffsetRef.current;
      setModel((m) => ({
        ...m,
        cursor: offset,
        selection: anchor !== offset ? { start: anchor, end: offset } : null,
      }));
    },
    [offsetFromPoint],
  );

  const handleMouseUp = useCallback(() => {
    mouseDownRef.current = false;
    focusTextarea();
  }, [focusTextarea]);

  // --- Display rendering ---
  const displayStyle: CSSProperties = useMemo(
    () => ({
      writingMode: 'vertical-rl',
      textOrientation: 'mixed' as const,
      fontFamily,
      fontSize: `${fontSize}px`,
      lineHeight: `${lineHeightPx}px`,
      letterSpacing: 'normal',
      fontFeatureSettings: 'normal',
      wordBreak: 'break-all',
      whiteSpace: 'pre-wrap',
      height: `${charsPerLine * fontSize}px`,
      width: 'auto',
      minWidth: '100%',
      padding: '8px',
      cursor: 'text',
      position: 'relative' as const,
    }),
    [fontFamily, fontSize, lineHeightPx, charsPerLine],
  );

  const selStart = model.selection
    ? Math.min(model.selection.start, model.selection.end)
    : -1;
  const selEnd = model.selection
    ? Math.max(model.selection.start, model.selection.end)
    : -1;

  const displayContent = useMemo(() => {
    const { text, cursor } = model;
    const paragraphs = text.split('\n');
    const elements: React.ReactNode[] = [];
    let globalOffset = 0;

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const para = paragraphs[pIdx];
      const paraElements: React.ReactNode[] = [];

      // Caret at the very beginning of this paragraph
      if (cursor === globalOffset && isFocused && !composingRef.current) {
        paraElements.push(
          <span key={`caret-${globalOffset}`} className="vertical-editor-caret" />,
        );
      }

      // Composition text insertion at cursor (beginning of para)
      if (
        compositionText &&
        cursor === globalOffset &&
        composingRef.current
      ) {
        paraElements.push(
          <span key={`comp-${globalOffset}`} className="vertical-editor-composition">
            {compositionText}
          </span>,
        );
      }

      for (let i = 0; i < para.length; i++) {
        const offset = globalOffset + i;
        const isSelected = offset >= selStart && offset < selEnd;
        paraElements.push(
          <span
            key={offset}
            data-offset={offset}
            className={isSelected ? 'vertical-editor-selected' : undefined}
          >
            {para[i]}
          </span>,
        );

        // Caret after this character
        if (cursor === offset + 1 && isFocused && !composingRef.current) {
          paraElements.push(
            <span key={`caret-${offset + 1}`} className="vertical-editor-caret" />,
          );
        }

        // Composition text after this character
        if (
          compositionText &&
          cursor === offset + 1 &&
          composingRef.current
        ) {
          paraElements.push(
            <span key={`comp-${offset + 1}`} className="vertical-editor-composition">
              {compositionText}
            </span>,
          );
        }
      }

      // Account for the \n between paragraphs
      globalOffset += para.length;
      if (pIdx < paragraphs.length - 1) {
        globalOffset += 1; // for \n

        // Caret at position right after \n (start of next line) is handled in next iteration
      }

      elements.push(
        <div key={`p-${pIdx}`} style={{ minHeight: `${fontSize}px` }}>
          {paraElements.length > 0 ? paraElements : <br />}
        </div>,
      );
    }

    return elements;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.text, model.cursor, model.selection, compositionText, isFocused, fontSize, selStart, selEnd]);

  // Show placeholder when empty
  const showPlaceholder = model.text.length === 0 && !compositionText;

  return (
    <div
      ref={containerRef}
      className="vertical-editor-container"
      style={{ position: 'relative' }}
    >
      {/* Display Layer */}
      <div
        ref={displayRef}
        className="vertical-editor-display bg-transparent text-[var(--text-primary)]"
        style={displayStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        data-placeholder={placeholder}
      >
        {showPlaceholder && placeholder ? (
          <span style={{ color: 'var(--text-tertiary)', pointerEvents: 'none' }}>
            {placeholder}
          </span>
        ) : (
          displayContent
        )}
      </div>

      {/* Hidden Textarea Proxy */}
      <textarea
        ref={textareaRef}
        className="vertical-editor-hidden-textarea"
        style={{ outline: 'none', WebkitAppearance: 'none', resize: 'none' }}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEnd}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        tabIndex={0}
        aria-label="Vertical text editor input"
      />
    </div>
  );
}
