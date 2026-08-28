import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface DbColumn {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  isUnique?: boolean;
  isNotNull?: boolean;
}

export interface DbTable {
  id: string;
  schema?: string;
  name: string;
  x: number;
  y: number;
  width?: number;
  columns: DbColumn[];
  indexes?: string[];
  overflowCount?: number;
  focal?: boolean;
}

export interface DbForeignKey {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  action?: 'CASCADE' | 'RESTRICT' | 'SET NULL';
  focal?: boolean;
}

export interface DbSchemaDiagramOptions extends BaseDiagramOptions {
  tables: DbTable[];
  foreignKeys: DbForeignKey[];
}

export class DbSchemaDiagram extends BaseDiagram<DbSchemaDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const tableMap = new Map<string, DbTable & { w: number; h: number; colYMap: Map<string, number> }>();

    // Calculate heights and column Y offsets
    for (const table of this.options.tables) {
      const w = table.width || 220;
      const headerH = 32;
      const colH = 24;
      const colCount = table.columns.length + (table.overflowCount ? 1 : 0);
      const indexH = table.indexes && table.indexes.length > 0 ? 24 + table.indexes.length * 16 : 0;
      const h = headerH + colCount * colH + indexH;

      const colYMap = new Map<string, number>();
      table.columns.forEach((col, idx) => {
        colYMap.set(col.name, table.y + headerH + idx * colH + colH / 2);
      });

      tableMap.set(table.id, { ...table, w, h, colYMap });
    }

    // 1. Foreign Key Connectors
    for (const fk of this.options.foreignKeys) {
      const srcTable = tableMap.get(fk.fromTable);
      const dstTable = tableMap.get(fk.toTable);
      if (!srcTable || !dstTable) continue;

      const y1 = srcTable.colYMap.get(fk.fromColumn) || (srcTable.y + 32);
      const y2 = dstTable.colYMap.get(fk.toColumn) || (dstTable.y + 32);

      // Connect right edge of source to left edge of target or vice-versa
      const isSrcLeftOfDst = srcTable.x < dstTable.x;
      const x1 = isSrcLeftOfDst ? srcTable.x + srcTable.w : srcTable.x;
      const x2 = isSrcLeftOfDst ? dstTable.x : dstTable.x + dstTable.w;

      const stroke = fk.focal ? this.colors.accent : this.colors.muted;
      const marker = fk.focal ? `url(#${this.id}-arrow-accent)` : `url(#${this.id}-arrow)`;

      const midX = snapToGrid((x1 + x2) / 2);
      const r = 8;
      const rX1 = x2 > x1 ? r : -r;
      const rY1 = y2 > y1 ? r : -r;
      const rX2 = x2 > x1 ? r : -r;
      const rY2 = y2 > y1 ? r : -r;

      const pathD = `M ${x1},${y1} H ${midX - rX1} Q ${midX},${y1} ${midX},${y1 + rY1} V ${y2 - rY2} Q ${midX},${y2} ${midX + rX2},${y2} H ${x2}`;
      output.push(`  <path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="${fk.focal ? 1.4 : 1.2}" marker-end="${marker}"/>`);

      // Label: action
      const actionLabel = fk.action ? `ON DELETE ${fk.action}` : 'FK';
      const labelY = snapToGrid((y1 + y2) / 2);
      const labelW = Math.max(36, actionLabel.length * 6 + 12);
      output.push(`  <rect x="${midX - labelW / 2}" y="${labelY - 6}" width="${labelW}" height="12" rx="2" fill="${this.colors.paper}"/>`);
      output.push(`  <text x="${midX}" y="${labelY + 3}" fill="${stroke}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${actionLabel}</text>`);
    }

    // 2. Tables
    for (const table of this.options.tables) {
      const info = tableMap.get(table.id)!;
      const x = snapToGrid(info.x);
      const y = snapToGrid(info.y);
      const w = snapToGrid(info.w);
      const h = snapToGrid(info.h);
      const headerH = 32;
      const colH = 24;

      // Table Box
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#ffffff" stroke="${table.focal ? this.colors.accent : this.colors.ink}" stroke-width="1"/>`);

      // Header Band
      const headerFill = table.focal ? this.colors.accentTint : this.colors.paper2;
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${headerH}" rx="6" fill="${headerFill}"/>`);
      output.push(`  <rect x="${x}" y="${y + headerH - 4}" width="${w}" height="4" fill="${headerFill}"/>`);
      output.push(`  <line x1="${x}" y1="${y + headerH}" x2="${x + w}" y2="${y + headerH}" stroke="${this.colors.rule}" stroke-width="1"/>`);

      // Table Name & Tag
      const displayName = table.schema ? `${table.schema}.${table.name}` : table.name;
      output.push(`  <text x="${x + 12}" y="${y + 20}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}">${displayName}</text>`);
      output.push(`  <rect x="${x + w - 44}" y="${y + 10}" width="32" height="12" rx="2" fill="transparent" stroke="${this.colors.muted}" stroke-width="0.8"/>`);
      output.push(`  <text x="${x + w - 28}" y="${y + 19}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">TABLE</text>`);

      // Columns
      let currY = y + headerH;
      table.columns.forEach((col, idx) => {
        if (idx % 2 === 1) {
          output.push(`  <rect x="${x + 1}" y="${currY}" width="${w - 2}" height="${colH}" fill="rgba(45,49,66,0.02)"/>`);
        }
        output.push(`  <text x="${x + 12}" y="${currY + 16}" fill="${this.colors.ink}" font-size="11" font-family="${FONT_FAMILIES.sans}">${col.name}</text>`);

        // Badges (PK, FK, etc.)
        let badgeX = x + 100;
        if (col.isPk) {
          output.push(`  <rect x="${badgeX}" y="${currY + 6}" width="16" height="12" rx="2" fill="${this.colors.accentTint}" stroke="${this.colors.accent}" stroke-width="0.6"/>`);
          output.push(`  <text x="${badgeX + 8}" y="${currY + 15}" fill="${this.colors.accent}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">PK</text>`);
          badgeX += 20;
        }
        if (col.isFk) {
          output.push(`  <rect x="${badgeX}" y="${currY + 6}" width="16" height="12" rx="2" fill="${this.colors.paper2}" stroke="${this.colors.muted}" stroke-width="0.6"/>`);
          output.push(`  <text x="${badgeX + 8}" y="${currY + 15}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">FK</text>`);
        }

        output.push(`  <text x="${x + w - 12}" y="${currY + 16}" fill="${this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="end">${col.type}</text>`);
        currY += colH;
      });

      if (table.overflowCount) {
        output.push(`  <text x="${x + 12}" y="${currY + 16}" fill="${this.colors.muted}" font-size="9" font-style="italic" font-family="${FONT_FAMILIES.mono}">+ ${table.overflowCount} more columns</text>`);
        currY += colH;
      }

      // Indexes Compartment
      if (table.indexes && table.indexes.length > 0) {
        output.push(`  <line x1="${x}" y1="${currY}" x2="${x + w}" y2="${currY}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
        output.push(`  <text x="${x + 12}" y="${currY + 14}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.1em">INDEXES</text>`);
        currY += 18;
        for (const idxName of table.indexes) {
          output.push(`  <text x="${x + 12}" y="${currY + 10}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}">• ${idxName}</text>`);
          currY += 16;
        }
      }
    }

    return output.join('\n');
  }
}
