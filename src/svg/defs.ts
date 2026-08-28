import type { ThemeColors } from '../tokens/types.js';

export interface SvgDefsOptions {
  includeDotsPattern?: boolean;
  includeSketchyFilter?: boolean;
  sketchyScale?: number;
  sketchySeed?: number;
  idPrefix?: string;
}

export function buildSvgDefs(colors: ThemeColors, options: SvgDefsOptions = {}): string {
  const prefix = options.idPrefix ? `${options.idPrefix}-` : '';
  const defs: string[] = ['<defs>'];

  // Markers
  defs.push(`    <marker id="${prefix}arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="${colors.muted}"/>
    </marker>`);

  defs.push(`    <marker id="${prefix}arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="${colors.accent}"/>
    </marker>`);

  defs.push(`    <marker id="${prefix}arrow-link" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="${colors.link}"/>
    </marker>`);

  defs.push(`    <marker id="${prefix}arrow-open" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polyline points="0 0, 8 3, 0 6" fill="none" stroke="${colors.muted}" stroke-width="1.2"/>
    </marker>`);

  // Optional Dot Pattern (22x22 grid)
  if (options.includeDotsPattern) {
    const dotColor = colors.ink.startsWith('#')
      ? `${colors.ink}1a` // ~10% opacity
      : 'rgba(45,49,66,0.10)';
    defs.push(`    <pattern id="${prefix}dots" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="0.9" fill="${dotColor}"/>
    </pattern>`);
  }

  // Optional Sketchy Hand-Drawn Filter
  if (options.includeSketchyFilter) {
    const scale = options.sketchyScale ?? 1.5;
    const seed = options.sketchySeed ?? 4;
    defs.push(`    <filter id="${prefix}sketchy" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="${seed}"/>
      <feDisplacementMap in="SourceGraphic" scale="${scale}"/>
    </filter>`);
  }

  defs.push('  </defs>');
  return defs.join('\n');
}
