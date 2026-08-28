import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface HighLevelClusterNode {
  name: string;
  sublabel?: string;
  tag?: string;
  focal?: boolean;
}

export interface HighLevelTier {
  name: string;
  nodes: HighLevelClusterNode[];
  focal?: boolean;
}

export interface HighLevelDiagramOptions extends BaseDiagramOptions {
  clusterName?: string;
  tiers: HighLevelTier[];
}

export class HighLevelDiagram extends BaseDiagram<HighLevelDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const clusterX = 64;
    const clusterY = 48;
    const clusterW = width - 128;
    const clusterH = height - 96;

    // 1. Cluster Container
    output.push(`  <rect x="${clusterX}" y="${clusterY}" width="${clusterW}" height="${clusterH}" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.15)" stroke-width="0.8"/>`);
    const cTitle = this.options.clusterName || 'KUBERNETES / CLOUD CLUSTER';
    output.push(`  <rect x="${clusterX + 16}" y="${clusterY + 4}" width="${Math.max(64, cTitle.length * 7 + 16)}" height="12" rx="2" fill="${this.colors.paper}"/>`);
    output.push(`  <text x="${clusterX + 16 + Math.max(64, cTitle.length * 7 + 16) / 2}" y="${clusterY + 13}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.12em">${cTitle.toUpperCase()}</text>`);

    // 2. Tiers (Horizontal bands)
    const tierCount = this.options.tiers.length;
    const tierH = snapToGrid((clusterH - 48 - (tierCount - 1) * 16) / tierCount);
    const startY = clusterY + 32;

    this.options.tiers.forEach((tier, tIdx) => {
      const ty = snapToGrid(startY + tIdx * (tierH + 16));
      const tw = clusterW - 32;
      const tx = clusterX + 16;

      output.push(`  <rect x="${tx}" y="${ty}" width="${tw}" height="${tierH}" rx="6" fill="${this.colors.paper2}" stroke="${tier.focal ? this.colors.accent : this.colors.rule}" stroke-width="0.8"/>`);
      output.push(`  <text x="${tx + 12}" y="${ty + 16}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.1em">${tier.name.toUpperCase()}</text>`);

      // Tier Nodes
      const nCount = tier.nodes.length;
      if (nCount > 0) {
        const nW = snapToGrid((tw - 24 - (nCount - 1) * 16) / nCount);
        const nH = tierH - 28;
        const nY = ty + 20;

        tier.nodes.forEach((node, nIdx) => {
          const nx = snapToGrid(tx + 12 + nIdx * (nW + 16));
          const cx = snapToGrid(nx + nW / 2);
          const cy = snapToGrid(nY + nH / 2);

          const fill = node.focal ? this.colors.accentTint : '#ffffff';
          const stroke = node.focal ? this.colors.accent : this.colors.ink;

          output.push(`  <rect x="${nx}" y="${nY}" width="${nW}" height="${nH}" rx="4" fill="${this.colors.paper}"/>`);
          output.push(`  <rect x="${nx}" y="${nY}" width="${nW}" height="${nH}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);
          output.push(`  <text x="${cx}" y="${node.sublabel ? cy - 2 : cy + 4}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${node.name}</text>`);
          if (node.sublabel) {
            output.push(`  <text x="${cx}" y="${cy + 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${node.sublabel}</text>`);
          }
        });
      }
    });

    return output.join('\n');
  }
}
