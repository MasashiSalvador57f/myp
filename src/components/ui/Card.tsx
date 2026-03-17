import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover shadow + border effect */
  interactive?: boolean;
  /** Optional padding override. Defaults to p-5 (20px) */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, padding = 'md', children, className = '', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]',
        paddingStyles[padding],
        interactive &&
          'cursor-pointer transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)] hover:shadow-[var(--shadow-sm)] hover:border-[var(--border-default)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
});

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between mb-3 ${className}`}
      {...props}
    >
      <h3 className="text-[var(--text-primary)] font-medium text-base">{title}</h3>
      {action}
    </div>
  );
}

export function CardContent({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-[var(--text-secondary)] text-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
