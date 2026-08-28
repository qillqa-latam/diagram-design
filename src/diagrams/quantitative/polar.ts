import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid, polarToCartesianExact } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface PolarCategory {
  name: string;
  value: number;
  focal?: boolean;
}

export interface PolarChartDiagramOptions extends BaseDiagramOptions {
  categories: PolarCategory[];
  maxValue?: number;
  units?: string;
}

export class PolarChartDiagram extends BaseDiagram<PolarChartDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const cx = snapToGrid(width / 2);
    const cy = snapToGrid(height / 2 + 10);
    const maxRadius = 180;
    const count = this.options.categories.length;

    const maxVal = this.options.maxValue || Math.max(...this.options.categories.map(c => c.value));

    // 1. Background Grid Rings
    const rings = [0.25, 0.5, 0.75, 1.0];
    for (const rFactor of rings) {
      output.push(`  <circle cx="${cx}" cy="${cy}" r="${maxRadius * rFactor}" fill="none" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
    }

    // 2. Spokes and Lollipops
    this.options.categories.forEach((cat, idx) => {
      const angle = (idx * 360) / count;
      const r = (cat.value / maxVal) * maxRadius;

      const spokeEnd = polarToCartesianExact(cx, cy, maxRadius, angle);
      const markPoint = polarToCartesianExact(cx, cy, r, angle);
      const labelPoint = polarToCartesianExact(cx, cy, maxRadius + 24, angle);

      const stroke = cat.focal ? this.colors.accent : this.colors.muted;

      // Base Spoke
      output.push(`  <line x1="${cx}" y1="${cy}" x2="${spokeEnd.x}" y2="${spokeEnd.y}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);

      // Value Line
      output.push(`  <line x1="${cx}" y1="${cy}" x2="${markPoint.x}" y2="${markPoint.y}" stroke="${stroke}" stroke-width="${cat.focal ? 2.5 : 1.5}"/>`);

      // Lollipop Head
      output.push(`  <circle cx="${markPoint.x}" cy="${markPoint.y}" r="${cat.focal ? 6 : 4}" fill="${stroke}"/>`);

      // Label
      let textAnchor = 'middle';
      if (angle > 15 && angle < 165) textAnchor = 'start';
      else if (angle > 195 && angle < 345) textAnchor = 'end';

      output.push(`  <text x="${labelPoint.x}" y="${labelPoint.y + 4}" fill="${this.colors.ink}" font-size="10" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="${textAnchor}">${cat.name}</text>`);
    });

    return output.join('\n');
  }
}
