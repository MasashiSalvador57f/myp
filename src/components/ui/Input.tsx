import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// --- Text Input ---

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, iconLeft, iconRight, className = '', id, type, min, max, value, onChange, onKeyDown, placeholder, disabled, autoFocus, ...props },
  ref,
) {
  const hasError = !!error;

  return (
    <TextField
      inputRef={ref}
      id={id || (label ? label.replace(/\s/g, '-').toLowerCase() : undefined)}
      label={label}
      error={hasError}
      helperText={error || hint}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange as React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>}
      onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLDivElement>}
      disabled={disabled}
      autoFocus={autoFocus}
      fullWidth
      size="small"
      className={className}
      slotProps={{
        input: {
          startAdornment: iconLeft ? (
            <InputAdornment position="start">{iconLeft}</InputAdornment>
          ) : undefined,
          endAdornment: iconRight ? (
            <InputAdornment position="end">{iconRight}</InputAdornment>
          ) : undefined,
          inputProps: {
            min,
            max,
            ...props,
          },
        },
      }}
    />
  );
});

// --- Textarea ---

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className = '', id, value, onChange, placeholder, disabled, rows = 4 },
  ref,
) {
  const hasError = !!error;

  return (
    <TextField
      inputRef={ref}
      id={id || (label ? label.replace(/\s/g, '-').toLowerCase() : undefined)}
      label={label}
      error={hasError}
      helperText={error || hint}
      placeholder={placeholder}
      value={value}
      onChange={onChange as React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>}
      disabled={disabled}
      multiline
      rows={rows}
      fullWidth
      size="small"
      className={className}
    />
  );
});
