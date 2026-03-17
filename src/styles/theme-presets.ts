// ============================================================================
// Theme Color Presets — 背景・テキスト・ボーダー・影・アクセントを総合的に定義
// ============================================================================

/** ダーク/ライト各モードのフルカラーセット */
export interface ModeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  bgHover: string;
  bgActive: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;

  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;

  accentPrimary: string;
  accentHover: string;
  accentActive: string;
  accentSubtle: string;

  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  dark: ModeColors;
  light: ModeColors;
  /** プレビュー用のプライマリカラー */
  previewColor: string;
  /** true の場合、ボーダー・影を非表示にする */
  minimal?: boolean;
}

// ---------------------------------------------------------------------------
// Preset Definitions
// ---------------------------------------------------------------------------

const defaultDark: ModeColors = {
  bgPrimary: '#0f1017',
  bgSecondary: '#171614',
  bgTertiary: '#1e1c1a',
  bgElevated: '#2a2825',
  bgHover: 'rgba(255,255,255,0.04)',
  bgActive: 'rgba(255,255,255,0.07)',
  textPrimary: '#e8e5e0',
  textSecondary: '#a09a90',
  textTertiary: '#706a60',
  textDisabled: '#504c46',
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderDefault: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.16)',
  accentPrimary: '#d4a574',
  accentHover: '#ecb56b',
  accentActive: '#c48a4a',
  accentSubtle: 'rgba(212,165,116,0.12)',
  shadowSm: '0 1px 2px rgba(0,0,0,0.3)',
  shadowMd: '0 2px 8px rgba(0,0,0,0.35)',
  shadowLg: '0 4px 16px rgba(0,0,0,0.4)',
};

