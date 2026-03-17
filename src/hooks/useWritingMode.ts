import { useCallback, useState } from 'react';
import type { WritingDirection } from '@/types';

export interface UseWritingModeResult {
  direction: WritingDirection;
  toggle: () => void;
  setDirection: (d: WritingDirection) => void;
  isVertical: boolean;
}

export function useWritingMode(
  initial: WritingDirection = 'vertical',
): UseWritingModeResult {
  const [direction, setDirection] = useState<WritingDirection>(initial);

  const toggle = useCallback(() => {
    setDirection((prev) => (prev === 'vertical' ? 'horizontal' : 'vertical'));
  }, []);

  return {
    direction,
    toggle,
    setDirection,
    isVertical: direction === 'vertical',
  };
}
