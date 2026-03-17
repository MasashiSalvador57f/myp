import { forwardRef, type ReactNode } from 'react';
import MuiButton from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

const variantMap: Record<ButtonVariant, { muiVariant: MuiButtonProps['variant']; color: MuiButtonProps['color'] }> = {
  primary: { muiVariant: 'contained', color: 'primary' },
  secondary: { muiVariant: 'outlined', color: 'inherit' },
  ghost: { muiVariant: 'text', color: 'inherit' },
  danger: { muiVariant: 'contained', color: 'error' },
};

const sizeMap: Record<ButtonSize, MuiButtonProps['size']> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
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
  const { muiVariant, color } = variantMap[variant];
  const muiSize = sizeMap[size];

  // Icon-only button
  if (isIconOnly) {
    return (
      <IconButton
        ref={ref}
        disabled={disabled || loading}
        color={color}
        size={muiSize}
        className={className}
        sx={{
          ...(variant === 'danger' && {
            color: 'error.main',
            '&:hover': { backgroundColor: 'error.main', color: 'error.contrastText' },
          }),
        }}
        {...(props as React.ComponentPropsWithoutRef<typeof IconButton>)}
      >
        {loading ? <CircularProgress size={16} color="inherit" /> : icon}
      </IconButton>
    );
  }

  return (
    <MuiButton
      ref={ref}
      disabled={disabled || loading}
      variant={muiVariant}
      color={color}
      size={muiSize}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : icon}
      endIcon={iconRight}
      className={className}
      sx={{
        ...(variant === 'ghost' && {
          color: 'text.secondary',
          '&:hover': { color: 'text.primary', backgroundColor: 'action.hover' },
        }),
      }}
      {...(props as React.ComponentPropsWithoutRef<typeof MuiButton>)}
    >
      {children}
    </MuiButton>
  );
});
