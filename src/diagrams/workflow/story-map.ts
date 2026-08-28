import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface StoryCard {
  title: string;
  activityIndex: number;
  sliceIndex: number;
  focal?: boolean;
}

export interface StoryMapSlice {
  name: string; // e.g. "Release 1 (MVP)", "Release 2"
  isCutLine?: boolean;
}

export interface StoryMapDiagramOptions extends BaseDiagramOptions {
  activities: string[]; // Backbone along the top
  slices: StoryMapSlice[];
  stories: StoryCard[];
}

export class StoryMapDiagram extends BaseDiagram<StoryMapDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const startX = 64;
    const startY = 48;
    const availableW = width - 128;
    const actCount = this.options.activities.length;
    const actW = snapToGrid((availableW - (actCount - 1) * 16) / actCount);

    // 1. Backbone Activities
    this.options.activities.forEach((act, idx) => {
      const ax = snapToGrid(startX + idx * (actW + 16));
      output.push(`  <rect x="${ax}" y="${startY}" width="${actW}" height="40" rx="6" fill="${this.colors.ink}" stroke="${this.colors.ink}" stroke-width="1"/>`);
      output.push(`  <text x="${ax + actW / 2}" y="${startY + 24}" fill="#ffffff" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${act}</text>`);
    });

    // 2. Slices and Stories
    const sliceCount = this.options.slices.length;
    const sliceStartY = startY + 56;
    const sliceH = snapToGrid((height - sliceStartY - 48) / sliceCount);

    this.options.slices.forEach((slice, sIdx) => {
      const sy = snapToGrid(sliceStartY + sIdx * sliceH);

      // Slice label
      output.push(`  <text x="${startX - 12}" y="${sy + 20}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="end" letter-spacing="0.08em">${slice.name.toUpperCase()}</text>`);

      if (slice.isCutLine) {
        output.push(`  <line x1="${startX}" y1="${sy}" x2="${startX + availableW}" y2="${sy}" stroke="${this.colors.accent}" stroke-width="1.2" stroke-dasharray="6,4"/>`);
        output.push(`  <text x="${startX + availableW}" y="${sy - 6}" fill="${this.colors.accent}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="end">MVP CUT LINE</text>`);
      } else {
        output.push(`  <line x1="${startX}" y1="${sy}" x2="${startX + availableW}" y2="${sy}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
      }

      // Stories in this slice
      const sliceStories = this.options.stories.filter(s => s.sliceIndex === sIdx);
      for (const story of sliceStories) {
        const ax = snapToGrid(startX + story.activityIndex * (actW + 16));
        const storyY = sy + 16;
        const cardH = 40;

        const fill = story.focal ? this.colors.accentTint : '#ffffff';
        const stroke = story.focal ? this.colors.accent : this.colors.ruleSolid;

        output.push(`  <rect x="${ax}" y="${storyY}" width="${actW}" height="${cardH}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="0.8"/>`);
        output.push(`  <text x="${ax + actW / 2}" y="${storyY + 24}" fill="${this.colors.ink}" font-size="10" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${story.title}</text>`);
      }
    });

    return output.join('\n');
  }
}