const defaultLight: ModeColors = {
  bgPrimary: '#faf8f5',
  bgSecondary: '#f2efe9',
  bgTertiary: '#ffffff',
  bgElevated: '#ffffff',
  bgHover: 'rgba(0,0,0,0.03)',
  bgActive: 'rgba(0,0,0,0.06)',
  textPrimary: '#2a2520',
  textSecondary: '#6b6560',
  textTertiary: '#9b9590',
  textDisabled: '#c5c0bb',
  borderSubtle: 'rgba(0,0,0,0.05)',
  borderDefault: 'rgba(0,0,0,0.10)',
  borderStrong: 'rgba(0,0,0,0.18)',
  accentPrimary: '#b6733a',
  accentHover: '#975b31',
  accentActive: '#c48a4a',
  accentSubtle: 'rgba(182,115,58,0.10)',
  shadowSm: '0 1px 2px rgba(0,0,0,0.06)',
  shadowMd: '0 2px 8px rgba(0,0,0,0.08)',
  shadowLg: '0 4px 16px rgba(0,0,0,0.10)',
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'デフォルト',
    description: '温かみのあるアンバー/ゴールド',
    previewColor: '#d4a574',
    dark: defaultDark,
    light: defaultLight,
  },
  {
    id: 'ocean',
    name: 'オーシャン',
    description: '落ち着いた青 — 海・空のイメージ',
    previewColor: '#5b8fb9',
    dark: {
      bgPrimary: '#0c1520',
      bgSecondary: '#111d2b',
      bgTertiary: '#172638',
      bgElevated: '#1e2f44',
      bgHover: 'rgba(91,143,185,0.06)',
      bgActive: 'rgba(91,143,185,0.10)',
      textPrimary: '#dce8f0',
      textSecondary: '#8aa8c0',
      textTertiary: '#5a7890',
      textDisabled: '#3d5568',
      borderSubtle: 'rgba(91,143,185,0.10)',
      borderDefault: 'rgba(91,143,185,0.16)',
      borderStrong: 'rgba(91,143,185,0.24)',
      accentPrimary: '#5b8fb9',
      accentHover: '#7db0d4',
      accentActive: '#4a7a9e',
      accentSubtle: 'rgba(91,143,185,0.12)',
      shadowSm: '0 1px 2px rgba(0,10,30,0.4)',
      shadowMd: '0 2px 8px rgba(0,10,30,0.45)',
      shadowLg: '0 4px 16px rgba(0,10,30,0.5)',
    },
    light: {
      bgPrimary: '#f4f8fb',
      bgSecondary: '#e8f0f6',
      bgTertiary: '#ffffff',
      bgElevated: '#ffffff',
      bgHover: 'rgba(61,122,171,0.04)',
      bgActive: 'rgba(61,122,171,0.08)',
      textPrimary: '#1a2e3e',
      textSecondary: '#4a6a80',
      textTertiary: '#8aa0b0',
      textDisabled: '#bcccd6',
      borderSubtle: 'rgba(61,122,171,0.08)',
      borderDefault: 'rgba(61,122,171,0.14)',
      borderStrong: 'rgba(61,122,171,0.22)',
      accentPrimary: '#3d7aab',
      accentHover: '#2e6590',
      accentActive: '#5b8fb9',
      accentSubtle: 'rgba(61,122,171,0.10)',
      shadowSm: '0 1px 2px rgba(0,20,50,0.06)',
      shadowMd: '0 2px 8px rgba(0,20,50,0.08)',
      shadowLg: '0 4px 16px rgba(0,20,50,0.10)',
    },
  },
  {
    id: 'forest',
    name: 'フォレスト',
    description: '深い緑 — 森・自然のイメージ',
    previewColor: '#6b9e7a',
    dark: {
      bgPrimary: '#0c150f',
      bgSecondary: '#121d16',
      bgTertiary: '#18271d',
      bgElevated: '#1f3126',
      bgHover: 'rgba(107,158,122,0.06)',
      bgActive: 'rgba(107,158,122,0.10)',
      textPrimary: '#dce8e0',
      textSecondary: '#8aaa94',
      textTertiary: '#5a7a64',
      textDisabled: '#3d5544',
      borderSubtle: 'rgba(107,158,122,0.10)',
      borderDefault: 'rgba(107,158,122,0.16)',
      borderStrong: 'rgba(107,158,122,0.24)',
      accentPrimary: '#6b9e7a',
      accentHover: '#88b896',
      accentActive: '#558966',
      accentSubtle: 'rgba(107,158,122,0.12)',
      shadowSm: '0 1px 2px rgba(0,20,8,0.4)',
      shadowMd: '0 2px 8px rgba(0,20,8,0.45)',
      shadowLg: '0 4px 16px rgba(0,20,8,0.5)',
    },
    light: {
      bgPrimary: '#f5f9f6',
      bgSecondary: '#eaf2ec',
      bgTertiary: '#ffffff',
      bgElevated: '#ffffff',
      bgHover: 'rgba(74,128,96,0.04)',
      bgActive: 'rgba(74,128,96,0.08)',
      textPrimary: '#1a2e20',
      textSecondary: '#4a6a54',
      textTertiary: '#8aa094',
      textDisabled: '#bcccbe',
      borderSubtle: 'rgba(74,128,96,0.08)',
      borderDefault: 'rgba(74,128,96,0.14)',
      borderStrong: 'rgba(74,128,96,0.22)',
      accentPrimary: '#4a8060',
      accentHover: '#3a6b4e',
      accentActive: '#6b9e7a',
      accentSubtle: 'rgba(74,128,96,0.10)',
      shadowSm: '0 1px 2px rgba(0,30,10,0.06)',
      shadowMd: '0 2px 8px rgba(0,30,10,0.08)',
      shadowLg: '0 4px 16px rgba(0,30,10,0.10)',
    },
  },
  {
    id: 'sakura',
    name: 'さくら',
    description: '淡いピンク — 日本的な柔らかさ',
    previewColor: '#c9878f',
    dark: {
      bgPrimary: '#150c0e',
      bgSecondary: '#1d1214',
      bgTertiary: '#27181b',
      bgElevated: '#321f23',
      bgHover: 'rgba(201,135,143,0.06)',
      bgActive: 'rgba(201,135,143,0.10)',
      textPrimary: '#f0dce0',
      textSecondary: '#b88a90',
      textTertiary: '#8a5a62',
      textDisabled: '#5a3a40',
      borderSubtle: 'rgba(201,135,143,0.10)',
      borderDefault: 'rgba(201,135,143,0.16)',
      borderStrong: 'rgba(201,135,143,0.24)',
      accentPrimary: '#c9878f',
      accentHover: '#dba0a7',
      accentActive: '#b06e76',
      accentSubtle: 'rgba(201,135,143,0.12)',
      shadowSm: '0 1px 2px rgba(30,0,8,0.4)',
      shadowMd: '0 2px 8px rgba(30,0,8,0.45)',
      shadowLg: '0 4px 16px rgba(30,0,8,0.5)',
    },
    light: {
      bgPrimary: '#fdf6f7',
      bgSecondary: '#f8eced',
      bgTertiary: '#ffffff',
      bgElevated: '#ffffff',
      bgHover: 'rgba(176,110,118,0.04)',
      bgActive: 'rgba(176,110,118,0.08)',
      textPrimary: '#2e1a1e',
      textSecondary: '#6a4a50',
      textTertiary: '#a08a8e',
      textDisabled: '#d0bcc0',
      borderSubtle: 'rgba(176,110,118,0.08)',
      borderDefault: 'rgba(176,110,118,0.14)',
      borderStrong: 'rgba(176,110,118,0.22)',
      accentPrimary: '#b06e76',
      accentHover: '#965960',
      accentActive: '#c9878f',
      accentSubtle: 'rgba(176,110,118,0.10)',
      shadowSm: '0 1px 2px rgba(40,0,10,0.06)',
      shadowMd: '0 2px 8px rgba(40,0,10,0.08)',
      shadowLg: '0 4px 16px rgba(40,0,10,0.10)',
    },
  },
  {
    id: 'twilight',
    name: 'トワイライト',
    description: '紫/ラベンダー — 夕暮れ・幻想的',
    previewColor: '#9b8ec4',
    dark: {
      bgPrimary: '#100e18',
      bgSecondary: '#161422',
      bgTertiary: '#1e1a2e',
      bgElevated: '#26223a',
      bgHover: 'rgba(155,142,196,0.06)',
      bgActive: 'rgba(155,142,196,0.10)',
      textPrimary: '#e4e0f0',
      textSecondary: '#a098c0',
      textTertiary: '#6a6290',
      textDisabled: '#4a4468',
      borderSubtle: 'rgba(155,142,196,0.10)',
      borderDefault: 'rgba(155,142,196,0.16)',
      borderStrong: 'rgba(155,142,196,0.24)',
      accentPrimary: '#9b8ec4',
      accentHover: '#b5aad6',
      accentActive: '#8275b0',
      accentSubtle: 'rgba(155,142,196,0.12)',
      shadowSm: '0 1px 2px rgba(10,0,30,0.4)',
      shadowMd: '0 2px 8px rgba(10,0,30,0.45)',
      shadowLg: '0 4px 16px rgba(10,0,30,0.5)',
    },
    light: {
      bgPrimary: '#f8f6fc',
      bgSecondary: '#eeeaf6',
      bgTertiary: '#ffffff',
      bgElevated: '#ffffff',
      bgHover: 'rgba(123,109,170,0.04)',
      bgActive: 'rgba(123,109,170,0.08)',
      textPrimary: '#1e1a2e',
      textSecondary: '#4a4468',
      textTertiary: '#8a84a0',
      textDisabled: '#c0bcd0',
      borderSubtle: 'rgba(123,109,170,0.08)',
      borderDefault: 'rgba(123,109,170,0.14)',
      borderStrong: 'rgba(123,109,170,0.22)',
      accentPrimary: '#7b6daa',
      accentHover: '#635894',
      accentActive: '#9b8ec4',
      accentSubtle: 'rgba(123,109,170,0.10)',
      shadowSm: '0 1px 2px rgba(15,0,40,0.06)',
      shadowMd: '0 2px 8px rgba(15,0,40,0.08)',
      shadowLg: '0 4px 16px rgba(15,0,40,0.10)',
    },
  },
  {
    id: 'minimal',
    name: 'ミニマル',
    description: 'モノクロ — 枠線なし、影なし',
    previewColor: '#888888',
    minimal: true,
    dark: {
      bgPrimary: '#111111',
      bgSecondary: '#161616',
      bgTertiary: '#1c1c1c',
      bgElevated: '#222222',
      bgHover: 'rgba(255,255,255,0.04)',
      bgActive: 'rgba(255,255,255,0.07)',
      textPrimary: '#e0e0e0',
      textSecondary: '#999999',
      textTertiary: '#666666',
      textDisabled: '#444444',
      borderSubtle: 'transparent',
      borderDefault: 'transparent',
      borderStrong: 'rgba(255,255,255,0.08)',
      accentPrimary: '#888888',
      accentHover: '#a0a0a0',
      accentActive: '#707070',
      accentSubtle: 'rgba(136,136,136,0.08)',
      shadowSm: 'none',
      shadowMd: 'none',
      shadowLg: 'none',
    },
    light: {
      bgPrimary: '#fafafa',
      bgSecondary: '#f5f5f5',
      bgTertiary: '#ffffff',
      bgElevated: '#ffffff',
      bgHover: 'rgba(0,0,0,0.02)',
      bgActive: 'rgba(0,0,0,0.04)',
      textPrimary: '#222222',
      textSecondary: '#666666',
      textTertiary: '#999999',
      textDisabled: '#cccccc',
      borderSubtle: 'transparent',
      borderDefault: 'transparent',
      borderStrong: 'rgba(0,0,0,0.08)',
      accentPrimary: '#666666',
      accentHover: '#888888',
      accentActive: '#505050',
      accentSubtle: 'rgba(102,102,102,0.06)',
      shadowSm: 'none',
      shadowMd: 'none',
      shadowLg: 'none',
    },
  },
];

/** Get a preset by ID, fallback to default */
export function getThemePreset(id: string): ThemePreset {
  return THEME_PRESETS.find((p) => p.id === id) ?? THEME_PRESETS[0];
}
