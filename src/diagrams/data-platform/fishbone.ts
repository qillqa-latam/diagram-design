import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface FishboneBranch {
  category: string; // e.g. "People", "Process", "Technology"
  position: 'top' | 'bottom';
  spineOffset: number; // 0 to 1 relative along spine
  causes: string[];
  focal?: boolean;
}

export interface FishboneDiagramOptions extends BaseDiagramOptions {
  effect: string; // The main problem / outcome box on right
  branches: FishboneBranch[];
}

export class FishboneDiagram extends BaseDiagram<FishboneDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const startX = 64;
    const effectW = 160;
    const effectH = 64;
    const endX = width - 64 - effectW;
    const spineY = snapToGrid(height / 2);

    // 1. Central Spine
    output.push(`  <line x1="${startX}" y1="${spineY}" x2="${endX}" y2="${spineY}" stroke="${this.colors.ink}" stroke-width="2"/>`);

    // 2. Effect Box on right
    const effectX = endX;
    const effectY = snapToGrid(spineY - effectH / 2);
    output.push(`  <rect x="${effectX}" y="${effectY}" width="${effectW}" height="${effectH}" rx="6" fill="${this.colors.paper}"/>`);
    output.push(`  <rect x="${effectX}" y="${effectY}" width="${effectW}" height="${effectH}" rx="6" fill="${this.colors.accentTint}" stroke="${this.colors.accent}" stroke-width="1.4"/>`);
    output.push(`  <text x="${effectX + effectW / 2}" y="${effectY + 26}" fill="${this.colors.accent}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.1em">PROBLEM / EFFECT</text>`);
    output.push(`  <text x="${effectX + effectW / 2}" y="${effectY + 44}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${this.options.effect}</text>`);

    // 3. Category Bones & Causes
    for (const branch of this.options.branches) {
      const isTop = branch.position === 'top';
      const rootX = snapToGrid(startX + branch.spineOffset * (endX - startX));
      const boneLen = 140;
      const boneAngleX = 70;
      const topX = snapToGrid(rootX - boneAngleX);
      const topY = snapToGrid(isTop ? spineY - boneLen : spineY + boneLen);

      const stroke = branch.focal ? this.colors.accent : this.colors.muted;

      // Diagonal Bone
      output.push(`  <line x1="${topX}" y1="${topY}" x2="${rootX}" y2="${spineY}" stroke="${stroke}" stroke-width="1.2"/>`);

      // Category Header Box
      const catW = 110;
      const catH = 28;
      const catX = snapToGrid(topX - catW / 2);
      const catY = snapToGrid(isTop ? topY - catH : topY);

      output.push(`  <rect x="${catX}" y="${catY}" width="${catW}" height="${catH}" rx="4" fill="${branch.focal ? this.colors.accentTint : this.colors.paper2}" stroke="${stroke}" stroke-width="1"/>`);
      output.push(`  <text x="${topX}" y="${catY + 18}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${branch.category}</text>`);

      // Horizontal Cause Ribs
      branch.causes.forEach((cause, cIdx) => {
        const t = (cIdx + 1) / (branch.causes.length + 1);
        const ribOriginX = snapToGrid(topX + t * (rootX - topX));
        const ribOriginY = snapToGrid(topY + t * (spineY - topY));
        const ribStartX = snapToGrid(ribOriginX - 60);

        output.push(`  <line x1="${ribStartX}" y1="${ribOriginY}" x2="${ribOriginX}" y2="${ribOriginY}" stroke="${stroke}" stroke-width="0.8"/>`);
        output.push(`  <text x="${ribStartX - 6}" y="${ribOriginY + 3}" fill="${this.colors.ink}" font-size="9" font-family="${FONT_FAMILIES.sans}" text-anchor="end">${cause}</text>`);
      });
    }

    return output.join('\n');
  }
}
