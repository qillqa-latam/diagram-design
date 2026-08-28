import type { ThemeColors, SeriesColors, TerminalColors, ThemeMode } from './types.js';

export const DEFAULT_LIGHT_COLORS: ThemeColors = {
  paper: '#f5f5f5',
  paper2: '#ececec',
  ink: '#2d3142',
  muted: '#4f5d75',
  soft: '#7a8399',
  rule: 'rgba(45,49,66,0.12)',
  ruleSolid: '#bfc0c0',
  accent: '#eb6c36',
  accentTint: 'rgba(235,108,54,0.08)',
  link: '#2e5aa8'
};

export const DEFAULT_DARK_COLORS: ThemeColors = {
  paper: '#2d3142',
  paper2: '#393e53',
  ink: '#f5f5f5',
  muted: '#bfc0c0',
  soft: '#8e98ac',
  rule: 'rgba(245,245,245,0.12)',
  ruleSolid: 'rgba(191,192,192,0.25)',
  accent: '#f08a59',
  accentTint: 'rgba(240,138,89,0.10)',
  link: '#6a95d8'
};

export const DEFAULT_LIGHT_SERIES: SeriesColors = {
  series1: '#7c8f6f', // sage
  series2: '#5e7a9b', // dusty-blue
  series3: '#b8915a', // mustard
  series4: '#9c6b50', // rust-brown
  series5: '#6e6479'  // slate
};

export const DEFAULT_DARK_SERIES: SeriesColors = {
  series1: '#9caf8f',
  series2: '#82a0c0',
  series3: '#d3ad7a',
  series4: '#b88670',
  series5: '#8d8298'
};

export const TERMINAL_COLORS: TerminalColors = {
  page: '#0a0a0a',
  paper: '#141414',
  bar: '#1b1b1b',
  border: '#2b2b2b',
  ink: '#f5f5f5',
  muted: '#9a9a9a',
  soft: '#5c5c5c',
  accent: '#ff5a36',
  accentTint: 'rgba(255,90,54,0.12)'
};

/**
 * Invert light RGBA values to dark RGBA values per the style guide rule:
 * rgba(45,49,66, X) -> rgba(245,245,245, X)
 */
export function invertRgbaToDark(color: string): string {
  if (color.includes('45,49,66')) {
    return color.replace(/45,\s*49,\s*66/g, '245,245,245');
  }
  if (color.includes('28,25,23')) {
    return color.replace(/28,\s*25,\s*23/g, '250,247,242');
  }
  return color;
}

export function getThemeColors(mode: ThemeMode = 'light', customColors?: Partial<ThemeColors>): ThemeColors {
  const base = mode === 'dark' ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS;
  return { ...base, ...customColors };
}

export function getSeriesColors(mode: ThemeMode = 'light', customSeries?: Partial<SeriesColors>): SeriesColors {
  const base = mode === 'dark' ? DEFAULT_DARK_SERIES : DEFAULT_LIGHT_SERIES;
  return { ...base, ...customSeries };
}
