import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface DataFlowNode {
  id: string;
  name: string;
  sublabel?: string;
  tag?: string;
  role?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  focal?: boolean;
}

export interface DataFlowEdge {
  from: string;
  to: string;
  label?: string;
  focal?: boolean;
}

export interface DataFlowDiagramOptions extends BaseDiagramOptions {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
}

export class DataFlowDiagram extends BaseDiagram<DataFlowDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const nodeMap = new Map<string, DataFlowNode & { w: number; h: number }>();

    for (const node of this.options.nodes) {
      const w = node.width || 140;
      const h = node.height || 64;
      nodeMap.set(node.id, { ...node, w, h });
    }

    // 1. Edges (Drawn before nodes)
    for (const edge of this.options.edges) {
      const src = nodeMap.get(edge.from);
      const dst = nodeMap.get(edge.to);
      if (!src || !dst) continue;

      const isRight = dst.x > src.x;
      const x1 = snapToGrid(isRight ? src.x + src.w : src.x);
      const y1 = snapToGrid(src.y + src.h / 2);
      const x2 = snapToGrid(isRight ? dst.x : dst.x + dst.w);
      const y2 = snapToGrid(dst.y + dst.h / 2);

      const stroke = edge.focal ? this.colors.accent : this.colors.muted;
      const marker = edge.focal ? `url(#${this.id}-arrow-accent)` : `url(#${this.id}-arrow)`;
      const midX = snapToGrid((x1 + x2) / 2);

      if (Math.abs(y1 - y2) < 4) {
        output.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2" marker-end="${marker}"/>`);
      } else {
        output.push(`  <path d="M ${x1},${y1} H ${midX - (isRight ? 8 : -8)} Q ${midX},${y1} ${midX},${y1 + (y2 > y1 ? 8 : -8)} V ${y2 - (y2 > y1 ? 8 : -8)} Q ${midX},${y2} ${midX + (isRight ? 8 : -8)},${y2} H ${x2}" fill="none" stroke="${stroke}" stroke-width="1.2" marker-end="${marker}"/>`);
      }

      if (edge.label) {
        const midY = snapToGrid((y1 + y2) / 2);
        const labelW = Math.max(32, edge.label.length * 6.5 + 8);
        output.push(`  <rect x="${midX - labelW / 2}" y="${midY - 12}" width="${labelW}" height="12" rx="2" fill="${this.colors.paper}"/>`);
        output.push(`  <text x="${midX}" y="${midY - 3}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${edge.label.toUpperCase()}</text>`);
      }
    }

    // 2. Nodes
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

      if (node.tag || node.role) {
        const tagText = node.tag || node.role || '';
        output.push(`  <rect x="${x + 8}" y="${y + 6}" width="${Math.max(28, tagText.length * 6.5 + 8)}" height="12" rx="2" fill="transparent" stroke="${stroke}" stroke-opacity="0.4" stroke-width="0.8"/>`);
        output.push(`  <text x="${x + 8 + Math.max(28, tagText.length * 6.5 + 8) / 2}" y="${y + 15}" fill="${stroke}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${tagText.toUpperCase()}</text>`);
      }

      output.push(`  <text x="${cx}" y="${node.sublabel ? cy + 2 : cy + 4}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${node.name}</text>`);
      if (node.sublabel) {
        output.push(`  <text x="${cx}" y="${cy + 16}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${node.sublabel}</text>`);
      }
    }

    return output.join('\n');
  }
}
