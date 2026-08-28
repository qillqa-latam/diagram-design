import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface QuadrantItem {
  label: string;
  sublabel?: string;
  x: number; // -1 to 1 (or normalized)
  y: number; // -1 to 1 (or normalized)
  focal?: boolean;
}

export interface QuadrantNames {
  topLeft?: string;
  topRight?: string;
  bottomLeft?: string;
  bottomRight?: string;
}

export interface QuadrantDiagramOptions extends BaseDiagramOptions {
  xAxisLabel: string;
  yAxisLabel: string;
  quadrantNames?: QuadrantNames;
  items: QuadrantItem[];
}

export class QuadrantDiagram extends BaseDiagram<QuadrantDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const startX = 64;
    const startY = 48;
    const boxW = width - 128;
    const boxH = height - 96;
    const midX = snapToGrid(startX + boxW / 2);
    const midY = snapToGrid(startY + boxH / 2);

    // 1. Quadrant Background Frame
    output.push(`  <rect x="${startX}" y="${startY}" width="${boxW}" height="${boxH}" rx="6" fill="rgba(45,49,66,0.02)" stroke="${this.colors.rule}" stroke-width="0.8"/>`);

    // 2. Axes Lines
    output.push(`  <line x1="${startX}" y1="${midY}" x2="${startX + boxW}" y2="${midY}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);
    output.push(`  <line x1="${midX}" y1="${startY}" x2="${midX}" y2="${startY + boxH}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);

    // Quadrant Corner Labels
    if (this.options.quadrantNames?.topLeft) {
      output.push(`  <text x="${startX + 12}" y="${startY + 20}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.1em">${this.options.quadrantNames.topLeft.toUpperCase()}</text>`);
    }
    if (this.options.quadrantNames?.topRight) {
      output.push(`  <text x="${startX + boxW - 12}" y="${startY + 20}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="end" letter-spacing="0.1em">${this.options.quadrantNames.topRight.toUpperCase()}</text>`);
    }
    if (this.options.quadrantNames?.bottomLeft) {
      output.push(`  <text x="${startX + 12}" y="${startY + boxH - 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.1em">${this.options.quadrantNames.bottomLeft.toUpperCase()}</text>`);
    }
    if (this.options.quadrantNames?.bottomRight) {
      output.push(`  <text x="${startX + boxW - 12}" y="${startY + boxH - 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="end" letter-spacing="0.1em">${this.options.quadrantNames.bottomRight.toUpperCase()}</text>`);
    }

    // 3. Axis Labels
    output.push(`  <text x="${startX + boxW / 2}" y="${startY + boxH + 24}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${this.options.xAxisLabel.toUpperCase()} →</text>`);
    output.push(`  <text x="${startX - 20}" y="${midY}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" transform="rotate(-90, ${startX - 20}, ${midY})">${this.options.yAxisLabel.toUpperCase()} →</text>`);

    // 4. Placed Items
    for (const item of this.options.items) {
      // Coordinates normalized from -1..1 to box coordinates
      const px = snapToGrid(midX + (item.x * (boxW / 2 - 32)));
      const py = snapToGrid(midY - (item.y * (boxH / 2 - 32)));

      const fill = item.focal ? this.colors.accentTint : '#ffffff';
      const stroke = item.focal ? this.colors.accent : this.colors.ink;

      const cardW = 100;
      const cardH = item.sublabel ? 36 : 28;

      output.push(`  <rect x="${px - cardW / 2}" y="${py - cardH / 2}" width="${cardW}" height="${cardH}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${item.focal ? 1.2 : 0.8}"/>`);
      output.push(`  <text x="${px}" y="${item.sublabel ? py - 2 : py + 4}" fill="${this.colors.ink}" font-size="10" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${item.label}</text>`);
      if (item.sublabel) {
        output.push(`  <text x="${px}" y="${py + 10}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${item.sublabel}</text>`);
      }
    }

    return output.join('\n');
  }
}
