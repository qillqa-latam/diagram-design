import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface KanbanCard {
  id: string;
  title: string;
  tag?: string;
  owner?: string;
  isBlocked?: boolean;
  focal?: boolean;
}

export interface KanbanColumn {
  name: string;
  wipLimit?: number;
  cards: KanbanCard[];
}

export interface KanbanDiagramOptions extends BaseDiagramOptions {
  columns: KanbanColumn[];
}

export class KanbanDiagram extends BaseDiagram<KanbanDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const count = this.options.columns.length;
    const startX = 64;
    const availableW = width - 128;
    const colW = snapToGrid((availableW - (count - 1) * 16) / count);
    const startY = 48;
    const colH = height - 96;

    this.options.columns.forEach((col, idx) => {
      const cx = snapToGrid(startX + idx * (colW + 16));

      // Column Frame
      output.push(`  <rect x="${cx}" y="${startY}" width="${colW}" height="${colH}" rx="6" fill="rgba(45,49,66,0.02)" stroke="${this.colors.rule}" stroke-width="0.8"/>`);

      // Column Header
      const wipStr = col.wipLimit !== undefined ? ` [${col.cards.length}/${col.wipLimit}]` : ` [${col.cards.length}]`;
      output.push(`  <text x="${cx + 12}" y="${startY + 24}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}">${col.name}</text>`);
      output.push(`  <text x="${cx + colW - 12}" y="${startY + 24}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="end">${wipStr}</text>`);
      output.push(`  <line x1="${cx}" y1="${startY + 36}" x2="${cx + colW}" y2="${startY + 36}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);

      // Cards
      let cardY = startY + 48;
      const cardH = 56;

      for (const card of col.cards) {
        const fill = card.focal ? this.colors.accentTint : '#ffffff';
        const stroke = card.isBlocked ? this.colors.accent : (card.focal ? this.colors.accent : this.colors.ruleSolid);

        output.push(`  <rect x="${cx + 8}" y="${cardY}" width="${colW - 16}" height="${cardH}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${card.isBlocked ? 1.2 : 0.8}"/>`);

        if (card.tag || card.isBlocked) {
          const tagText = card.isBlocked ? 'BLOCKED' : (card.tag || '');
          const tagFill = card.isBlocked ? this.colors.accent : this.colors.muted;
          output.push(`  <text x="${cx + 16}" y="${cardY + 16}" fill="${tagFill}" font-size="7" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.08em">${tagText.toUpperCase()}</text>`);
        }

        output.push(`  <text x="${cx + 16}" y="${cardY + 32}" fill="${this.colors.ink}" font-size="11" font-weight="500" font-family="${FONT_FAMILIES.sans}">${card.title}</text>`);
        if (card.owner) {
          output.push(`  <text x="${cx + colW - 16}" y="${cardY + 46}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="end">👤 ${card.owner}</text>`);
        }

        cardY += cardH + 12;
      }
    });

    return output.join('\n');
  }
}
