// ============================================================================
// Theme Color Presets
// テーマカラーのプリセット定義
// ============================================================================

export interface ThemePresetColors {
  /** Primary accent color (dark mode) */
  primaryDark: string;
  /** Primary accent light (dark mode) */
  primaryDarkLight: string;
  /** Primary accent dark shade (dark mode) */
  primaryDarkDark: string;

  /** Primary accent color (light mode) */
  primaryLight: string;
  /** Primary accent light (light mode) */
  primaryLightLight: string;
  /** Primary accent dark shade (light mode) */
  primaryLightDark: string;

  /** Subtle background tint (dark mode) — used for accent-subtle */
  accentSubtleDark: string;
  /** Subtle background tint (light mode) */
  accentSubtleLight: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: ThemePresetColors;
  /** If true, border/shadow are removed for a cleaner UI */
  minimal?: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'デフォルト',
    description: '温かみのあるアンバー/ゴールド',
    colors: {
      primaryDark: '#d4a574',
      primaryDarkLight: '#ecb56b',
      primaryDarkDark: '#c48a4a',
      primaryLight: '#b6733a',
      primaryLightLight: '#c48a4a',
      primaryLightDark: '#975b31',
      accentSubtleDark: 'rgba(212, 165, 116, 0.12)',
      accentSubtleLight: 'rgba(182, 115, 58, 0.10)',
    },
  },
  {
    id: 'ocean',
    name: 'オーシャン',
    description: '落ち着いた青 — 海・空のイメージ',
    colors: {
      primaryDark: '#5b8fb9',
      primaryDarkLight: '#7db0d4',
      primaryDarkDark: '#4a7a9e',
      primaryLight: '#3d7aab',
      primaryLightLight: '#5b8fb9',
      primaryLightDark: '#2e6590',
      accentSubtleDark: 'rgba(91, 143, 185, 0.12)',
      accentSubtleLight: 'rgba(61, 122, 171, 0.10)',
    },
  },
  {
    id: 'forest',
    name: 'フォレスト',
    description: '深い緑 — 森・自然のイメージ',
    colors: {
      primaryDark: '#6b9e7a',
      primaryDarkLight: '#88b896',
      primaryDarkDark: '#558966',
      primaryLight: '#4a8060',
      primaryLightLight: '#6b9e7a',
      primaryLightDark: '#3a6b4e',
      accentSubtleDark: 'rgba(107, 158, 122, 0.12)',
      accentSubtleLight: 'rgba(74, 128, 96, 0.10)',
    },
  },
  {
    id: 'sakura',
    name: 'さくら',
    description: '淡いピンク — 日本的な柔らかさ',
    colors: {
      primaryDark: '#c9878f',
      primaryDarkLight: '#dba0a7',
      primaryDarkDark: '#b06e76',
      primaryLight: '#b06e76',
      primaryLightLight: '#c9878f',
      primaryLightDark: '#965960',
      accentSubtleDark: 'rgba(201, 135, 143, 0.12)',
      accentSubtleLight: 'rgba(176, 110, 118, 0.10)',
    },
  },
  {
    id: 'twilight',
    name: 'トワイライト',
    description: '紫/ラベンダー — 夕暮れ・幻想的',
    colors: {
      primaryDark: '#9b8ec4',
      primaryDarkLight: '#b5aad6',
      primaryDarkDark: '#8275b0',
      primaryLight: '#7b6daa',
      primaryLightLight: '#9b8ec4',
      primaryLightDark: '#635894',
      accentSubtleDark: 'rgba(155, 142, 196, 0.12)',
      accentSubtleLight: 'rgba(123, 109, 170, 0.10)',
    },
  },
  {
    id: 'minimal',
    name: 'ミニマル',
    description: 'モノクロ — 枠線なし、影なし、最もクリーン',
    colors: {
      primaryDark: '#888888',
      primaryDarkLight: '#a0a0a0',
      primaryDarkDark: '#707070',
      primaryLight: '#666666',
      primaryLightLight: '#888888',
      primaryLightDark: '#505050',
      accentSubtleDark: 'rgba(136, 136, 136, 0.12)',
      accentSubtleLight: 'rgba(102, 102, 102, 0.10)',
    },
    minimal: true,
  },
];

/** Get a preset by ID, fallback to default */
export function getThemePreset(id: string): ThemePreset {
  return THEME_PRESETS.find((p) => p.id === id) ?? THEME_PRESETS[0];
}
