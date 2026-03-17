import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent-primary)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)]',
  secondary:
    'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
  danger:
    'bg-[var(--error-bg)] text-[var(--error)] hover:bg-[var(--error)] hover:text-[var(--text-inverse)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-[var(--radius-md)]',
  md: 'h-8 px-3.5 text-[0.8125rem] gap-2 rounded-[var(--radius-md)]',
  lg: 'h-10 px-5 text-sm gap-2 rounded-[var(--radius-lg)]',
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  sm: 'h-7 w-7 rounded-[var(--radius-md)]',
  md: 'h-8 w-8 rounded-[var(--radius-md)]',
  lg: 'h-10 w-10 rounded-[var(--radius-lg)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    icon,
    iconRight,
    loading,
    disabled,
    children,
    className = '',
    ...props
  },
  ref,
) {
  const isIconOnly = icon && !children && !iconRight;
  const sizeClass = isIconOnly ? iconOnlySizeStyles[size] : sizeStyles[size];

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-medium',
        'transition-colors duration-[var(--duration-normal)] ease-[var(--ease-default)]',
        'select-none whitespace-nowrap',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </button>
  );
});
