import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export type FlowchartNodeType = 'start' | 'end' | 'step' | 'decision' | 'merge';

export interface FlowchartNode {
  id: string;
  label: string;
  sublabel?: string;
  type: FlowchartNodeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  focal?: boolean;
}

export interface FlowchartConnection {
  from: string;
  to: string;
  label?: string;
  focal?: boolean;
}

export interface FlowchartDiagramOptions extends BaseDiagramOptions {
  nodes: FlowchartNode[];
  connections: FlowchartConnection[];
}

export class FlowchartDiagram extends BaseDiagram<FlowchartDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const nodeMap = new Map<string, FlowchartNode & { w: number; h: number }>();

    for (const node of this.options.nodes) {
      const w = node.width || (node.type === 'decision' ? 140 : node.type === 'merge' ? 16 : 140);
      const h = node.height || (node.type === 'decision' ? 64 : node.type === 'merge' ? 16 : 56);
      nodeMap.set(node.id, { ...node, w, h });
    }

    // 1. Arrows
    for (const conn of this.options.connections) {
      const src = nodeMap.get(conn.from);
      const dst = nodeMap.get(conn.to);
      if (!src || !dst) continue;

      const x1 = snapToGrid(src.x + src.w / 2);
      const y1 = snapToGrid(src.y + src.h);
      const x2 = snapToGrid(dst.x + dst.w / 2);
      const y2 = snapToGrid(dst.y);

      const stroke = conn.focal ? this.colors.accent : this.colors.muted;
      const marker = conn.focal ? `url(#${this.id}-arrow-accent)` : `url(#${this.id}-arrow)`;

      if (x1 === x2) {
        output.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2" marker-end="${marker}"/>`);
        if (conn.label) {
          const midY = snapToGrid((y1 + y2) / 2);
          output.push(`  <rect x="${x1 + 8}" y="${midY - 6}" width="${Math.max(28, conn.label.length * 7)}" height="12" rx="2" fill="${this.colors.paper}"/>`);
          output.push(`  <text x="${x1 + 12}" y="${midY + 3}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}">${conn.label}</text>`);
        }
      } else {
        const midY = snapToGrid((y1 + y2) / 2);
        output.push(`  <path d="M ${x1},${y1} V ${midY - 8} Q ${x1},${midY} ${x1 + (x2 > x1 ? 8 : -8)},${midY} H ${x2 - (x2 > x1 ? 8 : -8)} Q ${x2},${midY} ${x2},${midY + 8} V ${y2}" fill="none" stroke="${stroke}" stroke-width="1.2" marker-end="${marker}"/>`);
        if (conn.label) {
          const midX = snapToGrid((x1 + x2) / 2);
          output.push(`  <rect x="${midX - 16}" y="${midY - 14}" width="${Math.max(32, conn.label.length * 7)}" height="12" rx="2" fill="${this.colors.paper}"/>`);
          output.push(`  <text x="${midX}" y="${midY - 5}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${conn.label}</text>`);
        }
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

      if (node.type === 'start' || node.type === 'end') {
        output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${this.colors.paper}"/>`);
        output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`);
        output.push(`  <text x="${cx}" y="${cy + 4}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${node.label}</text>`);
      } else if (node.type === 'decision') {
        // Diamond
        const pts = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
        output.push(`  <polygon points="${pts}" fill="${this.colors.paper}"/>`);
        output.push(`  <polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`);
        output.push(`  <text x="${cx}" y="${cy + 4}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${node.label}</text>`);
      } else if (node.type === 'merge') {
        output.push(`  <circle cx="${cx}" cy="${cy}" r="4" fill="${this.colors.ink}"/>`);
      } else {
        // Step / Action
        output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
        output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);
        output.push(`  <text x="${cx}" y="${node.sublabel ? cy - 2 : cy + 4}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${node.label}</text>`);
        if (node.sublabel) {
          output.push(`  <text x="${cx}" y="${cy + 12}" fill="${this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${node.sublabel}</text>`);
        }
      }
    }

    return output.join('\n');
  }
}
