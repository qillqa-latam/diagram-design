import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface MedallionTable {
  name: string;
  sublabel?: string;
  focal?: boolean;
}

export interface MedallionTier {
  type: 'bronze' | 'silver' | 'gold';
  title: string;
  description?: string;
  tables: MedallionTable[];
  focal?: boolean;
}

export interface MedallionDiagramOptions extends BaseDiagramOptions {
  tiers: [MedallionTier, MedallionTier, MedallionTier]; // Bronze, Silver, Gold
}

export class MedallionDiagram extends BaseDiagram<MedallionDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const startX = 64;
    const startY = 48;
    const availableW = width - 128;
    const colW = snapToGrid((availableW - 64) / 3);
    const colH = height - 96;

    const tierColors = {
      bronze: { header: 'rgba(156,107,80,0.12)', border: '#9c6b50', name: 'BRONZE / RAW' },
      silver: { header: 'rgba(191,192,192,0.20)', border: '#bfc0c0', name: 'SILVER / CLEANSED' },
      gold: { header: 'rgba(235,108,54,0.12)', border: '#eb6c36', name: 'GOLD / AGGREGATED' }
    };

    this.options.tiers.forEach((tier, idx) => {
      const tx = snapToGrid(startX + idx * (colW + 32));
      const tStyle = tierColors[tier.type];

      // Column Frame
      output.push(`  <rect x="${tx}" y="${startY}" width="${colW}" height="${colH}" rx="8" fill="rgba(45,49,66,0.02)" stroke="${tier.focal ? this.colors.accent : this.colors.rule}" stroke-width="0.8"/>`);

      // Column Header
      output.push(`  <rect x="${tx}" y="${startY}" width="${colW}" height="48" rx="8" fill="${tStyle.header}"/>`);
      output.push(`  <rect x="${tx}" y="${startY + 44}" width="${colW}" height="4" fill="${tStyle.header}"/>`);
      output.push(`  <line x1="${tx}" y1="${startY + 48}" x2="${tx + colW}" y2="${startY + 48}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);

      output.push(`  <text x="${tx + colW / 2}" y="${startY + 20}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.1em">${tStyle.name}</text>`);
      output.push(`  <text x="${tx + colW / 2}" y="${startY + 36}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${tier.title}</text>`);

      // Tables / Datasets inside tier
      let currY = startY + 64;
      const cardH = 52;
      const cardW = colW - 24;
      const cardX = tx + 12;

      for (const table of tier.tables) {
        const fill = table.focal ? this.colors.accentTint : '#ffffff';
        const stroke = table.focal ? this.colors.accent : this.colors.ruleSolid;

        output.push(`  <rect x="${cardX}" y="${currY}" width="${cardW}" height="${cardH}" rx="6" fill="${this.colors.paper}"/>`);
        output.push(`  <rect x="${cardX}" y="${currY}" width="${cardW}" height="${cardH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);

        output.push(`  <text x="${cardX + cardW / 2}" y="${currY + 24}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${table.name}</text>`);
        if (table.sublabel) {
          output.push(`  <text x="${cardX + cardW / 2}" y="${currY + 40}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${table.sublabel}</text>`);
        }

        currY += cardH + 16;
      }

      // Transition arrow between columns
      if (idx < 2) {
        const ax1 = tx + colW;
        const ax2 = tx + colW + 32;
        const ay = snapToGrid(startY + colH / 2);
        output.push(`  <line x1="${ax1}" y1="${ay}" x2="${ax2}" y2="${ay}" stroke="${this.colors.muted}" stroke-width="1.4" marker-end="url(#${this.id}-arrow)"/>`);
      }
    });

    return output.join('\n');
  }
}
