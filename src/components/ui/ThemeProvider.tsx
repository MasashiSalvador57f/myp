import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createDarkTheme, createLightTheme } from '../../styles/mui-theme';
import { getThemePreset } from '../../styles/theme-presets';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  colorPreset: string;
  setColorPreset: (preset: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'mypwriter-theme';
const PRESET_STORAGE_KEY = 'mypwriter-color-preset';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return 'dark'; // Dark mode is primary
}

function getInitialPreset(): string {
  if (typeof window === 'undefined') return 'default';
  return localStorage.getItem(PRESET_STORAGE_KEY) ?? 'default';
}

/** Apply CSS custom properties for the active color preset */
function applyCssVariables(theme: Theme, presetId: string) {
  const preset = getThemePreset(presetId);
  const c = preset.colors;
  const root = document.documentElement;

  if (theme === 'dark') {
    root.style.setProperty('--accent-primary', c.primaryDark);
    root.style.setProperty('--accent-hover', c.primaryDarkLight);
    root.style.setProperty('--accent-active', c.primaryDarkDark);
    root.style.setProperty('--accent-subtle', c.accentSubtleDark);
    root.style.setProperty('--text-accent', c.primaryDark);
    root.style.setProperty('--border-focus', c.primaryDark);
  } else {
    root.style.setProperty('--accent-primary', c.primaryLight);
    root.style.setProperty('--accent-hover', c.primaryLightDark);
    root.style.setProperty('--accent-active', c.primaryLightLight);
    root.style.setProperty('--accent-subtle', c.accentSubtleLight);
    root.style.setProperty('--text-accent', c.primaryLight);
    root.style.setProperty('--border-focus', c.primaryLight);
  }

  // Minimal preset — hide borders and shadows
  if (preset.minimal) {
    root.style.setProperty('--border-subtle', 'transparent');
    root.style.setProperty('--border-default', 'transparent');
    root.style.setProperty('--shadow-sm', 'none');
    root.style.setProperty('--shadow-md', 'none');
    root.style.setProperty('--shadow-lg', 'none');
    root.style.setProperty('--shadow-xl', 'none');
  } else {
    // Restore default values based on theme
    root.style.removeProperty('--border-subtle');
    root.style.removeProperty('--border-default');
    root.style.removeProperty('--shadow-sm');
    root.style.removeProperty('--shadow-md');
    root.style.removeProperty('--shadow-lg');
    root.style.removeProperty('--shadow-xl');
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme ?? getInitialTheme);
  const [colorPreset, setColorPresetState] = useState<string>(getInitialPreset);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const setColorPreset = useCallback((preset: string) => {
    setColorPresetState(preset);
    localStorage.setItem(PRESET_STORAGE_KEY, preset);
  }, []);

  // Set data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply CSS variables whenever theme or preset changes
  useEffect(() => {
    applyCssVariables(theme, colorPreset);
  }, [theme, colorPreset]);

  // Respect system preference changes (only if no stored preference)
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setThemeState(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const muiTheme = useMemo(
    () => (theme === 'dark' ? createDarkTheme(colorPreset) : createLightTheme(colorPreset)),
    [theme, colorPreset],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, colorPreset, setColorPreset }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
