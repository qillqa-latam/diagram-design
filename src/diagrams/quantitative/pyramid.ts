import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface PyramidTier {
  name: string;
  sublabel?: string;
  metric?: string;
  focal?: boolean;
}

export interface PyramidDiagramOptions extends BaseDiagramOptions {
  tiers: PyramidTier[];
}

export class PyramidDiagram extends BaseDiagram<PyramidDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const cx = snapToGrid(width / 2);
    const startY = 64;
    const pyramidH = height - 128;
    const count = this.options.tiers.length;
    const tierH = snapToGrid(pyramidH / count);

    const topWidth = 100;
    const bottomWidth = 500;

    this.options.tiers.forEach((tier, idx) => {
      const y0 = startY + idx * tierH;
      const y1 = y0 + tierH;

      const t0 = idx / count;
      const t1 = (idx + 1) / count;

      const w0 = topWidth + t0 * (bottomWidth - topWidth);
      const w1 = topWidth + t1 * (bottomWidth - topWidth);

      const p1x = snapToGrid(cx - w0 / 2);
      const p2x = snapToGrid(cx + w0 / 2);
      const p3x = snapToGrid(cx + w1 / 2);
      const p4x = snapToGrid(cx - w1 / 2);

      const fill = tier.focal ? this.colors.accentTint : (idx % 2 === 0 ? '#ffffff' : this.colors.paper2);
      const stroke = tier.focal ? this.colors.accent : this.colors.ruleSolid;

      output.push(`  <polygon points="${p1x},${y0} ${p2x},${y0} ${p3x},${y1} ${p4x},${y1}" fill="${fill}" stroke="${stroke}" stroke-width="${tier.focal ? 1.4 : 1}"/>`);

      // Text inside tier
      const cy = snapToGrid(y0 + tierH / 2);
      output.push(`  <text x="${cx}" y="${tier.sublabel || tier.metric ? cy - 2 : cy + 4}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${tier.name}</text>`);

      if (tier.sublabel || tier.metric) {
        const sub = [tier.metric, tier.sublabel].filter(Boolean).join(' · ');
        output.push(`  <text x="${cx}" y="${cy + 12}" fill="${tier.focal ? this.colors.accent : this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${sub}</text>`);
      }
    });

    return output.join('\n');
  }
}
