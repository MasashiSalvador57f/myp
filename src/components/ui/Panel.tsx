import { type HTMLAttributes, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
  const borderSx = {
    left: { borderLeft: '1px solid', borderColor: 'divider' },
    right: { borderRight: '1px solid', borderColor: 'divider' },
    none: {},
  }[borderEdge];

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
        height: '100%',
        ...borderSx,
      }}
      {...props}
    >
      {showHeader && (title || headerAction) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 48,
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          {title && (
            <Typography variant="body1" fontWeight={500} color="text.primary" noWrap>
              {title}
            </Typography>
          )}
          {headerAction}
        </Box>
      )}
      <Box sx={{ flex: 1, overflowY: 'auto' }} className="scrollbar-on-hover">
        {children}
      </Box>
    </Box>
  );
}
