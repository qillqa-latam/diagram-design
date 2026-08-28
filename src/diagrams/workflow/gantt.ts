import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface GanttTask {
  name: string;
  startCol: number; // 0-indexed column
  spanCols: number;
  isMilestone?: boolean;
  progress?: number; // 0 to 1
  focal?: boolean;
}

export interface GanttPhase {
  name: string;
  tasks: GanttTask[];
}

export interface GanttDiagramOptions extends BaseDiagramOptions {
  columns: string[]; // e.g. ["W1", "W2", "W3", "W4", "W5", "W6"]
  phases: GanttPhase[];
}

export class GanttDiagram extends BaseDiagram<GanttDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const labelColW = 160;
    const startX = 64;
    const startY = 48;
    const chartW = width - 128;
    const gridW = chartW - labelColW;
    const colCount = this.options.columns.length;
    const colW = gridW / colCount;

    // 1. Column Headers
    this.options.columns.forEach((col, idx) => {
      const cx = snapToGrid(startX + labelColW + idx * colW);
      output.push(`  <line x1="${cx}" y1="${startY}" x2="${cx}" y2="${height - 48}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
      output.push(`  <text x="${cx + colW / 2}" y="${startY + 16}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${col.toUpperCase()}</text>`);
    });
    output.push(`  <line x1="${startX}" y1="${startY + 24}" x2="${startX + chartW}" y2="${startY + 24}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);

    // 2. Task Rows
    let currY = startY + 36;
    const rowH = 32;

    for (const phase of this.options.phases) {
      // Phase Header
      output.push(`  <text x="${startX}" y="${currY + 16}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.1em">${phase.name.toUpperCase()}</text>`);
      currY += 24;

      for (const task of phase.tasks) {
        output.push(`  <text x="${startX + 12}" y="${currY + 18}" fill="${this.colors.ink}" font-size="11" font-family="${FONT_FAMILIES.sans}">${task.name}</text>`);

        const bx = snapToGrid(startX + labelColW + task.startCol * colW);
        const bw = snapToGrid(task.spanCols * colW - 8);
        const by = currY + 4;
        const bh = 20;

        if (task.isMilestone) {
          // Diamond
          const mcx = bx + bw / 2;
          const mcy = by + bh / 2;
          output.push(`  <polygon points="${mcx},${mcy - 8} ${mcx + 8},${mcy} ${mcx},${mcy + 8} ${mcx - 8},${mcy}" fill="${task.focal ? this.colors.accent : this.colors.ink}"/>`);
        } else {
          // Bar
          const fill = task.focal ? this.colors.accent : this.colors.muted;
          output.push(`  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="${fill}" opacity="0.3"/>`);
          if (task.progress) {
            output.push(`  <rect x="${bx}" y="${by}" width="${bw * task.progress}" height="${bh}" rx="4" fill="${fill}"/>`);
          } else {
            output.push(`  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="4" fill="${fill}"/>`);
          }
        }

        currY += rowH;
      }
    }

    return output.join('\n');
  }
}
