import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: 0,
  sm: 1.5,
  md: 2.5,
  lg: 3,
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, padding = 'md', children, className = '', onClick, ...props },
  ref,
) {
  return (
    <MuiCard
      ref={ref}
      variant="outlined"
      className={className}
      onClick={onClick}
      sx={{
        p: paddingMap[padding],
        cursor: interactive ? 'pointer' : 'default',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        ...(interactive && {
          '&:hover': {
            boxShadow: 'var(--shadow-sm)',
            borderColor: 'var(--border-default)',
          },
        }),
      }}
      {...(props as React.ComponentPropsWithoutRef<typeof MuiCard>)}
    >
      {children}
    </MuiCard>
  );
});

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, action, className = '', ...props }: CardHeaderProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={1.5}
      className={className}
      {...props}
    >
      <Typography variant="h3" sx={{ color: 'text.primary', fontWeight: 500, fontSize: '1rem' }}>
        {title}
      </Typography>
      {action}
    </Box>
  );
}

export function CardContent({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <MuiCardContent
      className={className}
      sx={{ p: 0, '&:last-child': { pb: 0 }, color: 'text.secondary', fontSize: '0.875rem' }}
      {...(props as React.ComponentPropsWithoutRef<typeof MuiCardContent>)}
    >
      {children}
    </MuiCardContent>
  );
}
