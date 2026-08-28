import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface UmlClassMember {
  visibility?: '+' | '-' | '#' | '~';
  name: string;
  type?: string;
}

export interface UmlClass {
  id: string;
  name: string;
  stereotype?: string;
  attributes: UmlClassMember[];
  operations: UmlClassMember[];
  x: number;
  y: number;
  width?: number;
  focal?: boolean;
}

export type UmlRelationKind = 'association' | 'inheritance' | 'composition' | 'aggregation' | 'dependency';

export interface UmlRelation {
  from: string;
  to: string;
  kind?: UmlRelationKind;
  label?: string;
  focal?: boolean;
}

export interface UmlClassDiagramOptions extends BaseDiagramOptions {
  classes: UmlClass[];
  relations: UmlRelation[];
}

export class UmlClassDiagram extends BaseDiagram<UmlClassDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const classMap = new Map<string, UmlClass & { w: number; h: number }>();

    for (const cls of this.options.classes) {
      const w = cls.width || 180;
      const headerH = cls.stereotype ? 40 : 28;
      const attrH = cls.attributes.length > 0 ? cls.attributes.length * 18 + 8 : 12;
      const opH = cls.operations.length > 0 ? cls.operations.length * 18 + 8 : 12;
      const h = headerH + attrH + opH;
      classMap.set(cls.id, { ...cls, w, h });
    }

    // 1. Relations
    for (const rel of this.options.relations) {
      const src = classMap.get(rel.from);
      const dst = classMap.get(rel.to);
      if (!src || !dst) continue;

      const isRight = dst.x > src.x;
      const x1 = snapToGrid(isRight ? src.x + src.w : src.x);
      const y1 = snapToGrid(src.y + src.h / 2);
      const x2 = snapToGrid(isRight ? dst.x : dst.x + dst.w);
      const y2 = snapToGrid(dst.y + dst.h / 2);

      const stroke = rel.focal ? this.colors.accent : this.colors.muted;
      const isDashed = rel.kind === 'dependency';

      const midX = snapToGrid((x1 + x2) / 2);
      output.push(`  <path d="M ${x1},${y1} H ${midX - (isRight ? 8 : -8)} Q ${midX},${y1} ${midX},${y1 + (y2 > y1 ? 8 : -8)} V ${y2 - (y2 > y1 ? 8 : -8)} Q ${midX},${y2} ${midX + (isRight ? 8 : -8)},${y2} H ${x2}" fill="none" stroke="${stroke}" stroke-width="1.2"${isDashed ? ' stroke-dasharray="4,3"' : ''} marker-end="url(#${this.id}-arrow)"/>`);

      if (rel.label) {
        const midY = snapToGrid((y1 + y2) / 2);
        const labelW = Math.max(32, rel.label.length * 6.5 + 8);
        output.push(`  <rect x="${midX - labelW / 2}" y="${midY - 12}" width="${labelW}" height="12" rx="2" fill="${this.colors.paper}"/>`);
        output.push(`  <text x="${midX}" y="${midY - 3}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${rel.label}</text>`);
      }
    }

    // 2. Class Boxes
    for (const cls of this.options.classes) {
      const info = classMap.get(cls.id)!;
      const x = snapToGrid(info.x);
      const y = snapToGrid(info.y);
      const w = snapToGrid(info.w);
      const h = snapToGrid(info.h);

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#ffffff" stroke="${cls.focal ? this.colors.accent : this.colors.ink}" stroke-width="1"/>`);

      // Header
      const headerH = cls.stereotype ? 40 : 28;
      const headerFill = cls.focal ? this.colors.accentTint : this.colors.paper2;
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${headerH}" rx="6" fill="${headerFill}"/>`);
      output.push(`  <rect x="${x}" y="${y + headerH - 4}" width="${w}" height="4" fill="${headerFill}"/>`);
      output.push(`  <line x1="${x}" y1="${y + headerH}" x2="${x + w}" y2="${y + headerH}" stroke="${this.colors.rule}" stroke-width="1"/>`);

      if (cls.stereotype) {
        output.push(`  <text x="${x + w / 2}" y="${y + 14}" fill="${this.colors.muted}" font-size="8" font-style="italic" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">&lt;&lt;${cls.stereotype}&gt;&gt;</text>`);
        output.push(`  <text x="${x + w / 2}" y="${y + 30}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${cls.name}</text>`);
      } else {
        output.push(`  <text x="${x + w / 2}" y="${y + 18}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${cls.name}</text>`);
      }

      // Attributes
      let currY = y + headerH + 14;
      for (const attr of cls.attributes) {
        const vis = attr.visibility ? `${attr.visibility} ` : '';
        const typeStr = attr.type ? `: ${attr.type}` : '';
        output.push(`  <text x="${x + 10}" y="${currY}" fill="${this.colors.ink}" font-size="9" font-family="${FONT_FAMILIES.mono}">${vis}${attr.name}${typeStr}</text>`);
        currY += 18;
      }

      // Separator
      currY += 2;
      output.push(`  <line x1="${x}" y1="${currY}" x2="${x + w}" y2="${currY}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
      currY += 14;

      // Operations
      for (const op of cls.operations) {
        const vis = op.visibility ? `${op.visibility} ` : '';
        const typeStr = op.type ? `: ${op.type}` : '';
        output.push(`  <text x="${x + 10}" y="${currY}" fill="${this.colors.ink}" font-size="9" font-family="${FONT_FAMILIES.mono}">${vis}${op.name}()${typeStr}</text>`);
        currY += 18;
      }
    }

    return output.join('\n');
  }
}
