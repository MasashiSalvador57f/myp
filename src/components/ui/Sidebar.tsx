import { type ReactNode, type HTMLAttributes } from 'react';

interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Width when expanded (CSS value) */
  width?: string;
  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
  /** Which side: affects border placement */
  side?: 'left' | 'right';
  /** Header content */
  header?: ReactNode;
  /** Footer content (sticks to bottom) */
  footer?: ReactNode;
}

export function Sidebar({
  width = '200px',
  collapsed = false,
  side = 'left',
  header,
  footer,
  children,
  className = '',
  ...props
}: SidebarProps) {
  const borderClass = side === 'left'
    ? 'border-r border-r-[var(--border-subtle)]'
    : 'border-l border-l-[var(--border-subtle)]';

  return (
    <aside
      className={[
        'flex flex-col bg-[var(--bg-secondary)] h-full shrink-0 overflow-hidden',
        'transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-default)]',
        borderClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: collapsed ? '0px' : width }}
      aria-hidden={collapsed}
      {...props}
    >
      {header && (
        <div className="flex items-center h-12 px-4 border-b border-b-[var(--border-subtle)] shrink-0">
          {header}
        </div>
      )}
      <nav className="flex-1 overflow-y-auto scrollbar-on-hover py-2">
        {children}
      </nav>
      {footer && (
        <div className="border-t border-t-[var(--border-subtle)] p-3 shrink-0">
          {footer}
        </div>
      )}
    </aside>
  );
}

// --- Sidebar Item ---

interface SidebarItemProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  active?: boolean;
  /** Right-side badge or metadata */
  trailing?: ReactNode;
}

export function SidebarItem({
  icon,
  active = false,
  trailing,
  children,
  className = '',
  ...props
}: SidebarItemProps) {
  return (
    <button
      className={[
        'flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left rounded-[var(--radius-md)] mx-1',
        'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]',
        active
          ? 'bg-[var(--bg-active)] text-[var(--text-primary)] font-medium'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon && <span className="shrink-0 w-4 h-4">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {trailing && (
        <span className="shrink-0 text-xs text-[var(--text-tertiary)]">{trailing}</span>
      )}
    </button>
  );
}
