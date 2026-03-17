import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

// --- Text Input ---

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, iconLeft, iconRight, className = '', id, ...props },
  ref,
) {
  const inputId = id || (label ? label.replace(/\s/g, '-').toLowerCase() : undefined);
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[var(--text-secondary)] tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {iconLeft && (
          <span className="absolute left-3 text-[var(--text-tertiary)] pointer-events-none">
            {iconLeft}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full h-9 px-3 text-[0.8125rem]',
            'bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
            'border rounded-[var(--radius-md)]',
            'placeholder:text-[var(--text-tertiary)]',
            'transition-colors duration-[var(--duration-normal)] ease-[var(--ease-default)]',
            'focus:outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_2px_var(--bg-primary),0_0_0_4px_var(--border-focus)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError ? 'border-[var(--error)]' : 'border-[var(--border-default)]',
            iconLeft ? 'pl-9' : '',
            iconRight ? 'pr-9' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={hasError || undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 text-[var(--text-tertiary)]">
            {iconRight}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-[var(--text-tertiary)]">
          {hint}
        </p>
      )}
    </div>
  );
});

// --- Textarea ---

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className = '', id, ...props },
  ref,
) {
  const inputId = id || (label ? label.replace(/\s/g, '-').toLowerCase() : undefined);
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[var(--text-secondary)] tracking-wide"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={[
          'w-full px-3 py-2 text-[0.8125rem] min-h-[80px] resize-y',
          'bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
          'border rounded-[var(--radius-md)]',
          'placeholder:text-[var(--text-tertiary)]',
          'transition-colors duration-[var(--duration-normal)] ease-[var(--ease-default)]',
          'focus:outline-none focus:border-[var(--border-focus)] focus:shadow-[0_0_0_2px_var(--bg-primary),0_0_0_4px_var(--border-focus)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          hasError ? 'border-[var(--error)]' : 'border-[var(--border-default)]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={hasError || undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-[var(--text-tertiary)]">
          {hint}
        </p>
      )}
    </div>
  );
});
