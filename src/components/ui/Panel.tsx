import { type HTMLAttributes, type ReactNode } from 'react';

interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Panel header title */
  title?: ReactNode;
  /** Optional action element in the header (e.g., close button) */
  headerAction?: ReactNode;
  /** Which edge has the border separator */
  borderEdge?: 'left' | 'right' | 'none';
  /** Whether to show the header section */
  showHeader?: boolean;
}

export function Panel({
  title,
  headerAction,
  borderEdge = 'none',
  showHeader = true,
  children,
  className = '',
  ...props
}: PanelProps) {
  const borderClass = {
    left: 'border-l border-l-[var(--border-subtle)]',
    right: 'border-r border-r-[var(--border-subtle)]',
    none: '',
  }[borderEdge];

  return (
    <div
      className={[
        'flex flex-col bg-[var(--bg-secondary)] h-full',
        borderClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {showHeader && (title || headerAction) && (
        <div className="flex items-center justify-between h-12 px-4 border-b border-b-[var(--border-subtle)] shrink-0">
          {title && (
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {title}
            </span>
          )}
          {headerAction}
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-on-hover">{children}</div>
    </div>
  );
}
