// ============================================================================
// MyPWriter Typography System
// Optimized for Japanese creative writing with both vertical and horizontal modes
// ============================================================================

// --- Font Families ---

export const fontFamily = {
  // UI font: clean sans-serif for interface elements
  ui: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", sans-serif',

  // Editor font: elegant serif for writing (user-configurable, this is default)
  editor: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif',

  // Monospace: for code blocks, character counts, metadata
  mono: '"JetBrains Mono", "Source Code Pro", "Noto Sans Mono", monospace',
} as const;

// --- Font Size Scale ---
// Using rem for accessibility (respects user browser settings)

export const fontSize = {
  xs: '0.6875rem',    // 11px — fine print, metadata
  sm: '0.75rem',      // 12px — secondary text, labels
  base: '0.8125rem',  // 13px — UI default
  md: '0.875rem',     // 14px — body text in panels
  lg: '1rem',         // 16px — emphasized UI text
  xl: '1.125rem',     // 18px — section headers
  '2xl': '1.25rem',   // 20px — page titles
  '3xl': '1.5rem',    // 24px — large headings

  // Editor-specific sizes (user-configurable defaults)
  editor: {
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px — default editor size
    md: '1.125rem',   // 18px
    lg: '1.25rem',    // 20px
    xl: '1.5rem',     // 24px — for comfortable reading
  },
} as const;

// --- Font Weight Scale ---

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// --- Line Height ---

export const lineHeight = {
  // UI elements — tighter for interface
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,

  // Horizontal writing (横書き) — standard Japanese text
  horizontal: {
    compact: 1.6,
    default: 1.8,     // recommended for body text
    comfortable: 2.0,
    spacious: 2.2,
  },

  // Vertical writing (縦書き) — needs different spacing
  vertical: {
    compact: 1.5,
    default: 1.7,
    comfortable: 1.9,
    spacious: 2.1,
  },
} as const;

// --- Letter Spacing ---

export const letterSpacing = {
  tighter: '-0.02em',
  tight: '-0.01em',
  normal: '0em',

  // Japanese text often benefits from slight positive tracking
  wide: '0.02em',
  wider: '0.04em',
  widest: '0.08em',

  // Editor defaults
  editor: {
    horizontal: '0.02em',
    vertical: '0em',   // vertical writing typically no extra tracking
  },
} as const;

// --- Paragraph Spacing (for editor) ---

export const paragraphSpacing = {
  // Japanese convention: indent first line by 1em
  indent: '1em',

  // Spacing between paragraphs
  gap: {
    compact: '0.5em',
    default: '1em',
    comfortable: '1.5em',
  },
} as const;

// --- Typography Presets ---
// Ready-to-use combinations for common UI patterns

export const textStyles = {
  // UI presets
  'heading-lg': {
    fontFamily: 'ui',
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  'heading-md': {
    fontFamily: 'ui',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  'heading-sm': {
    fontFamily: 'ui',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  'body': {
    fontFamily: 'ui',
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  'body-sm': {
    fontFamily: 'ui',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  'label': {
    fontFamily: 'ui',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.wide,
  },
  'caption': {
    fontFamily: 'ui',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  'mono': {
    fontFamily: 'mono',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Editor presets
  'editor-horizontal': {
    fontFamily: 'editor',
    fontSize: fontSize.editor.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.horizontal.default,
    letterSpacing: letterSpacing.editor.horizontal,
  },
  'editor-vertical': {
    fontFamily: 'editor',
    fontSize: fontSize.editor.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.vertical.default,
    letterSpacing: letterSpacing.editor.vertical,
  },
} as const;
