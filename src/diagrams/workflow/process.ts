import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface ProcessStage {
  name: string;
  actor?: string;
  inputs?: string[];
  actions: string[];
  outputs?: string[];
  focal?: boolean;
}

export interface ProcessDiagramOptions extends BaseDiagramOptions {
  stages: ProcessStage[];
}

export class ProcessDiagram extends BaseDiagram<ProcessDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const count = this.options.stages.length;
    const startX = 64;
    const availableW = width - 128;
    const stageW = snapToGrid((availableW - (count - 1) * 32) / count);
    const stageY = 64;
    const stageH = height - 128;

    this.options.stages.forEach((stage, idx) => {
      const sx = snapToGrid(startX + idx * (stageW + 32));
      const cx = snapToGrid(sx + stageW / 2);

      // Card
      const fill = stage.focal ? this.colors.accentTint : '#ffffff';
      const stroke = stage.focal ? this.colors.accent : this.colors.ink;

      output.push(`  <rect x="${sx}" y="${stageY}" width="${stageW}" height="${stageH}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${sx}" y="${stageY}" width="${stageW}" height="${stageH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);

      // Stage Header
      output.push(`  <rect x="${sx}" y="${stageY}" width="${stageW}" height="32" rx="6" fill="${stage.focal ? this.colors.accentTint : this.colors.paper2}"/>`);
      output.push(`  <rect x="${sx}" y="${stageY + 28}" width="${stageW}" height="4" fill="${stage.focal ? this.colors.accentTint : this.colors.paper2}"/>`);
      output.push(`  <line x1="${sx}" y1="${stageY + 32}" x2="${sx + stageW}" y2="${stageY + 32}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
      output.push(`  <text x="${cx}" y="${stageY + 20}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${stage.name}</text>`);

      if (stage.actor) {
        output.push(`  <text x="${cx}" y="${stageY + 48}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.08em">${stage.actor.toUpperCase()}</text>`);
      }

      // Actions
      let currY = stageY + 72;
      for (const act of stage.actions) {
        output.push(`  <rect x="${sx + 8}" y="${currY}" width="${stageW - 16}" height="32" rx="4" fill="${this.colors.paper2}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
        output.push(`  <text x="${cx}" y="${currY + 20}" fill="${this.colors.ink}" font-size="10" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${act}</text>`);
        currY += 40;
      }

      // Inter-stage arrow
      if (idx < count - 1) {
        const arrowX1 = sx + stageW;
        const arrowX2 = sx + stageW + 32;
        const arrowY = snapToGrid(stageY + stageH / 2);
        output.push(`  <line x1="${arrowX1}" y1="${arrowY}" x2="${arrowX2}" y2="${arrowY}" stroke="${this.colors.muted}" stroke-width="1.2" marker-end="url(#${this.id}-arrow)"/>`);
      }
    });

    return output.join('\n');
  }
}
