import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { getThemePreset } from './theme-presets';

// Shared options for both themes
const sharedOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", sans-serif',
    fontSize: 14,
    h1: { fontWeight: 600, fontSize: '1.5rem' },
    h2: { fontWeight: 600, fontSize: '1.25rem' },
    h3: { fontWeight: 500, fontSize: '1rem' },
    h4: { fontWeight: 500, fontSize: '0.875rem' },
    body1: { fontSize: '0.8125rem', lineHeight: 1.6 },
    body2: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Let globals.css handle most base styles
        body: {
          overflowY: 'hidden',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-md)',
          textTransform: 'none',
          fontWeight: 500,
        },
        sizeSmall: {
          height: 28,
          padding: '0 10px',
          fontSize: '0.75rem',
        },
        sizeMedium: {
          height: 32,
          padding: '0 14px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          height: 40,
          padding: '0 20px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        sizeSmall: {
          width: 28,
          height: 28,
        },
        sizeMedium: {
          width: 32,
          height: 32,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-xl)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default MUI paper gradient
        },
        outlined: {
          borderRadius: 'var(--radius-xl)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 'var(--radius-2xl)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 400,
          minHeight: 40,
          '&.Mui-selected': {
            fontWeight: 500,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '48px !important',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-lg)',
          height: 8,
        },
        bar: {
          borderRadius: 'var(--radius-lg)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-md)',
          fontWeight: 400,
          fontSize: '0.75rem',
        },
      },
    },
    MuiSwitch: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-md)',
          '&.Mui-selected': {
            fontWeight: 500,
          },
        },
      },
    },
  },
};

/** Minimal theme overrides — removes borders and shadows from MUI components */
function getMinimalOverrides(): ThemeOptions['components'] {
  return {
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-xl)',
          border: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
        },
        outlined: {
          borderRadius: 'var(--radius-xl)',
          border: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
        },
        notchedOutline: {
          borderColor: 'transparent',
        },
      },
    },
  };
}

export function createDarkTheme(presetId: string = 'default') {
  const preset = getThemePreset(presetId);
  const c = preset.dark;

  const minimalOverrides = preset.minimal ? getMinimalOverrides() : {};

  return createTheme({
    ...sharedOptions,
    palette: {
      mode: 'dark',
      primary: {
        main: c.accentPrimary,
        light: c.accentHover,
        dark: c.accentActive,
        contrastText: c.bgPrimary,
      },
      secondary: {
        main: '#70a4d4',
        light: '#90bae4',
        dark: '#5a8ec4',
      },
      error: {
        main: '#d47070',
        light: '#e08080',
        dark: '#c45a5a',
      },
      warning: {
        main: '#d4aa4a',
        light: '#e0ba5a',
        dark: '#c49a3a',
      },
      success: {
        main: '#5db87e',
        light: '#6dc88e',
        dark: '#4a9e6e',
      },
      info: {
        main: '#70a4d4',
        light: '#80b4e4',
        dark: '#5a8ec4',
      },
      background: {
        default: c.bgPrimary,
        paper: c.bgElevated,
      },
      text: {
        primary: c.textPrimary,
        secondary: c.textSecondary,
        disabled: c.textDisabled,
      },
      divider: c.borderSubtle,
      action: {
        hover: c.bgHover,
        selected: c.bgActive,
        disabled: 'rgba(255, 255, 255, 0.2)',
        disabledBackground: 'rgba(255, 255, 255, 0.05)',
      },
    },
    components: {
      ...sharedOptions.components,
      MuiCard: {
        ...sharedOptions.components?.MuiCard,
        styleOverrides: {
          root: {
            borderRadius: 'var(--radius-xl)',
            backgroundColor: c.bgElevated,
            borderColor: c.borderSubtle,
          },
        },
      },
      MuiPaper: {
        ...sharedOptions.components?.MuiPaper,
        styleOverrides: {
          ...sharedOptions.components?.MuiPaper?.styleOverrides,
          root: {
            backgroundImage: 'none',
            backgroundColor: c.bgElevated,
          },
          outlined: {
            borderRadius: 'var(--radius-xl)',
            borderColor: c.borderSubtle,
          },
        },
      },
      MuiAppBar: {
        ...sharedOptions.components?.MuiAppBar,
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: c.bgSecondary,
            borderBottom: `1px solid ${c.borderSubtle}`,
          },
        },
      },
      MuiDialog: {
        ...sharedOptions.components?.MuiDialog,
        styleOverrides: {
          paper: {
            borderRadius: 'var(--radius-2xl)',
            backgroundColor: c.bgElevated,
          },
        },
      },
      ...minimalOverrides,
    },
  });
}

export function createLightTheme(presetId: string = 'default') {
  const preset = getThemePreset(presetId);
  const c = preset.light;

  const minimalOverrides = preset.minimal ? getMinimalOverrides() : {};

  return createTheme({
    ...sharedOptions,
    palette: {
      mode: 'light',
      primary: {
        main: c.accentPrimary,
        light: c.accentHover,
        dark: c.accentActive,
        contrastText: c.bgPrimary,
      },
      secondary: {
        main: '#5a8ec4',
        light: '#70a4d4',
        dark: '#4a7eb4',
      },
      error: {
        main: '#c45a5a',
        light: '#d47070',
        dark: '#b44a4a',
      },
      warning: {
        main: '#c49a3a',
        light: '#d4aa4a',
        dark: '#b48a2a',
      },
      success: {
        main: '#4a9e6e',
        light: '#5db87e',
        dark: '#3a8e5e',
      },
      info: {
        main: '#5a8ec4',
        light: '#70a4d4',
        dark: '#4a7eb4',
      },
      background: {
        default: c.bgPrimary,
        paper: c.bgElevated,
      },
      text: {
        primary: c.textPrimary,
        secondary: c.textSecondary,
        disabled: c.textDisabled,
      },
      divider: c.borderSubtle,
      action: {
        hover: c.bgHover,
        selected: c.bgActive,
        disabled: 'rgba(0, 0, 0, 0.2)',
        disabledBackground: 'rgba(0, 0, 0, 0.05)',
      },
    },
    components: {
      ...sharedOptions.components,
      MuiCard: {
        ...sharedOptions.components?.MuiCard,
        styleOverrides: {
          root: {
            borderRadius: 'var(--radius-xl)',
            backgroundColor: c.bgElevated,
            borderColor: c.borderSubtle,
          },
        },
      },
      MuiPaper: {
        ...sharedOptions.components?.MuiPaper,
        styleOverrides: {
          ...sharedOptions.components?.MuiPaper?.styleOverrides,
          root: {
            backgroundImage: 'none',
            backgroundColor: c.bgElevated,
          },
          outlined: {
            borderRadius: 'var(--radius-xl)',
            borderColor: c.borderSubtle,
          },
        },
      },
      MuiAppBar: {
        ...sharedOptions.components?.MuiAppBar,
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: c.bgSecondary,
            borderBottom: `1px solid ${c.borderSubtle}`,
            color: c.textPrimary,
          },
        },
      },
      MuiDialog: {
        ...sharedOptions.components?.MuiDialog,
        styleOverrides: {
          paper: {
            borderRadius: 'var(--radius-2xl)',
            backgroundColor: c.bgElevated,
          },
        },
      },
      ...minimalOverrides,
    },
  });
}

// Keep backward-compatible named exports for any code that imports them directly
export const darkTheme = createDarkTheme('default');
export const lightTheme = createLightTheme('default');
