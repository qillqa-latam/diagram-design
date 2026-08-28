import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface TreeNode {
  id: string;
  label: string;
  sublabel?: string;
  tag?: string;
  parentId?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  focal?: boolean;
  children?: TreeNode[];
}

export interface TreeDiagramOptions extends BaseDiagramOptions {
  root: TreeNode;
  orientation?: 'vertical' | 'horizontal';
}

export class TreeDiagram extends BaseDiagram<TreeDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const flattenedNodes: Array<TreeNode & { x: number; y: number; w: number; h: number; level: number }> = [];
    const nodeMap = new Map<string, typeof flattenedNodes[0]>();

    // Compute automatic layout if x/y not pinned
    const levelNodes: TreeNode[][] = [];

    const traverse = (node: TreeNode, level: number) => {
      if (!levelNodes[level]) levelNodes[level] = [];
      levelNodes[level]!.push(node);
      if (node.children) {
        for (const child of node.children) {
          child.parentId = node.id;
          traverse(child, level + 1);
        }
      }
    };
    traverse(this.options.root, 0);

    const { width } = this.viewBox;
    const nodeW = 140;
    const nodeH = 56;
    const levelGap = 80;

    levelNodes.forEach((nodesInLevel, level) => {
      const count = nodesInLevel.length;
      const totalWidth = count * nodeW + (count - 1) * 32;
      const startX = (width - totalWidth) / 2;

      nodesInLevel.forEach((node, idx) => {
        const x = node.x !== undefined ? snapToGrid(node.x) : snapToGrid(startX + idx * (nodeW + 32));
        const y = node.y !== undefined ? snapToGrid(node.y) : snapToGrid(48 + level * (nodeH + levelGap));
        const item = { ...node, x, y, w: node.width || nodeW, h: node.height || nodeH, level };
        flattenedNodes.push(item);
        nodeMap.set(node.id, item);
      });
    });

    // 1. Branches
    for (const node of flattenedNodes) {
      if (!node.parentId) continue;
      const parent = nodeMap.get(node.parentId);
      if (!parent) continue;

      const x1 = snapToGrid(parent.x + parent.w / 2);
      const y1 = snapToGrid(parent.y + parent.h);
      const x2 = snapToGrid(node.x + node.w / 2);
      const y2 = snapToGrid(node.y);

      const stroke = node.focal ? this.colors.accent : this.colors.muted;

      if (x1 === x2) {
        output.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2"/>`);
      } else {
        const midY = snapToGrid((y1 + y2) / 2);
        output.push(`  <path d="M ${x1},${y1} V ${midY - 8} Q ${x1},${midY} ${x1 + (x2 > x1 ? 8 : -8)},${midY} H ${x2 - (x2 > x1 ? 8 : -8)} Q ${x2},${midY} ${x2},${midY + 8} V ${y2}" fill="none" stroke="${stroke}" stroke-width="1.2"/>`);
      }
    }

    // 2. Nodes
    for (const node of flattenedNodes) {
      const { x, y, w, h } = node;
      const cx = snapToGrid(x + w / 2);
      const cy = snapToGrid(y + h / 2);

      const fill = node.focal ? this.colors.accentTint : '#ffffff';
      const stroke = node.focal ? this.colors.accent : this.colors.ink;

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);

      if (node.tag) {
        output.push(`  <rect x="${x + 8}" y="${y + 6}" width="28" height="12" rx="2" fill="transparent" stroke="${stroke}" stroke-opacity="0.4" stroke-width="0.8"/>`);
        output.push(`  <text x="${x + 22}" y="${y + 15}" fill="${stroke}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${node.tag}</text>`);
      }

      output.push(`  <text x="${cx}" y="${node.sublabel ? cy - 2 : cy + 4}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${node.label}</text>`);
      if (node.sublabel) {
        output.push(`  <text x="${cx}" y="${cy + 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${node.sublabel}</text>`);
      }
    }

    return output.join('\n');
  }
}
