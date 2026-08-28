export type ThemeMode = 'light' | 'dark' | 'terminal';

export interface ThemeColors {
  paper: string;
  paper2: string;
  ink: string;
  muted: string;
  soft: string;
  rule: string;
  ruleSolid: string;
  accent: string;
  accentTint: string;
  link: string;
}

export interface SeriesColors {
  series1: string;
  series2: string;
  series3: string;
  series4: string;
  series5: string;
}

export interface TerminalColors {
  page: string;
  paper: string;
  bar: string;
  border: string;
  ink: string;
  muted: string;
  soft: string;
  accent: string;
  accentTint: string;
}

export type SizePreset =
  | 'doc-inline'
  | 'doc-wide'
  | 'slide-16x9'
  | 'slide-4x3'
  | 'social-og'
  | 'social-square'
  | 'print-a4-landscape'
  | 'print-letter-landscape'
  | 'fit';

export type SizeClass = 'standard' | 'presentation' | 'print';

export type AudienceLevel = 'engineer' | 'mixed' | 'executive';

export type DetailLevel = 'simplified' | 'balanced' | 'faithful';

export interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface TypeRamp {
  title: number;
  nodeName: number;
  sublabel: number;
  arrowLabel: number;
  eyebrow: number;
  nodeBoxMinHeight: number;
  minGap: number;
}

export interface ThemeProfile {
  name: string;
  slug: string;
  sourceUrl?: string;
  created?: string;
  updated?: string;
  notes?: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  series?: {
    light: SeriesColors;
    dark: SeriesColors;
  };
}
