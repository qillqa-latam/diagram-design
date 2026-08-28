import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface ScatterPoint {
  label: string;
  x: number;
  y: number;
  size?: number; // Bubble radius
  focal?: boolean;
}

export interface ScatterPlotDiagramOptions extends BaseDiagramOptions {
  xLabel: string;
  yLabel: string;
  points: ScatterPoint[];
  maxX?: number;
  maxY?: number;
}

export class ScatterPlotDiagram extends BaseDiagram<ScatterPlotDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const startX = 80;
    const startY = 48;
    const plotW = width - 144;
    const plotH = height - 128;
    const baselineY = startY + plotH;

    const maxX = this.options.maxX || Math.max(...this.options.points.map(p => p.x));
    const maxY = this.options.maxY || Math.max(...this.options.points.map(p => p.y));

    // 1. Axes
    output.push(`  <line x1="${startX}" y1="${startY}" x2="${startX}" y2="${baselineY}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);
    output.push(`  <line x1="${startX}" y1="${baselineY}" x2="${startX + plotW}" y2="${baselineY}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);

    output.push(`  <text x="${startX + plotW / 2}" y="${baselineY + 32}" fill="${this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${this.options.xLabel.toUpperCase()} →</text>`);
    output.push(`  <text x="${startX - 32}" y="${startY + plotH / 2}" fill="${this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" transform="rotate(-90, ${startX - 32}, ${startY + plotH / 2})">${this.options.yLabel.toUpperCase()} →</text>`);

    // 2. Points / Bubbles
    for (const pt of this.options.points) {
      const px = snapToGrid(startX + (pt.x / maxX) * plotW);
      const py = snapToGrid(baselineY - (pt.y / maxY) * plotH);
      const r = pt.size || (pt.focal ? 6 : 4);

      const fill = pt.focal ? this.colors.accentTint : 'rgba(79,93,117,0.12)';
      const stroke = pt.focal ? this.colors.accent : this.colors.ink;

      output.push(`  <circle cx="${px}" cy="${py}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`);
      output.push(`  <text x="${px}" y="${py - r - 4}" fill="${this.colors.ink}" font-size="9" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${pt.label}</text>`);
    }

    return output.join('\n');
  }
}
