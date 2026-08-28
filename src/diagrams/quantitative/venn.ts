import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface VennSet {
  label: string;
  items?: string[];
  focal?: boolean;
}

export interface VennDiagramOptions extends BaseDiagramOptions {
  sets: [VennSet, VennSet] | [VennSet, VennSet, VennSet];
  intersectionLabel?: string;
}

export class VennDiagram extends BaseDiagram<VennDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const cx = snapToGrid(width / 2);
    const cy = snapToGrid(height / 2 + 10);
    const r = 140;

    if (this.options.sets.length === 2) {
      const [setA, setB] = this.options.sets;
      const offset = 80;
      const c1x = cx - offset;
      const c2x = cx + offset;

      // Circle 1
      output.push(`  <circle cx="${c1x}" cy="${cy}" r="${r}" fill="${setA.focal ? this.colors.accentTint : 'rgba(79,93,117,0.08)'}" stroke="${setA.focal ? this.colors.accent : this.colors.muted}" stroke-width="1.2"/>`);
      output.push(`  <text x="${c1x - 50}" y="${cy}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${setA.label}</text>`);

      // Circle 2
      output.push(`  <circle cx="${c2x}" cy="${cy}" r="${r}" fill="${setB.focal ? this.colors.accentTint : 'rgba(79,93,117,0.08)'}" stroke="${setB.focal ? this.colors.accent : this.colors.muted}" stroke-width="1.2"/>`);
      output.push(`  <text x="${c2x + 50}" y="${cy}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${setB.label}</text>`);

      // Intersection
      if (this.options.intersectionLabel) {
        output.push(`  <text x="${cx}" y="${cy}" fill="${this.colors.accent}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${this.options.intersectionLabel}</text>`);
      }
    } else {
      const [setA, setB, setC] = this.options.sets;
      const offset = 64;
      const c1x = cx - offset;
      const c1y = cy - 40;
      const c2x = cx + offset;
      const c2y = cy - 40;
      const c3x = cx;
      const c3y = cy + 60;

      output.push(`  <circle cx="${c1x}" cy="${c1y}" r="${r}" fill="rgba(79,93,117,0.06)" stroke="${this.colors.muted}" stroke-width="1.2"/>`);
      output.push(`  <circle cx="${c2x}" cy="${c2y}" r="${r}" fill="rgba(79,93,117,0.06)" stroke="${this.colors.muted}" stroke-width="1.2"/>`);
      output.push(`  <circle cx="${c3x}" cy="${c3y}" r="${r}" fill="rgba(79,93,117,0.06)" stroke="${this.colors.muted}" stroke-width="1.2"/>`);

      output.push(`  <text x="${c1x - 50}" y="${c1y - 30}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${setA.label}</text>`);
      output.push(`  <text x="${c2x + 50}" y="${c2y - 30}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${setB.label}</text>`);
      output.push(`  <text x="${c3x}" y="${c3y + 60}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${setC.label}</text>`);

      if (this.options.intersectionLabel) {
        output.push(`  <text x="${cx}" y="${cy}" fill="${this.colors.accent}" font-size="10" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${this.options.intersectionLabel}</text>`);
      }
    }

    return output.join('\n');
  }
}
