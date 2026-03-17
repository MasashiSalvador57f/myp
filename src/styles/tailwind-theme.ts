// ============================================================================
// Tailwind Theme Extensions for MyPWriter
//
// NOTE: This file exports the theme extension object to be spread into
// tailwind.config.ts by the Lead Architect. The designer owns these values.
//
// Usage in tailwind.config.ts:
//   import { themeExtension } from './src/styles/tailwind-theme'
//   export default { theme: { extend: themeExtension } }
// ============================================================================

export const themeExtension = {
  colors: {
    // Semantic CSS variable colors — use as: bg-surface-primary, text-content-primary, etc.
    surface: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      tertiary: 'var(--bg-tertiary)',
      elevated: 'var(--bg-elevated)',
      hover: 'var(--bg-hover)',
      active: 'var(--bg-active)',
      overlay: 'var(--bg-overlay)',
    },
    content: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      tertiary: 'var(--text-tertiary)',
      disabled: 'var(--text-disabled)',
      inverse: 'var(--text-inverse)',
      accent: 'var(--text-accent)',
    },
    edge: {
      subtle: 'var(--border-subtle)',
      default: 'var(--border-default)',
      strong: 'var(--border-strong)',
      focus: 'var(--border-focus)',
    },
    accent: {
      DEFAULT: 'var(--accent-primary)',
      hover: 'var(--accent-hover)',
      active: 'var(--accent-active)',
      subtle: 'var(--accent-subtle)',
    },
    semantic: {
      success: 'var(--success)',
      'success-bg': 'var(--success-bg)',
      warning: 'var(--warning)',
      'warning-bg': 'var(--warning-bg)',
      error: 'var(--error)',
      'error-bg': 'var(--error-bg)',
      info: 'var(--info)',
      'info-bg': 'var(--info-bg)',
    },
  },

  fontFamily: {
    ui: ['Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic UI', 'sans-serif'],
    editor: ['Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', 'MS PMincho', 'serif'],
    mono: ['JetBrains Mono', 'Source Code Pro', 'Noto Sans Mono', 'monospace'],
  },

  fontSize: {
    '2xs': ['0.6875rem', { lineHeight: '1' }],     // 11px
    xs: ['0.75rem', { lineHeight: '1.25rem' }],     // 12px
    sm: ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px — UI default
    base: ['0.875rem', { lineHeight: '1.375rem' }], // 14px
    lg: ['1rem', { lineHeight: '1.5rem' }],          // 16px
    xl: ['1.125rem', { lineHeight: '1.625rem' }],    // 18px
    '2xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '3xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
  },

  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
  },

  boxShadow: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },

  animation: {
    'fade-in': 'fadeIn 200ms ease-out',
    'fade-out': 'fadeOut 200ms ease-out',
    'scale-in': 'scaleIn 200ms ease-out',
    'slide-in-right': 'slideInRight 300ms ease-out',
    'slide-in-left': 'slideInLeft 300ms ease-out',
  },

  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    scaleIn: {
      from: { opacity: '0', transform: 'scale(0.96)' },
      to: { opacity: '1', transform: 'scale(1)' },
    },
    slideInRight: {
      from: { transform: 'translateX(100%)' },
      to: { transform: 'translateX(0)' },
    },
    slideInLeft: {
      from: { transform: 'translateX(-100%)' },
      to: { transform: 'translateX(0)' },
    },
  },

  transitionDuration: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },

  transitionTimingFunction: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  zIndex: {
    dropdown: '10',
    sticky: '20',
    overlay: '30',
    modal: '40',
    popover: '50',
    tooltip: '60',
  },
} as const;

// Custom plugin utilities (for use with Tailwind plugin API)
// The Lead Architect should add these as a plugin in tailwind.config.ts:
//
// plugin(function({ addUtilities }) {
//   addUtilities({
//     '.writing-vertical': {
//       'writing-mode': 'vertical-rl',
//       'text-orientation': 'mixed',
//     },
//     '.writing-vertical-lr': {
//       'writing-mode': 'vertical-lr',
//       'text-orientation': 'mixed',
//     },
//     '.writing-horizontal': {
//       'writing-mode': 'horizontal-tb',
//     },
//     '.text-indent-1em': {
//       'text-indent': '1em',
//     },
//   })
// })
