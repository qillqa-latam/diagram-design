import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface SankeyNode {
  id: string;
  name: string;
  column: 0 | 1 | 2; // Exactly 3 stage columns per spec
  quantity: number;
  focal?: boolean;
}

export interface SankeyFlow {
  from: string;
  to: string;
  quantity: number;
  focal?: boolean;
}

export interface SankeyDiagramOptions extends BaseDiagramOptions {
  columnHeaders?: [string, string, string];
  nodes: SankeyNode[];
  flows: SankeyFlow[];
  units?: string;
  pxPerUnit?: number;
}

export class SankeyDiagram extends BaseDiagram<SankeyDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    // 1. Setup Scale and Columns
    const k = this.options.pxPerUnit || 0.02;
    const colX = [
      snapToGrid(width * 0.18),
      snapToGrid(width * 0.50),
      snapToGrid(width * 0.82)
    ] as const;

    const barWidth = 12;

    // Group nodes by column
    const colNodes: [SankeyNode[], SankeyNode[], SankeyNode[]] = [[], [], []];
    for (const node of this.options.nodes) {
      colNodes[node.column].push(node);
    }

    // Compute layout positions for nodes
    const nodeGeometry = new Map<string, {
      x: number;
      y: number;
      w: number;
      h: number;
      outOffset: number;
      inOffset: number;
      node: SankeyNode;
    }>();

    const startY = 80;
    const maxAvailableH = height - 160;

    colNodes.forEach((nodes, colIdx) => {
      const totalH = nodes.reduce((sum, n) => sum + snapToGrid(n.quantity * k), 0);
      const gapCount = Math.max(1, nodes.length - 1);
      const gap = snapToGrid((maxAvailableH - totalH) / (gapCount + 1));
      let currentY = startY + gap;

      for (const node of nodes) {
        const h = snapToGrid(node.quantity * k);
        const x = colX[colIdx]!;
        nodeGeometry.set(node.id, {
          x,
          y: currentY,
          w: barWidth,
          h,
          outOffset: 0,
          inOffset: 0,
          node
        });
        currentY += h + gap;
      }
    });

    // 2. Column Headers
    if (this.options.columnHeaders) {
      this.options.columnHeaders.forEach((header, idx) => {
        const cx = colX[idx]! + barWidth / 2;
        output.push(`  <text x="${cx}" y="48" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.12em">${header.toUpperCase()}</text>`);
      });
    }

    // 3. Flows / Ribbons (Drawn before node bars)
    // First non-focal flows, then focal flows on top
    const sortedFlows = [...this.options.flows].sort((a, b) => (a.focal ? 1 : 0) - (b.focal ? 1 : 0));

    for (const flow of sortedFlows) {
      const src = nodeGeometry.get(flow.from);
      const dst = nodeGeometry.get(flow.to);
      if (!src || !dst) continue;

      const flowH = snapToGrid(flow.quantity * k);
      const x0 = src.x + src.w;
      const y0_top = src.y + src.outOffset;
      const y0_bot = y0_top + flowH;
      src.outOffset += flowH;

      const x1 = dst.x;
      const y1_top = dst.y + dst.inOffset;
      const y1_bot = y1_top + flowH;
      dst.inOffset += flowH;

      // Both Bézier control points sit at corridor midline X! (Critical Rule from type-sankey.md)
      const midX = (x0 + x1) / 2;

      const ribbonD = [
        `M ${x0},${y0_top}`,
        `C ${midX},${y0_top} ${midX},${y1_top} ${x1},${y1_top}`,
        `V ${y1_bot}`,
        `C ${midX},${y1_bot} ${midX},${y0_bot} ${x0},${y0_bot}`,
        'Z'
      ].join(' ');

      const fill = flow.focal ? this.colors.accent : this.colors.muted;
      const opacity = flow.focal ? '0.28' : '0.18';

      output.push(`  <path d="${ribbonD}" fill="${fill}" opacity="${opacity}"/>`);
    }

    // 4. Node Bars
    for (const [, geom] of nodeGeometry) {
      const { x, y, w, h, node } = geom;
      const fill = node.focal ? this.colors.accent : this.colors.ink;

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`);

      // 5. Node Labels
      const qtyStr = `${node.quantity.toLocaleString()} ${this.options.units || ''}`.trim();
      const cy = y + h / 2;

      if (node.column === 0) {
        // Col 1: Outside bar, text-anchor="end"
        output.push(`  <text x="${x - 12}" y="${cy - 2}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="end">${node.name}</text>`);
        output.push(`  <text x="${x - 12}" y="${cy + 12}" fill="${this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="end">${qtyStr}</text>`);
      } else if (node.column === 1) {
        // Col 2: In gutter above bar, text-anchor="middle"
        output.push(`  <text x="${x + w / 2}" y="${y - 14}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${node.name}</text>`);
        output.push(`  <text x="${x + w / 2}" y="${y - 4}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${qtyStr}</text>`);
      } else {
        // Col 3: Outside bar, text-anchor="start"
        output.push(`  <text x="${x + w + 12}" y="${cy - 2}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="start">${node.name}</text>`);
        output.push(`  <text x="${x + w + 12}" y="${cy + 12}" fill="${this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="start">${qtyStr}</text>`);
      }
    }

    return output.join('\n');
  }
}
