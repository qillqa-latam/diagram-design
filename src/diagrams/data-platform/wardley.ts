import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface WardleyComponent {
  id: string;
  name: string;
  visibility: number; // 0 (low / invisible) to 1 (high / visible to user)
  evolution: number; // 0 (genesis) to 1 (commodity)
  targetEvolution?: number; // Optional movement arrow
  focal?: boolean;
}

export interface WardleyLink {
  from: string;
  to: string;
  focal?: boolean;
}

export interface WardleyMapDiagramOptions extends BaseDiagramOptions {
  userType?: string;
  components: WardleyComponent[];
  links: WardleyLink[];
}

export class WardleyMapDiagram extends BaseDiagram<WardleyMapDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const startX = 96;
    const startY = 48;
    const mapW = width - 160;
    const mapH = height - 128;
    const baselineY = startY + mapH;

    // 1. Evolution Stages (X-Axis)
    const stages = ['GENESIS', 'CUSTOM-BUILT', 'PRODUCT (+RENTAL)', 'COMMODITY / UTILITY'];
    const stageW = mapW / 4;

    stages.forEach((st, idx) => {
      const sx = snapToGrid(startX + idx * stageW);
      if (idx > 0) {
        output.push(`  <line x1="${sx}" y1="${startY}" x2="${sx}" y2="${baselineY}" stroke="${this.colors.rule}" stroke-width="0.8" stroke-dasharray="4,4"/>`);
      }
      output.push(`  <text x="${sx + stageW / 2}" y="${baselineY + 24}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.08em">${st}</text>`);
    });

    // 2. Axes
    output.push(`  <line x1="${startX}" y1="${startY}" x2="${startX}" y2="${baselineY}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);
    output.push(`  <line x1="${startX}" y1="${baselineY}" x2="${startX + mapW}" y2="${baselineY}" stroke="${this.colors.ruleSolid}" stroke-width="1"/>`);

    output.push(`  <text x="${startX - 24}" y="${startY + mapH / 2}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" transform="rotate(-90, ${startX - 24}, ${startY + mapH / 2})">VALUE CHAIN (VISIBILITY) →</text>`);
    output.push(`  <text x="${startX + mapW / 2}" y="${baselineY + 44}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">EVOLUTION →</text>`);

    // 3. User anchor at top
    if (this.options.userType) {
      const ux = snapToGrid(startX + mapW / 2);
      output.push(`  <rect x="${ux - 40}" y="${startY - 24}" width="80" height="20" rx="3" fill="${this.colors.paper2}" stroke="${this.colors.ink}" stroke-width="0.8"/>`);
      output.push(`  <text x="${ux}" y="${startY - 10}" fill="${this.colors.ink}" font-size="9" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">👤 ${this.options.userType}</text>`);
    }

    // 4. Map components to coordinates
    const compMap = new Map<string, { x: number; y: number; c: WardleyComponent }>();
    for (const c of this.options.components) {
      const cx = snapToGrid(startX + c.evolution * mapW);
      const cy = snapToGrid(baselineY - c.visibility * mapH);
      compMap.set(c.id, { x: cx, y: cy, c });
    }

    // 5. Dependency Links
    for (const link of this.options.links) {
      const src = compMap.get(link.from);
      const dst = compMap.get(link.to);
      if (!src || !dst) continue;

      const stroke = link.focal ? this.colors.accent : this.colors.muted;
      output.push(`  <line x1="${src.x}" y1="${src.y}" x2="${dst.x}" y2="${dst.y}" stroke="${stroke}" stroke-width="1.2"/>`);
    }

    // 6. Components & Evolution Movement Arrows
    for (const [, item] of compMap) {
      const { x, y, c } = item;
      const fill = c.focal ? this.colors.accent : this.colors.ink;

      // Movement arrow if moving along evolution axis
      if (c.targetEvolution !== undefined && c.targetEvolution > c.evolution) {
        const targetX = snapToGrid(startX + c.targetEvolution * mapW);
        output.push(`  <line x1="${x + 6}" y1="${y}" x2="${targetX}" y2="${y}" stroke="${this.colors.accent}" stroke-width="1.2" stroke-dasharray="3,3" marker-end="url(#${this.id}-arrow-accent)"/>`);
      }

      // Component Dot & Label
      output.push(`  <circle cx="${x}" cy="${y}" r="${c.focal ? 5 : 4}" fill="${fill}"/>`);
      output.push(`  <text x="${x}" y="${y - 8}" fill="${this.colors.ink}" font-size="10" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${c.name}</text>`);
    }

    return output.join('\n');
  }
}
