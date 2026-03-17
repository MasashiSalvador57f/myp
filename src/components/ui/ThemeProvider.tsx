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

/** Apply all CSS custom properties from the active color preset */
function applyCssVariables(theme: Theme, presetId: string) {
  const preset = getThemePreset(presetId);
  const c = theme === 'dark' ? preset.dark : preset.light;
  const root = document.documentElement;

  // 背景
  root.style.setProperty('--bg-primary', c.bgPrimary);
  root.style.setProperty('--bg-secondary', c.bgSecondary);
  root.style.setProperty('--bg-tertiary', c.bgTertiary);
  root.style.setProperty('--bg-elevated', c.bgElevated);
  root.style.setProperty('--bg-hover', c.bgHover);
  root.style.setProperty('--bg-active', c.bgActive);

  // テキスト
  root.style.setProperty('--text-primary', c.textPrimary);
  root.style.setProperty('--text-secondary', c.textSecondary);
  root.style.setProperty('--text-tertiary', c.textTertiary);
  root.style.setProperty('--text-disabled', c.textDisabled);
  root.style.setProperty('--text-accent', c.accentPrimary);

  // ボーダー
  root.style.setProperty('--border-subtle', c.borderSubtle);
  root.style.setProperty('--border-default', c.borderDefault);
  root.style.setProperty('--border-strong', c.borderStrong);
  root.style.setProperty('--border-focus', c.accentPrimary);

  // アクセント
  root.style.setProperty('--accent-primary', c.accentPrimary);
  root.style.setProperty('--accent-hover', c.accentHover);
  root.style.setProperty('--accent-active', c.accentActive);
  root.style.setProperty('--accent-subtle', c.accentSubtle);

  // 影
  root.style.setProperty('--shadow-sm', c.shadowSm);
  root.style.setProperty('--shadow-md', c.shadowMd);
  root.style.setProperty('--shadow-lg', c.shadowLg);
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
