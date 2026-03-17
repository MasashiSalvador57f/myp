import { type ReactNode, type HTMLAttributes } from 'react';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

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
  const borderSx = side === 'left'
    ? { borderRight: '1px solid', borderColor: 'divider' }
    : { borderLeft: '1px solid', borderColor: 'divider' };

  return (
    <Box
      component="aside"
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
        height: '100%',
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        width: collapsed ? '0px' : width,
        ...borderSx,
      }}
      aria-hidden={collapsed}
      {...props}
    >
      {header && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: 48,
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          {header}
        </Box>
      )}
      <Box
        component="nav"
        sx={{ flex: 1, overflowY: 'auto', py: 1 }}
        className="scrollbar-on-hover"
      >
        {children}
      </Box>
      {footer && (
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 1.5,
            flexShrink: 0,
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
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
    <ListItemButton
      selected={active}
      className={className}
      sx={{
        mx: 0.5,
        borderRadius: 'var(--radius-md)',
        py: 0.75,
        px: 1.5,
        minHeight: 'auto',
        '&.Mui-selected': {
          backgroundColor: 'var(--bg-active)',
        },
        '&.Mui-selected:hover': {
          backgroundColor: 'var(--bg-active)',
        },
      }}
      {...(props as React.ComponentPropsWithoutRef<typeof ListItemButton>)}
    >
      {icon && (
        <ListItemIcon sx={{ minWidth: 28, '& > *': { width: 16, height: 16 } }}>
          {icon}
        </ListItemIcon>
      )}
      <ListItemText
        primary={children}
        primaryTypographyProps={{
          noWrap: true,
          fontSize: '0.875rem',
          fontWeight: active ? 500 : 400,
        }}
      />
      {trailing && (
        <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
          {trailing}
        </Typography>
      )}
    </ListItemButton>
  );
}
