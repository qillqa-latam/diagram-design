import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  position?: 'top' | 'bottom';
  focal?: boolean;
}

export interface TimelineDiagramOptions extends BaseDiagramOptions {
  events: TimelineEvent[];
}

export class TimelineDiagram extends BaseDiagram<TimelineDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const axisY = snapToGrid(height / 2);
    const startX = 64;
    const endX = width - 64;
    const count = this.options.events.length;
    const spacing = (endX - startX) / Math.max(1, count - 1);

    // 1. Central Axis
    output.push(`  <line x1="${startX}" y1="${axisY}" x2="${endX}" y2="${axisY}" stroke="${this.colors.ruleSolid}" stroke-width="2"/>`);

    // 2. Events
    this.options.events.forEach((event, idx) => {
      const pos = event.position || (idx % 2 === 0 ? 'top' : 'bottom');
      const cx = snapToGrid(startX + idx * spacing);
      const isTop = pos === 'top';

      const stroke = event.focal ? this.colors.accent : this.colors.ink;
      const fill = event.focal ? this.colors.accentTint : '#ffffff';

      // Axis Node Dot
      output.push(`  <circle cx="${cx}" cy="${axisY}" r="4" fill="${event.focal ? this.colors.accent : this.colors.ink}"/>`);

      // Leader line
      const cardY = isTop ? axisY - 100 : axisY + 40;
      const leaderEndY = isTop ? cardY + 56 : cardY;
      output.push(`  <line x1="${cx}" y1="${axisY}" x2="${cx}" y2="${leaderEndY}" stroke="${event.focal ? this.colors.accent : this.colors.muted}" stroke-width="1" stroke-dasharray="4,3"/>`);

      // Event Card
      const cardW = 140;
      const cardH = 56;
      const cardX = snapToGrid(cx - cardW / 2);

      output.push(`  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);

      output.push(`  <text x="${cx}" y="${cardY + 16}" fill="${event.focal ? this.colors.accent : this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.08em">${event.date.toUpperCase()}</text>`);
      output.push(`  <text x="${cx}" y="${cardY + 32}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${event.title}</text>`);
      if (event.description) {
        output.push(`  <text x="${cx}" y="${cardY + 46}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${event.description}</text>`);
      }
    });

    return output.join('\n');
  }
}
