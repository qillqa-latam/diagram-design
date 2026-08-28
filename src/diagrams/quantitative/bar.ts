import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface BarItem {
  name: string;
  value: number;
  focal?: boolean;
}

export interface BarChartDiagramOptions extends BaseDiagramOptions {
  orientation?: 'horizontal' | 'vertical';
  items: BarItem[];
  maxValue?: number;
  units?: string;
}

export class BarChartDiagram extends BaseDiagram<BarChartDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const isHorizontal = this.options.orientation !== 'vertical';
    const count = this.options.items.length;
    const maxVal = this.options.maxValue || Math.max(...this.options.items.map(i => i.value));

    if (isHorizontal) {
      const startX = 140;
      const startY = 64;
      const barAreaW = width - startX - 80;
      const barH = 28;
      const gap = 16;

      this.options.items.forEach((item, idx) => {
        const by = snapToGrid(startY + idx * (barH + gap));
        const bw = snapToGrid((item.value / maxVal) * barAreaW);
        const fill = item.focal ? this.colors.accent : this.colors.muted;

        // Label
        output.push(`  <text x="${startX - 12}" y="${by + 18}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="end">${item.name}</text>`);

        // Bar
        output.push(`  <rect x="${startX}" y="${by}" width="${bw}" height="${barH}" rx="4" fill="${fill}" opacity="${item.focal ? '1' : '0.6'}"/>`);

        // Value
        const valStr = `${item.value.toLocaleString()} ${this.options.units || ''}`.trim();
        output.push(`  <text x="${startX + bw + 8}" y="${by + 18}" fill="${item.focal ? this.colors.accent : this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}">${valStr}</text>`);
      });
    } else {
      const startX = 64;
      const baselineY = height - 80;
      const barAreaH = baselineY - 80;
      const availableW = width - 128;
      const barW = snapToGrid((availableW - (count - 1) * 24) / count);

      // Baseline
      output.push(`  <line x1="${startX}" y1="${baselineY}" x2="${startX + availableW}" y2="${baselineY}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);

      this.options.items.forEach((item, idx) => {
        const bx = snapToGrid(startX + idx * (barW + 24));
        const bh = snapToGrid((item.value / maxVal) * barAreaH);
        const by = baselineY - bh;
        const fill = item.focal ? this.colors.accent : this.colors.muted;

        output.push(`  <rect x="${bx}" y="${by}" width="${barW}" height="${bh}" rx="4" fill="${fill}" opacity="${item.focal ? '1' : '0.6'}"/>`);
        output.push(`  <text x="${bx + barW / 2}" y="${baselineY + 20}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${item.name}</text>`);

        const valStr = `${item.value.toLocaleString()} ${this.options.units || ''}`.trim();
        output.push(`  <text x="${bx + barW / 2}" y="${by - 8}" fill="${item.focal ? this.colors.accent : this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${valStr}</text>`);
      });
    }

    return output.join('\n');
  }
}
