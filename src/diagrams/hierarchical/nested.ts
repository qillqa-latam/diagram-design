import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface NestedBox {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  focal?: boolean;
  children?: NestedBox[];
}

export interface NestedDiagramOptions extends BaseDiagramOptions {
  rootBoxes: NestedBox[];
}

export class NestedDiagram extends BaseDiagram<NestedDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];

    const renderBox = (box: NestedBox, depth: number) => {
      const x = snapToGrid(box.x);
      const y = snapToGrid(box.y);
      const w = snapToGrid(box.width);
      const h = snapToGrid(box.height);

      const hasChildren = box.children && box.children.length > 0;
      const stroke = box.focal ? this.colors.accent : this.colors.ink;
      const fill = box.focal ? this.colors.accentTint : hasChildren ? (depth === 0 ? 'rgba(45,49,66,0.02)' : 'rgba(45,49,66,0.04)') : '#ffffff';

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${hasChildren ? 0.8 : 1}"/>`);

      if (hasChildren) {
        output.push(`  <text x="${x + 12}" y="${y + 18}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.1em">${box.label.toUpperCase()}</text>`);
        if (box.sublabel) {
          output.push(`  <text x="${x + w - 12}" y="${y + 18}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="end">${box.sublabel}</text>`);
        }
        for (const child of box.children!) {
          renderBox(child, depth + 1);
        }
      } else {
        const cx = snapToGrid(x + w / 2);
        const cy = snapToGrid(y + h / 2);
        output.push(`  <text x="${cx}" y="${box.sublabel ? cy - 2 : cy + 4}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${box.label}</text>`);
        if (box.sublabel) {
          output.push(`  <text x="${cx}" y="${cy + 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${box.sublabel}</text>`);
        }
      }
    };

    for (const root of this.options.rootBoxes) {
      renderBox(root, 0);
    }

    return output.join('\n');
  }
}
