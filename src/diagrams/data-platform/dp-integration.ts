import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface IntegrationNode {
  id: string;
  name: string;
  sublabel?: string;
  tag?: string;
  focal?: boolean;
}

export interface DpIntegrationDiagramOptions extends BaseDiagramOptions {
  sources: IntegrationNode[];
  core: IntegrationNode[];
  consumers: IntegrationNode[];
}

export class DpIntegrationDiagram extends BaseDiagram<DpIntegrationDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const startX = 64;
    const startY = 48;
    const availableW = width - 128;
    const colW = snapToGrid((availableW - 80) / 3);
    const colH = height - 96;

    const sections = [
      { title: 'SOURCES & INGESTION', nodes: this.options.sources, x: startX },
      { title: 'CORE PLATFORM / LAKEHOUSE', nodes: this.options.core, x: startX + colW + 40, isCore: true },
      { title: 'CONSUMERS & ANALYTICS', nodes: this.options.consumers, x: startX + (colW + 40) * 2 }
    ];

    for (const sec of sections) {
      const sx = snapToGrid(sec.x);

      // Section Container
      output.push(`  <rect x="${sx}" y="${startY}" width="${colW}" height="${colH}" rx="8" fill="rgba(45,49,66,0.02)" stroke="${sec.isCore ? this.colors.ink : this.colors.rule}" stroke-width="${sec.isCore ? 1 : 0.8}"/>`);
      output.push(`  <text x="${sx + colW / 2}" y="${startY + 24}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.1em">${sec.title}</text>`);

      // Nodes
      const nCount = sec.nodes.length;
      if (nCount > 0) {
        const nH = 52;
        const nW = colW - 24;
        const totalNodesH = nCount * nH + (nCount - 1) * 16;
        let currY = snapToGrid(startY + (colH - totalNodesH) / 2 + 16);

        for (const node of sec.nodes) {
          const nx = sx + 12;
          const cx = nx + nW / 2;
          const cy = currY + nH / 2;

          const fill = node.focal ? this.colors.accentTint : '#ffffff';
          const stroke = node.focal ? this.colors.accent : this.colors.ruleSolid;

          output.push(`  <rect x="${nx}" y="${currY}" width="${nW}" height="${nH}" rx="6" fill="${this.colors.paper}"/>`);
          output.push(`  <rect x="${nx}" y="${currY}" width="${nW}" height="${nH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);

          output.push(`  <text x="${cx}" y="${node.sublabel ? cy - 2 : cy + 4}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${node.name}</text>`);
          if (node.sublabel) {
            output.push(`  <text x="${cx}" y="${cy + 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${node.sublabel}</text>`);
          }

          currY += nH + 16;
        }
      }
    }

    // Connecting arrows between sections
    const arrow1X = startX + colW;
    const arrow2X = startX + colW + 40 + colW;
    const midY = snapToGrid(startY + colH / 2);

    output.push(`  <line x1="${arrow1X}" y1="${midY}" x2="${arrow1X + 40}" y2="${midY}" stroke="${this.colors.muted}" stroke-width="1.4" marker-end="url(#${this.id}-arrow)"/>`);
    output.push(`  <line x1="${arrow2X}" y1="${midY}" x2="${arrow2X + 40}" y2="${midY}" stroke="${this.colors.muted}" stroke-width="1.4" marker-end="url(#${this.id}-arrow)"/>`);

    return output.join('\n');
  }
}
