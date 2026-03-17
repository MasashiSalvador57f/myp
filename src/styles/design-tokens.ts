// ============================================================================
// MyPWriter Design Tokens
// A calm, focused design system inspired by Japanese writing aesthetics
// ============================================================================

// --- Color Palette ---

export const colors = {
  // Primary: Deep indigo/navy — calm, sophisticated, authoritative
  primary: {
    50: '#e8e9f0',
    100: '#c5c7d9',
    200: '#9fa2c0',
    300: '#7a7ea7',
    400: '#5d6294',
    500: '#414781',
    600: '#3b4079',
    700: '#32376e',
    800: '#2a2e64',
    900: '#1a1b2e',
    950: '#121320',
  },

  // Accent: Warm amber/gold — inspired by traditional ink and washi paper
  accent: {
    50: '#fdf6ee',
    100: '#f9e8d0',
    200: '#f3d0a0',
    300: '#ecb56b',
    400: '#d4a574',
    500: '#c48a4a',
    600: '#b6733a',
    700: '#975b31',
    800: '#7b4a2d',
    900: '#653d27',
    950: '#371e13',
  },

  // Neutral: Warm-tinted grays for text and surfaces
  neutral: {
    0: '#ffffff',
    50: '#faf8f5',    // washi paper white
    100: '#f2efe9',
    200: '#e5e1da',
    300: '#d1ccc3',
    400: '#b0a99e',
    500: '#918a7e',
    600: '#756e63',
    700: '#5c5650',
    800: '#3d3a36',
    850: '#2a2825',
    900: '#1e1c1a',
    925: '#171614',
    950: '#0f1017',   // deep background
  },

  // Semantic colors — muted, never jarring
  semantic: {
    success: {
      light: '#4a9e6e',
      dark: '#5db87e',
      bg: {
        light: '#eef7f1',
        dark: 'rgba(74, 158, 110, 0.12)',
      },
    },
    warning: {
      light: '#c49a3a',
      dark: '#d4aa4a',
      bg: {
        light: '#fdf6e8',
        dark: 'rgba(196, 154, 58, 0.12)',
      },
    },
    error: {
      light: '#c45a5a',
      dark: '#d47070',
      bg: {
        light: '#fdf0f0',
        dark: 'rgba(196, 90, 90, 0.12)',
      },
    },
    info: {
      light: '#5a8ec4',
      dark: '#70a4d4',
      bg: {
        light: '#eef4fb',
        dark: 'rgba(90, 142, 196, 0.12)',
      },
    },
  },
} as const;

// --- Theme Tokens ---

export const themes = {
  dark: {
    bg: {
      primary: colors.neutral[950],     // #0f1017 — main background
      secondary: colors.neutral[925],   // #171614 — sidebar, panels
      tertiary: colors.neutral[900],    // #1e1c1a — elevated surfaces
      elevated: colors.neutral[850],    // #2a2825 — cards, modals
      hover: 'rgba(255, 255, 255, 0.04)',
      active: 'rgba(255, 255, 255, 0.07)',
      overlay: 'rgba(0, 0, 0, 0.6)',
    },
    text: {
      primary: '#e8e5e0',              // warm off-white, not pure white
      secondary: '#a09a90',
      tertiary: '#706a60',
      disabled: '#504c46',
      inverse: colors.neutral[950],
      accent: colors.accent[400],
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.06)',
      default: 'rgba(255, 255, 255, 0.10)',
      strong: 'rgba(255, 255, 255, 0.16)',
      focus: colors.accent[400],
    },
    accent: {
      primary: colors.accent[400],     // #d4a574
      hover: colors.accent[300],
      active: colors.accent[500],
      subtle: 'rgba(212, 165, 116, 0.12)',
    },
  },

  light: {
    bg: {
      primary: colors.neutral[50],     // #faf8f5 — washi paper
      secondary: colors.neutral[100],  // #f2efe9 — sidebar
      tertiary: colors.neutral[0],     // #ffffff — cards
      elevated: colors.neutral[0],
      hover: 'rgba(0, 0, 0, 0.03)',
      active: 'rgba(0, 0, 0, 0.06)',
      overlay: 'rgba(0, 0, 0, 0.4)',
    },
    text: {
      primary: '#2a2520',              // warm dark, not pure black
      secondary: '#6b6560',
      tertiary: '#9b9590',
      disabled: '#c5c0bb',
      inverse: colors.neutral[50],
      accent: colors.accent[600],
    },
    border: {
      subtle: 'rgba(0, 0, 0, 0.05)',
      default: 'rgba(0, 0, 0, 0.10)',
      strong: 'rgba(0, 0, 0, 0.18)',
      focus: colors.accent[600],
    },
    accent: {
      primary: colors.accent[600],     // #b6733a
      hover: colors.accent[700],
      active: colors.accent[500],
      subtle: 'rgba(182, 115, 58, 0.10)',
    },
  },
} as const;

// --- Spacing Scale (4px base) ---

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

// --- Border Radius Scale ---

export const radius = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const;

// --- Shadow Scale ---

export const shadows = {
  dark: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 2px 8px rgba(0, 0, 0, 0.35)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.4)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.5)',
    inner: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
  },
  light: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 2px 8px rgba(0, 0, 0, 0.08)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.10)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.14)',
    inner: 'inset 0 1px 2px rgba(0, 0, 0, 0.06)',
  },
} as const;

// --- Animation / Transition Tokens ---

export const transitions = {
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',    // ease-in-out
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// --- Z-Index Scale ---

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
} as const;

// --- Breakpoints ---

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
