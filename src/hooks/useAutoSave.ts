import { useEffect, useRef, useCallback, useState } from 'react';

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  /** Content to auto-save */
  content: string;
  /** Save function */
  onSave: (content: string) => Promise<void>;
  /** Auto-save interval in ms (default: 30000 = 30s) */
  interval?: number;
  /** Whether auto-save is enabled */
  enabled?: boolean;
}

export interface UseAutoSaveResult {
  status: SaveStatus;
  /** Trigger an immediate save (for Cmd+S or before switching files) */
  save: () => Promise<void>;
  /** Whether IME composition is active (pause auto-save) */
  setComposing: (v: boolean) => void;
  /** Whether there are unsaved changes */
  isDirty: boolean;
}

export function useAutoSave({
  content,
  onSave,
  interval = 30_000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveResult {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const composingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const lastSavedRef = useRef(content);
  const contentRef = useRef(content);
  const savingRef = useRef(false);

  // Keep contentRef in sync
  contentRef.current = content;

  // Track unsaved state
  const isDirty = content !== lastSavedRef.current;

  // Update status to 'unsaved' when content diverges from last saved
  useEffect(() => {
    if (content !== lastSavedRef.current && status !== 'saving') {
      setStatus('unsaved');
    }
  }, [content, status]);

  const doSave = useCallback(async () => {
    const currentContent = contentRef.current;
    if (currentContent === lastSavedRef.current) return;
    if (savingRef.current) return;

    savingRef.current = true;
    setStatus('saving');
    try {
      await onSave(currentContent);
      lastSavedRef.current = currentContent;
      // Only show 'saved' if content hasn't changed during the save
      if (contentRef.current === currentContent) {
        setStatus('saved');
      } else {
        setStatus('unsaved');
      }
    } catch (_e) {
      setStatus('error');
    } finally {
      savingRef.current = false;
    }
  }, [onSave]);

  // Manual/immediate save (for Cmd+S, file switch, etc.)
  const save = useCallback(async () => {
    await doSave();
  }, [doSave]);

  // Interval-based auto-save (every 30s)
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      // Skip if IME composing
      if (composingRef.current) return;
      void doSave();
    }, interval);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [enabled, interval, doSave]);

  // Reset lastSavedRef when content is loaded externally (file switch)
  // This is detected when content changes and we are in idle/saved state with no user edits
  const prevEnabledRef = useRef(enabled);
  useEffect(() => {
    // When re-enabled (e.g., after file switch), sync the baseline
    if (enabled && !prevEnabledRef.current) {
      lastSavedRef.current = content;
      setStatus('idle');
    }
    prevEnabledRef.current = enabled;
  }, [enabled, content]);

  const setComposing = useCallback((v: boolean) => {
    composingRef.current = v;
  }, []);

  /** Reset the saved baseline (call when loading a new file) */
  // Exposed via isDirty so the parent can check before switching files

  return { status, save, setComposing, isDirty };
}
