import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface LayerItem {
  id: string;
  name: string;
  sublabel?: string;
  focal?: boolean;
}

export interface LayerStackRow {
  name: string;
  tag?: string;
  items: LayerItem[];
  focal?: boolean;
}

export interface CrossCuttingPillar {
  name: string;
  sublabel?: string;
  position: 'left' | 'right';
  focal?: boolean;
}

export interface LayerStackDiagramOptions extends BaseDiagramOptions {
  layers: LayerStackRow[];
  pillars?: CrossCuttingPillar[];
}

export class LayerStackDiagram extends BaseDiagram<LayerStackDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const hasLeftPillar = this.options.pillars?.some(p => p.position === 'left');
    const hasRightPillar = this.options.pillars?.some(p => p.position === 'right');

    const pillarWidth = 100;
    const startX = snapToGrid(hasLeftPillar ? 48 + pillarWidth + 24 : 64);
    const endX = snapToGrid(hasRightPillar ? width - 48 - pillarWidth - 24 : width - 64);
    const stackWidth = endX - startX;

    const layerCount = this.options.layers.length;
    const availableHeight = height - 128;
    const layerHeight = snapToGrid((availableHeight - (layerCount - 1) * 16) / layerCount);
    const startY = 64;

    // 1. Cross-cutting Pillars
    if (this.options.pillars) {
      const totalStackH = layerCount * layerHeight + (layerCount - 1) * 16;
      for (const pillar of this.options.pillars) {
        const px = pillar.position === 'left' ? 48 : width - 48 - pillarWidth;
        const py = startY;
        const fill = pillar.focal ? this.colors.accentTint : 'rgba(79,93,117,0.06)';
        const stroke = pillar.focal ? this.colors.accent : this.colors.muted;

        output.push(`  <rect x="${px}" y="${py}" width="${pillarWidth}" height="${totalStackH}" rx="6" fill="${this.colors.paper}"/>`);
        output.push(`  <rect x="${px}" y="${py}" width="${pillarWidth}" height="${totalStackH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1" stroke-dasharray="4,4"/>`);
        output.push(`  <text x="${px + pillarWidth / 2}" y="${py + totalStackH / 2 - 4}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${pillar.name}</text>`);
        if (pillar.sublabel) {
          output.push(`  <text x="${px + pillarWidth / 2}" y="${py + totalStackH / 2 + 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${pillar.sublabel}</text>`);
        }
      }
    }

    // 2. Layers
    this.options.layers.forEach((layer, idx) => {
      const ly = snapToGrid(startY + idx * (layerHeight + 16));
      const stroke = layer.focal ? this.colors.accent : this.colors.ink;
      const fill = layer.focal ? this.colors.accentTint : this.colors.paper2;

      // Layer Frame
      output.push(`  <rect x="${startX}" y="${ly}" width="${stackWidth}" height="${layerHeight}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${startX}" y="${ly}" width="${stackWidth}" height="${layerHeight}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);

      // Tag / Name
      output.push(`  <text x="${startX + 16}" y="${ly + 18}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" letter-spacing="0.1em">${layer.name.toUpperCase()}</text>`);

      // Inner Items
      const itemCount = layer.items.length;
      if (itemCount > 0) {
        const itemStartX = startX + 16;
        const itemAvailableW = stackWidth - 32;
        const itemW = snapToGrid((itemAvailableW - (itemCount - 1) * 12) / itemCount);
        const itemH = layerHeight - 32;
        const itemY = ly + 24;

        layer.items.forEach((item, itemIdx) => {
          const ix = snapToGrid(itemStartX + itemIdx * (itemW + 12));
          const iFill = item.focal ? this.colors.accentTint : '#ffffff';
          const iStroke = item.focal ? this.colors.accent : this.colors.ruleSolid;

          output.push(`  <rect x="${ix}" y="${itemY}" width="${itemW}" height="${itemH}" rx="4" fill="${this.colors.paper}"/>`);
          output.push(`  <rect x="${ix}" y="${itemY}" width="${itemW}" height="${itemH}" rx="4" fill="${iFill}" stroke="${iStroke}" stroke-width="0.8"/>`);
          output.push(`  <text x="${ix + itemW / 2}" y="${itemY + itemH / 2 + 3}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${item.name}</text>`);
        });
      }
    });

    return output.join('\n');
  }
}
