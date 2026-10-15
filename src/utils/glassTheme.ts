import React from 'react';
import { GlassTheme } from '../types/transport';

export interface GlassPreset {
  id: GlassTheme;
  nameZH: string;
  nameEN: string;
  baseHex: string;
  accentHex: string;
  previewBg: string;
}

export const GLASS_PRESETS: GlassPreset[] = [
  {
    id: 'dark',
    nameZH: '曜石深黑',
    nameEN: 'Obsidian Dark',
    baseHex: '#0f172a',
    accentHex: '#1e293b',
    previewBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  },
  {
    id: 'light',
    nameZH: '冰霜純白',
    nameEN: 'Frost White',
    baseHex: '#f1f5f9',
    accentHex: '#ffffff',
    previewBg: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
  },
  {
    id: 'blue',
    nameZH: '深邃海洋藍',
    nameEN: 'Sapphire Blue',
    baseHex: '#0a2540',
    accentHex: '#1e3a8a',
    previewBg: 'linear-gradient(135deg, #1e3a8a 0%, #0a2540 100%)',
  },
  {
    id: 'emerald',
    nameZH: '港鐵青蔥綠',
    nameEN: 'Emerald Green',
    baseHex: '#064e3b',
    accentHex: '#047857',
    previewBg: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)',
  },
  {
    id: 'purple',
    nameZH: '夜幕幻紫',
    nameEN: 'Amethyst Cyber',
    baseHex: '#3b0764',
    accentHex: '#6b21a8',
    previewBg: 'linear-gradient(135deg, #6b21a8 0%, #3b0764 100%)',
  },
  {
    id: 'amber',
    nameZH: '落日琥珀',
    nameEN: 'Amber Sunset',
    baseHex: '#451a03',
    accentHex: '#9a3412',
    previewBg: 'linear-gradient(135deg, #9a3412 0%, #451a03 100%)',
  },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) {
    return { r: 15, g: 23, b: 42 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

export function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  // Perceived luminance formula (ITU-R BT.709)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.65;
}

export function isLightGlass(theme: GlassTheme, customHex?: string): boolean {
  if (theme === 'light') return true;
  if (theme === 'custom' && customHex) {
    return isLightColor(customHex);
  }
  return false;
}

export function getGlassBaseHex(theme: GlassTheme, customHex?: string): string {
  if (theme === 'custom' && customHex) {
    return customHex;
  }
  const found = GLASS_PRESETS.find((p) => p.id === theme);
  return found ? found.baseHex : '#0f172a';
}

export function getLiquidGlassStyle(
  theme: GlassTheme,
  customHex: string | undefined,
  opacity: number = 0.95
): React.CSSProperties {
  const isLight = isLightGlass(theme, customHex);
  const baseHex = getGlassBaseHex(theme, customHex);
  const { r, g, b } = hexToRgb(baseHex);

  const safeOpacity = Math.max(0.15, Math.min(1.0, opacity));

  // Compute lighter specular highlight color
  const highR = Math.min(255, Math.round(r + 35));
  const highG = Math.min(255, Math.round(g + 35));
  const highB = Math.min(255, Math.round(b + 45));

  // Compute deeper bottom tone
  const darkR = Math.max(0, Math.round(r - 15));
  const darkG = Math.max(0, Math.round(g - 15));
  const darkB = Math.max(0, Math.round(b - 15));

  const bgGradient = `linear-gradient(135deg, rgba(${highR}, ${highG}, ${highB}, ${safeOpacity * 0.9}) 0%, rgba(${r}, ${g}, ${b}, ${safeOpacity}) 50%, rgba(${darkR}, ${darkG}, ${darkB}, ${Math.min(1, safeOpacity * 1.05)}) 100%)`;

  const borderColor = isLight
    ? `rgba(0, 0, 0, ${Math.min(0.25, safeOpacity * 0.3)})`
    : `rgba(255, 255, 255, ${Math.min(0.35, safeOpacity * 0.32)})`;

  const topInsetGlow = isLight
    ? `inset 0 1px 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.1)`
    : `inset 0 1px 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.4)`;

  return {
    background: bgGradient,
    border: `1px solid ${borderColor}`,
    boxShadow: `0 20px 50px -12px rgba(0, 0, 0, ${safeOpacity * 0.75}), ${topInsetGlow}`,
    backdropFilter: 'blur(28px) saturate(210%) brightness(105%)',
    WebkitBackdropFilter: 'blur(28px) saturate(210%) brightness(105%)',
  };
}

