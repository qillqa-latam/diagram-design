import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface ErField {
  name: string;
  type?: string;
  isPk?: boolean;
  isFk?: boolean;
}

export interface ErEntity {
  id: string;
  name: string;
  fields: ErField[];
  x: number;
  y: number;
  width?: number;
  focal?: boolean;
}

export interface ErRelationship {
  from: string;
  to: string;
  cardinality?: string; // e.g. "1..N", "0..1", "1..1"
  label?: string;
  focal?: boolean;
}

export interface ErDiagramOptions extends BaseDiagramOptions {
  entities: ErEntity[];
  relationships: ErRelationship[];
}

export class ErDiagram extends BaseDiagram<ErDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const entityMap = new Map<string, ErEntity & { w: number; h: number }>();

    for (const entity of this.options.entities) {
      const w = entity.width || 180;
      const h = 32 + entity.fields.length * 20 + 8;
      entityMap.set(entity.id, { ...entity, w, h });
    }

    // 1. Relationships
    for (const rel of this.options.relationships) {
      const src = entityMap.get(rel.from);
      const dst = entityMap.get(rel.to);
      if (!src || !dst) continue;

      const isRight = dst.x > src.x;
      const x1 = snapToGrid(isRight ? src.x + src.w : src.x);
      const y1 = snapToGrid(src.y + src.h / 2);
      const x2 = snapToGrid(isRight ? dst.x : dst.x + dst.w);
      const y2 = snapToGrid(dst.y + dst.h / 2);

      const stroke = rel.focal ? this.colors.accent : this.colors.muted;
      const midX = snapToGrid((x1 + x2) / 2);

      if (Math.abs(y1 - y2) < 4) {
        output.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2"/>`);
      } else {
        output.push(`  <path d="M ${x1},${y1} H ${midX - (isRight ? 8 : -8)} Q ${midX},${y1} ${midX},${y1 + (y2 > y1 ? 8 : -8)} V ${y2 - (y2 > y1 ? 8 : -8)} Q ${midX},${y2} ${midX + (isRight ? 8 : -8)},${y2} H ${x2}" fill="none" stroke="${stroke}" stroke-width="1.2"/>`);
      }

      if (rel.cardinality || rel.label) {
        const text = rel.cardinality || rel.label || '';
        const midY = snapToGrid((y1 + y2) / 2);
        const labelW = Math.max(32, text.length * 6.5 + 8);
        output.push(`  <rect x="${midX - labelW / 2}" y="${midY - 12}" width="${labelW}" height="12" rx="2" fill="${this.colors.paper}"/>`);
        output.push(`  <text x="${midX}" y="${midY - 3}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${text}</text>`);
      }
    }

    // 2. Entities
    for (const entity of this.options.entities) {
      const info = entityMap.get(entity.id)!;
      const x = snapToGrid(info.x);
      const y = snapToGrid(info.y);
      const w = snapToGrid(info.w);
      const h = snapToGrid(info.h);

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#ffffff" stroke="${entity.focal ? this.colors.accent : this.colors.ink}" stroke-width="1"/>`);

      // Header
      const headerFill = entity.focal ? this.colors.accentTint : this.colors.paper2;
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="28" rx="6" fill="${headerFill}"/>`);
      output.push(`  <rect x="${x}" y="${y + 24}" width="${w}" height="4" fill="${headerFill}"/>`);
      output.push(`  <line x1="${x}" y1="${y + 28}" x2="${x + w}" y2="${y + 28}" stroke="${this.colors.rule}" stroke-width="1"/>`);
      output.push(`  <text x="${x + w / 2}" y="${y + 18}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${entity.name}</text>`);

      // Fields
      let currY = y + 44;
      for (const field of entity.fields) {
        let prefix = '';
        if (field.isPk) prefix = 'PK ';
        else if (field.isFk) prefix = 'FK ';

        output.push(`  <text x="${x + 12}" y="${currY}" fill="${field.isPk ? this.colors.accent : this.colors.ink}" font-size="10" font-family="${FONT_FAMILIES.mono}">${prefix}${field.name}</text>`);
        if (field.type) {
          output.push(`  <text x="${x + w - 12}" y="${currY}" fill="${this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="end">${field.type}</text>`);
        }
        currY += 20;
      }
    }

    return output.join('\n');
  }
}
