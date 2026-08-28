import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface OrgNode {
  id: string;
  role: string;
  name?: string;
  team?: string;
  parentId?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  focal?: boolean;
}

export interface OrgChartDiagramOptions extends BaseDiagramOptions {
  nodes: OrgNode[];
}

export class OrgChartDiagram extends BaseDiagram<OrgChartDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const nodeMap = new Map<string, OrgNode & { w: number; h: number }>();

    for (const node of this.options.nodes) {
      const w = node.width || 152;
      const h = node.height || 64;
      nodeMap.set(node.id, { ...node, w, h });
    }

    // 1. Reporting lines
    for (const node of this.options.nodes) {
      if (!node.parentId) continue;
      const parent = nodeMap.get(node.parentId);
      if (!parent) continue;

      const x1 = snapToGrid(parent.x + parent.w / 2);
      const y1 = snapToGrid(parent.y + parent.h);
      const x2 = snapToGrid(node.x + (node.width || 152) / 2);
      const y2 = snapToGrid(node.y);

      const stroke = node.focal ? this.colors.accent : this.colors.muted;

      if (x1 === x2) {
        output.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2"/>`);
      } else {
        const midY = snapToGrid((y1 + y2) / 2);
        output.push(`  <path d="M ${x1},${y1} V ${midY - 8} Q ${x1},${midY} ${x1 + (x2 > x1 ? 8 : -8)},${midY} H ${x2 - (x2 > x1 ? 8 : -8)} Q ${x2},${midY} ${x2},${midY + 8} V ${y2}" fill="none" stroke="${stroke}" stroke-width="1.2"/>`);
      }
    }

    // 2. Cards
    for (const node of this.options.nodes) {
      const info = nodeMap.get(node.id)!;
      const x = snapToGrid(info.x);
      const y = snapToGrid(info.y);
      const w = snapToGrid(info.w);
      const h = snapToGrid(info.h);
      const cx = snapToGrid(x + w / 2);
      const cy = snapToGrid(y + h / 2);

      const fill = node.focal ? this.colors.accentTint : '#ffffff';
      const stroke = node.focal ? this.colors.accent : this.colors.ink;

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);

      if (node.team) {
        output.push(`  <text x="${cx}" y="${y + 16}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.1em">${node.team.toUpperCase()}</text>`);
      }

      output.push(`  <text x="${cx}" y="${node.team ? cy + 4 : cy - 2}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${node.role}</text>`);
      if (node.name) {
        output.push(`  <text x="${cx}" y="${node.team ? cy + 18 : cy + 14}" fill="${this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${node.name}</text>`);
      }
    }

    return output.join('\n');
  }
}
