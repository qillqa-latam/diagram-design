import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid, polarToCartesianExact } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';
import { DEFAULT_LIGHT_SERIES } from '../../tokens/palettes.js';

export interface RadarAxis {
  name: string;
  max: number;
}

export interface RadarSeries {
  name: string;
  values: number[];
  color?: string;
  focal?: boolean;
}

export interface RadarDiagramOptions extends BaseDiagramOptions {
  axes: RadarAxis[];
  series: RadarSeries[];
}

export class RadarDiagram extends BaseDiagram<RadarDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const cx = snapToGrid(width / 2);
    const cy = snapToGrid(height / 2 + 10);
    const radius = 180;
    const axisCount = this.options.axes.length;

    // 1. Concentric Grid Rings
    const rings = [0.25, 0.5, 0.75, 1.0];
    for (const rFactor of rings) {
      const ringR = radius * rFactor;
      const points: string[] = [];
      for (let i = 0; i < axisCount; i++) {
        const angle = (i * 360) / axisCount;
        const p = polarToCartesianExact(cx, cy, ringR, angle);
        points.push(`${p.x},${p.y}`);
      }
      output.push(`  <polygon points="${points.join(' ')}" fill="none" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
    }

    // 2. Spokes & Axis Labels
    for (let i = 0; i < axisCount; i++) {
      const axis = this.options.axes[i]!;
      const angle = (i * 360) / axisCount;
      const endPoint = polarToCartesianExact(cx, cy, radius, angle);
      const labelPoint = polarToCartesianExact(cx, cy, radius + 24, angle);

      output.push(`  <line x1="${cx}" y1="${cy}" x2="${endPoint.x}" y2="${endPoint.y}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);

      let textAnchor = 'middle';
      if (angle > 15 && angle < 165) textAnchor = 'start';
      else if (angle > 195 && angle < 345) textAnchor = 'end';

      output.push(`  <text x="${labelPoint.x}" y="${labelPoint.y + 4}" fill="${this.colors.ink}" font-size="10" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="${textAnchor}">${axis.name}</text>`);
    }

    // 3. Series Polygons
    const defaultColors = [
      this.colors.accent,
      DEFAULT_LIGHT_SERIES.series1,
      DEFAULT_LIGHT_SERIES.series2,
      DEFAULT_LIGHT_SERIES.series3
    ];

    this.options.series.forEach((s, sIdx) => {
      const stroke = s.focal ? this.colors.accent : (s.color || defaultColors[sIdx % defaultColors.length]!);
      const fill = s.focal ? this.colors.accentTint : 'rgba(79,93,117,0.12)';

      const points: string[] = [];
      s.values.forEach((val, i) => {
        const axis = this.options.axes[i]!;
        const r = (val / axis.max) * radius;
        const angle = (i * 360) / axisCount;
        const p = polarToCartesianExact(cx, cy, r, angle);
        points.push(`${p.x},${p.y}`);
      });

      output.push(`  <polygon points="${points.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${s.focal ? 2 : 1.4}"/>`);
      for (const pt of points) {
        const [px, py] = pt.split(',');
        output.push(`  <circle cx="${px}" cy="${py}" r="${s.focal ? 3.5 : 2.5}" fill="${stroke}"/>`);
      }
    });

    return output.join('\n');
  }
}
