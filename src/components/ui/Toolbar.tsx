import { type HTMLAttributes, type ReactNode } from 'react';

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Left section (e.g., back button, logo) */
  left?: ReactNode;
  /** Center section (e.g., title, breadcrumbs) */
  center?: ReactNode;
  /** Right section (e.g., actions, settings) */
  right?: ReactNode;
}

export function Toolbar({
  left,
  center,
  right,
  children,
  className = '',
  ...props
}: ToolbarProps) {
  return (
    <header
      className={[
        'flex items-center h-12 px-4 bg-[var(--bg-secondary)]',
        'border-b border-b-[var(--border-subtle)] shrink-0',
        'select-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children ?? (
        <>
          <div className="flex items-center gap-2 min-w-0">{left}</div>
          <div className="flex-1 flex items-center justify-center min-w-0 px-4">
            {center}
          </div>
          <div className="flex items-center gap-1 min-w-0">{right}</div>
        </>
      )}
    </header>
  );
}

// --- Toolbar Divider ---

export function ToolbarDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-px h-5 bg-[var(--border-default)] mx-1 ${className}`}
      role="separator"
      aria-orientation="vertical"
    />
  );
}

// --- Status Bar (bottom bar for editor) ---

interface StatusBarProps extends HTMLAttributes<HTMLDivElement> {}

export function StatusBar({ children, className = '', ...props }: StatusBarProps) {
  return (
    <footer
      className={[
        'flex items-center h-7 px-4 bg-[var(--bg-secondary)]',
        'border-t border-t-[var(--border-subtle)]',
        'text-[0.6875rem] text-[var(--text-tertiary)]',
        'select-none shrink-0 gap-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </footer>
  );
}
