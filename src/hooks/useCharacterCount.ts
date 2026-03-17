import { useMemo } from 'react';

/** Count characters excluding newlines and control characters */
function countCharacters(text: string): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Skip newlines (LF, CR) and control characters (0x00-0x1F except tab)
    if (code === 0x0a || code === 0x0d) continue;
    if (code < 0x20 && code !== 0x09) continue;
    count++;
  }
  return count;
}

/** Count characters per line */
function countPerLine(text: string): number[] {
  return text.split('\n').map((line) => countCharacters(line));
}

export interface CharacterCountResult {
  /** Total character count (excluding newlines) */
  total: number;
  /** Character count per line */
  perLine: number[];
  /** Total line count */
  lineCount: number;
}

export function useCharacterCount(text: string): CharacterCountResult {
  return useMemo(() => {
    const perLine = countPerLine(text);
    return {
      total: perLine.reduce((sum, n) => sum + n, 0),
      perLine,
      lineCount: perLine.length,
    };
  }, [text]);
}
