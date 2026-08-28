import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface TreemapItem {
  id: string;
  name: string;
  value: number;
  sublabel?: string;
  focal?: boolean;
}

export interface TreemapDiagramOptions extends BaseDiagramOptions {
  items: TreemapItem[];
  units?: string;
}

export class TreemapDiagram extends BaseDiagram<TreemapDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const startX = 64;
    const startY = 48;
    const canvasW = width - 128;
    const canvasH = height - 96;

    const totalValue = this.options.items.reduce((sum, item) => sum + item.value, 0);
    if (totalValue === 0) return '';

    // Squarified/Slice layout algorithm
    // For simplicity and editorial aesthetics, split into columns and slice
    const sorted = [...this.options.items].sort((a, b) => b.value - a.value);

    // Left large / Right smaller breakdown
    const leftItems: TreemapItem[] = [];
    const rightItems: TreemapItem[] = [];
    let leftSum = 0;
    let rightSum = 0;

    for (const item of sorted) {
      if (leftSum <= rightSum) {
        leftItems.push(item);
        leftSum += item.value;
      } else {
        rightItems.push(item);
        rightSum += item.value;
      }
    }

    const leftW = snapToGrid((canvasW * leftSum) / totalValue);
    const rightW = canvasW - leftW;

    // Render left column
    let currY = startY;
    for (const item of leftItems) {
      const itemH = snapToGrid((canvasH * item.value) / leftSum);
      this.renderCell(output, startX, currY, leftW, itemH, item);
      currY += itemH;
    }

    // Render right column
    currY = startY;
    for (const item of rightItems) {
      const itemH = snapToGrid((canvasH * item.value) / rightSum);
      this.renderCell(output, startX + leftW, currY, rightW, itemH, item);
      currY += itemH;
    }

    return output.join('\n');
  }

  private renderCell(output: string[], x: number, y: number, w: number, h: number, item: TreemapItem) {
    const fill = item.focal ? this.colors.accentTint : '#ffffff';
    const stroke = item.focal ? this.colors.accent : this.colors.ruleSolid;
    const cx = snapToGrid(x + w / 2);
    const cy = snapToGrid(y + h / 2);

    output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${this.colors.paper}"/>`);
    output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);

    const valStr = `${item.value.toLocaleString()} ${this.options.units || ''}`.trim();
    output.push(`  <text x="${cx}" y="${cy - 2}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${item.name}</text>`);
    output.push(`  <text x="${cx}" y="${cy + 14}" fill="${this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${valStr}</text>`);
  }
}
