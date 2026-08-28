import type { ThemeColors } from '../tokens/types.js';
import { FONT_FAMILIES } from '../tokens/typography.js';
import { snapToGrid } from '../layout/math.js';

export interface NodeBoxOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  sublabel?: string;
  tag?: string;
  kind?: 'backend' | 'focal' | 'store' | 'external' | 'input' | 'optional' | 'security';
  customFill?: string;
  customStroke?: string;
  rx?: number;
  focal?: boolean;
}

export function buildNodeBox(colors: ThemeColors, options: NodeBoxOptions): string {
  const x = snapToGrid(options.x);
  const y = snapToGrid(options.y);
  const w = snapToGrid(options.width);
  const h = snapToGrid(options.height);
  const rx = options.rx ?? 6;
  const kind = options.kind || (options.focal ? 'focal' : 'backend');

  let fill = '#ffffff';
  let stroke = colors.ink;
  let strokeWidth = '1';
  let strokeDash = '';

  if (kind === 'focal' || options.focal) {
    fill = colors.accentTint;
    stroke = colors.accent;
  } else if (kind === 'store') {
    fill = colors.ink.startsWith('#') ? `${colors.ink}0d` : 'rgba(45,49,66,0.05)';
    stroke = colors.muted;
  } else if (kind === 'external') {
    fill = colors.ink.startsWith('#') ? `${colors.ink}08` : 'rgba(45,49,66,0.03)';
    stroke = colors.ink.startsWith('#') ? `${colors.ink}4d` : 'rgba(45,49,66,0.30)';
  } else if (kind === 'input') {
    fill = colors.muted.startsWith('#') ? `${colors.muted}1a` : 'rgba(79,93,117,0.10)';
    stroke = colors.soft;
  } else if (kind === 'optional') {
    fill = colors.ink.startsWith('#') ? `${colors.ink}05` : 'rgba(45,49,66,0.02)';
    stroke = colors.ink.startsWith('#') ? `${colors.ink}33` : 'rgba(45,49,66,0.20)';
    strokeDash = ' stroke-dasharray="4,3"';
  } else if (kind === 'security') {
    fill = colors.accentTint;
    stroke = colors.accent.startsWith('#') ? `${colors.accent}80` : 'rgba(235,108,54,0.50)';
    strokeDash = ' stroke-dasharray="4,4"';
  }

  if (options.customFill) fill = options.customFill;
  if (options.customStroke) stroke = options.customStroke;

  const elements: string[] = [];

  // 1. Opaque paper mask (Rule: prevents arrows from bleeding through transparent fills)
  elements.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${colors.paper}"/>`);

  // 2. Styled Box
  elements.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${strokeDash}/>`);

  // 3. Rectangular Type Tag (rx=2, NOT a pill)
  if (options.tag) {
    const tagW = Math.max(28, options.tag.length * 7 + 8);
    elements.push(`  <rect x="${x + 8}" y="${y + 6}" width="${tagW}" height="12" rx="2" fill="transparent" stroke="${stroke}" stroke-opacity="0.4" stroke-width="0.8"/>`);
    elements.push(`  <text x="${x + 8 + tagW / 2}" y="${y + 15}" fill="${stroke}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.08em">${options.tag}</text>`);
  }

  // 4. Node Name (Geist sans 600)
  const cx = snapToGrid(x + w / 2);
  const cy = snapToGrid(y + h / 2);
  const nameY = options.sublabel ? cy - 2 : cy + 4;
  elements.push(`  <text x="${cx}" y="${nameY}" fill="${colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${options.label}</text>`);

  // 5. Technical Sublabel (Geist Mono)
  if (options.sublabel) {
    elements.push(`  <text x="${cx}" y="${cy + 14}" fill="${colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${options.sublabel}</text>`);
  }

  return elements.join('\n');
}

export function buildZoneContainer(
  colors: ThemeColors,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }
): string {
  const x = snapToGrid(options.x);
  const y = snapToGrid(options.y);
  const w = snapToGrid(options.width);
  const h = snapToGrid(options.height);
  const labelW = Math.max(48, options.label.length * 7 + 16);
  const labelX = x + 16;

  return [
    `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.10)" stroke-width="0.8"/>`,
    `  <rect x="${labelX}" y="${y + 4}" width="${labelW}" height="12" rx="2" fill="${colors.paper}"/>`,
    `  <text x="${labelX + labelW / 2}" y="${y + 13}" fill="rgba(45,49,66,0.50)" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.14em">${options.label.toUpperCase()}</text>`
  ].join('\n');
}

export function buildAnnotationCallout(
  colors: ThemeColors,
  options: {
    text: string;
    targetPoint: { x: number; y: number };
    textPoint: { x: number; y: number };
    focal?: boolean;
  }
): string {
  const tx = options.targetPoint.x;
  const ty = options.targetPoint.y;
  const x = options.textPoint.x;
  const y = options.textPoint.y;
  const textColor = options.focal ? colors.accent : colors.ink;
  const leaderColor = options.focal ? colors.accent : 'rgba(45,49,66,0.40)';

  const controlX = snapToGrid((x + tx) / 2);
  const controlY = snapToGrid(Math.min(y, ty) + 20);

  return [
    `  <text x="${x}" y="${y}" fill="${textColor}" font-size="14" font-style="italic" font-family="${FONT_FAMILIES.serif}" text-anchor="end">${options.text}</text>`,
    `  <path d="M ${x - 8},${y + 4} Q ${controlX},${controlY} ${tx},${ty}" fill="none" stroke="${leaderColor}" stroke-width="1" stroke-dasharray="4,3"/>`,
    `  <circle cx="${tx}" cy="${ty}" r="2.5" fill="${textColor}"/>`
  ].join('\n');
}

export function buildLegendStrip(
  colors: ThemeColors,
  options: {
    viewBoxWidth: number;
    legendY: number;
    items: Array<{ label: string; color: string; kind?: 'line' | 'rect' | 'dashed' }>;
    aside?: string;
  }
): string {
  const y = snapToGrid(options.legendY);
  const w = options.viewBoxWidth;
  const elements: string[] = [];

  elements.push(`  <line x1="32" y1="${y - 8}" x2="${w - 32}" y2="${y - 8}" stroke="${colors.rule}" stroke-width="0.8"/>`);
  elements.push(`  <text x="32" y="${y + 10}" fill="${colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.14em">LEGEND</text>`);

  let currentX = 120;
  for (const item of options.items) {
    if (item.kind === 'rect') {
      elements.push(`  <rect x="${currentX}" y="${y + 2}" width="16" height="8" rx="2" fill="${item.color}"/>`);
    } else if (item.kind === 'dashed') {
      elements.push(`  <line x1="${currentX}" y1="${y + 6}" x2="${currentX + 16}" y2="${y + 6}" stroke="${item.color}" stroke-width="1.2" stroke-dasharray="4,3"/>`);
    } else {
      elements.push(`  <line x1="${currentX}" y1="${y + 6}" x2="${currentX + 16}" y2="${y + 6}" stroke="${item.color}" stroke-width="1.4"/>`);
    }
    elements.push(`  <text x="${currentX + 24}" y="${y + 9}" fill="${colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}">${item.label}</text>`);
    currentX += Math.max(120, item.label.length * 7 + 40);
  }

  if (options.aside) {
    elements.push(`  <text x="${w - 32}" y="${y + 9}" fill="${colors.muted}" font-size="11" font-style="italic" font-family="${FONT_FAMILIES.serif}" text-anchor="end">${options.aside}</text>`);
  }

  return elements.join('\n');
}
