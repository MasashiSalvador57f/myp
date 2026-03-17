import { type HTMLAttributes, type ReactNode } from 'react';
import MuiAppBar from '@mui/material/AppBar';
import MuiToolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

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
}: ToolbarProps) {
  return (
    <MuiAppBar
      position="static"
      color="default"
      className={className}
      sx={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'none',
        userSelect: 'none',
      }}
    >
      <MuiToolbar variant="dense" sx={{ minHeight: '48px !important', px: 2 }}>
        {children ?? (
          <>
            <Box display="flex" alignItems="center" gap={1} minWidth={0}>
              {left}
            </Box>
            <Box flex={1} display="flex" alignItems="center" justifyContent="center" minWidth={0} px={2}>
              {center}
            </Box>
            <Box display="flex" alignItems="center" gap={0.5} minWidth={0}>
              {right}
            </Box>
          </>
        )}
      </MuiToolbar>
    </MuiAppBar>
  );
}

// --- Toolbar Divider ---

export function ToolbarDivider({ className = '' }: { className?: string }) {
  return (
    <Divider
      orientation="vertical"
      flexItem
      className={className}
      sx={{ mx: 0.5, my: 1 }}
    />
  );
}

// --- Status Bar (bottom bar for editor) ---

interface StatusBarProps extends HTMLAttributes<HTMLDivElement> {}

export function StatusBar({ children, className = '', ...props }: StatusBarProps) {
  return (
    <Box
      component="footer"
      className={className}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 28,
        px: 2,
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.6875rem',
        color: 'text.disabled',
        userSelect: 'none',
        flexShrink: 0,
        gap: 1.5,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
