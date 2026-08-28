import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface JourneyStage {
  name: string;
  actions: string[];
  touchpoint?: string;
  sentiment: number; // -1 (negative) to +1 (positive)
  painPoint?: string;
  focal?: boolean;
}

export interface UserJourneyDiagramOptions extends BaseDiagramOptions {
  persona?: string;
  stages: JourneyStage[];
}

export class UserJourneyDiagram extends BaseDiagram<UserJourneyDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width } = this.viewBox;

    const count = this.options.stages.length;
    const startX = 64;
    const availableW = width - 128;
    const stageW = snapToGrid((availableW - (count - 1) * 16) / count);
    const startY = 48;

    // 1. Stage Columns
    const sentimentPoints: Array<{ x: number; y: number }> = [];

    this.options.stages.forEach((stage, idx) => {
      const sx = snapToGrid(startX + idx * (stageW + 16));
      const cx = snapToGrid(sx + stageW / 2);

      // Header
      output.push(`  <rect x="${sx}" y="${startY}" width="${stageW}" height="28" rx="4" fill="${stage.focal ? this.colors.accentTint : this.colors.paper2}" stroke="${stage.focal ? this.colors.accent : this.colors.rule}" stroke-width="0.8"/>`);
      output.push(`  <text x="${cx}" y="${startY + 18}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${stage.name}</text>`);

      // Actions Box
      output.push(`  <rect x="${sx}" y="${startY + 36}" width="${stageW}" height="140" rx="4" fill="#ffffff" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
      output.push(`  <text x="${sx + 10}" y="${startY + 52}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.1em">ACTIONS</text>`);

      let actY = startY + 68;
      for (const act of stage.actions) {
        output.push(`  <text x="${sx + 10}" y="${actY}" fill="${this.colors.ink}" font-size="9" font-family="${FONT_FAMILIES.sans}">• ${act}</text>`);
        actY += 16;
      }

      if (stage.touchpoint) {
        output.push(`  <text x="${sx + 10}" y="${startY + 164}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}">📱 ${stage.touchpoint}</text>`);
      }

      // Sentiment baseline
      const sentimentBaseY = startY + 240;
      const sentimentY = snapToGrid(sentimentBaseY - stage.sentiment * 36);
      sentimentPoints.push({ x: cx, y: sentimentY });

      if (stage.painPoint) {
        output.push(`  <rect x="${sx}" y="${startY + 290}" width="${stageW}" height="48" rx="4" fill="${this.colors.accentTint}" stroke="${this.colors.accent}" stroke-width="0.8"/>`);
        output.push(`  <text x="${cx}" y="${startY + 306}" fill="${this.colors.accent}" font-size="8" font-weight="600" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">PAIN POINT</text>`);
        output.push(`  <text x="${cx}" y="${startY + 322}" fill="${this.colors.ink}" font-size="9" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${stage.painPoint}</text>`);
      }
    });

    // 2. Sentiment Curve
    const sentimentBaseY = startY + 240;
    output.push(`  <line x1="${startX}" y1="${sentimentBaseY}" x2="${startX + availableW}" y2="${sentimentBaseY}" stroke="${this.colors.rule}" stroke-width="1" stroke-dasharray="4,4"/>`);
    output.push(`  <text x="${startX - 8}" y="${sentimentBaseY + 3}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="end">NEUTRAL</text>`);

    if (sentimentPoints.length > 1) {
      let pathD = `M ${sentimentPoints[0]!.x},${sentimentPoints[0]!.y}`;
      for (let i = 0; i < sentimentPoints.length - 1; i++) {
        const p1 = sentimentPoints[i]!;
        const p2 = sentimentPoints[i + 1]!;
        const cp1x = (p1.x + p2.x) / 2;
        const cp2x = cp1x;
        pathD += ` C ${cp1x},${p1.y} ${cp2x},${p2.y} ${p2.x},${p2.y}`;
      }
      output.push(`  <path d="${pathD}" fill="none" stroke="${this.colors.accent}" stroke-width="2"/>`);
      for (const p of sentimentPoints) {
        output.push(`  <circle cx="${p.x}" cy="${p.y}" r="${p.x === sentimentPoints[0]?.x ? 4 : 4}" fill="${this.colors.accent}"/>`);
      }
    }

    return output.join('\n');
  }
}
