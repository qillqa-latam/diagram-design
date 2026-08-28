import type { SizePreset, SizeClass, TypeRamp, ViewBox } from './types.js';

export const FONT_FAMILIES = {
  sans: "'Geist', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  serif: "'Instrument Serif', serif",
  mono: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  // Non-Latin fallbacks per output-spec.md §4
  sansJp: "'Geist', 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif",
  sansKr: "'Geist', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
  monoJp: "'Geist Mono', 'Noto Sans Mono CJK JP', monospace",
  monoKr: "'Geist Mono', 'Noto Sans Mono CJK KR', monospace"
};

export const GOOGLE_FONTS_LINK =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap';

export const SIZE_PRESETS: Record<SizePreset, { viewBox: ViewBox; sizeClass: SizeClass; pngScale: number }> = {
  'doc-inline': {
    viewBox: { minX: 0, minY: 0, width: 960, height: 600 },
    sizeClass: 'standard',
    pngScale: 2
  },
  'doc-wide': {
    viewBox: { minX: 0, minY: 0, width: 1280, height: 720 },
    sizeClass: 'standard',
    pngScale: 2
  },
  'slide-16x9': {
    viewBox: { minX: 0, minY: 0, width: 1280, height: 720 },
    sizeClass: 'presentation',
    pngScale: 2
  },
  'slide-4x3': {
    viewBox: { minX: 0, minY: 0, width: 1024, height: 768 },
    sizeClass: 'presentation',
    pngScale: 2
  },
  'social-og': {
    viewBox: { minX: 0, minY: 0, width: 1200, height: 632 },
    sizeClass: 'presentation',
    pngScale: 2
  },
  'social-square': {
    viewBox: { minX: 0, minY: 0, width: 1080, height: 1080 },
    sizeClass: 'presentation',
    pngScale: 2
  },
  'print-a4-landscape': {
    viewBox: { minX: 0, minY: 0, width: 1120, height: 792 },
    sizeClass: 'print',
    pngScale: 3
  },
  'print-letter-landscape': {
    viewBox: { minX: 0, minY: 0, width: 1056, height: 816 },
    sizeClass: 'print',
    pngScale: 3
  },
  'fit': {
    viewBox: { minX: 0, minY: 0, width: 960, height: 600 },
    sizeClass: 'standard',
    pngScale: 2
  }
};

export const TYPE_RAMPS: Record<SizeClass, TypeRamp> = {
  standard: {
    title: 28,
    nodeName: 12,
    sublabel: 9,
    arrowLabel: 8,
    eyebrow: 8,
    nodeBoxMinHeight: 48,
    minGap: 24
  },
  presentation: {
    title: 40,
    nodeName: 16,
    sublabel: 12,
    arrowLabel: 12,
    eyebrow: 8,
    nodeBoxMinHeight: 64,
    minGap: 40
  },
  print: {
    title: 32,
    nodeName: 12,
    sublabel: 9,
    arrowLabel: 8,
    eyebrow: 8,
    nodeBoxMinHeight: 48,
    minGap: 24
  }
};

export function getTypeRamp(preset: SizePreset = 'doc-inline'): TypeRamp {
  const config = SIZE_PRESETS[preset] || SIZE_PRESETS['doc-inline'];
  return TYPE_RAMPS[config.sizeClass];
}
