import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';
import { DEFAULT_LIGHT_SERIES } from '../../tokens/palettes.js';

export interface LineSeries {
  name: string;
  data: number[];
  color?: string;
  focal?: boolean;
}

export interface LineChartDiagramOptions extends BaseDiagramOptions {
  xLabels: string[];
  series: LineSeries[];
  minY?: number;
  maxY?: number;
  smooth?: boolean;
}

export class LineChartDiagram extends BaseDiagram<LineChartDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const startX = 64;
    const startY = 48;
    const chartW = width - 128;
    const chartH = height - 128;
    const baselineY = startY + chartH;

    const allVals = this.options.series.flatMap(s => s.data);
    const minVal = this.options.minY ?? Math.min(...allVals, 0);
    const maxVal = this.options.maxY ?? Math.max(...allVals);

    const xCount = this.options.xLabels.length;
    const xStep = chartW / Math.max(1, xCount - 1);

    // 1. Grid & Axes
    output.push(`  <line x1="${startX}" y1="${baselineY}" x2="${startX + chartW}" y2="${baselineY}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);

    this.options.xLabels.forEach((label, idx) => {
      const x = snapToGrid(startX + idx * xStep);
      output.push(`  <line x1="${x}" y1="${baselineY}" x2="${x}" y2="${baselineY + 4}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);
      output.push(`  <text x="${x}" y="${baselineY + 18}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${label.toUpperCase()}</text>`);
    });

    // 2. Series Lines
    const defaultColors = [
      this.colors.accent,
      DEFAULT_LIGHT_SERIES.series1,
      DEFAULT_LIGHT_SERIES.series2,
      DEFAULT_LIGHT_SERIES.series3
    ];

    this.options.series.forEach((s, sIdx) => {
      const stroke = s.focal ? this.colors.accent : (s.color || defaultColors[sIdx % defaultColors.length]!);
      const points = s.data.map((val, idx) => {
        const x = snapToGrid(startX + idx * xStep);
        const normY = (val - minVal) / (maxVal - minVal || 1);
        const y = snapToGrid(baselineY - normY * chartH);
        return { x, y };
      });

      if (points.length > 1) {
        let pathD = `M ${points[0]!.x},${points[0]!.y}`;
        for (let i = 1; i < points.length; i++) {
          pathD += ` L ${points[i]!.x},${points[i]!.y}`;
        }
        output.push(`  <path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="${s.focal ? 2.5 : 1.5}"/>`);
      }

      for (const pt of points) {
        output.push(`  <circle cx="${pt.x}" cy="${pt.y}" r="${s.focal ? 4 : 3}" fill="${stroke}"/>`);
      }
    });

    return output.join('\n');
  }
}
