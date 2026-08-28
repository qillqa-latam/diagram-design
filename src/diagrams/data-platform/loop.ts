import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid, polarToCartesianExact } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface LoopStation {
  name: string;
  sublabel?: string;
  spokeLabel?: string;
  focal?: boolean;
}

export interface LoopHub {
  name: string;
  sublabel?: string;
}

export interface LoopDiagramOptions extends BaseDiagramOptions {
  hub: LoopHub;
  stations: LoopStation[]; // 5..8 stations
  radius?: number;
  stationWidth?: number;
  stationHeight?: number;
  hubWidth?: number;
  hubHeight?: number;
}

export class LoopDiagram extends BaseDiagram<LoopDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const cx = snapToGrid(width / 2);
    const cy = snapToGrid(height / 2 + 10);
    const R = this.options.radius || 210;

    const sW = this.options.stationWidth || 132;
    const sH = this.options.stationHeight || 52;
    const hW = this.options.hubWidth || 180;
    const hH = this.options.hubHeight || 80;

    const N = this.options.stations.length;

    // Calculate station centers: theta_k = -90deg + k * (360deg / N)
    const stationPositions = this.options.stations.map((s, k) => {
      const angle = (k * 360) / N; // polarToCartesianExact treats 0 as top (-90deg in standard trig)
      const center = polarToCartesianExact(cx, cy, R, angle);
      return {
        ...s,
        k,
        angle,
        cx: center.x,
        cy: center.y,
        x: snapToGrid(center.x - sW / 2),
        y: snapToGrid(center.y - sH / 2)
      };
    });

    // 1. Spoke lines (Dashed write-backs from stations to central hub)
    for (const st of stationPositions) {
      output.push(`  <line x1="${st.cx}" y1="${st.cy}" x2="${cx}" y2="${cy}" stroke="${this.colors.muted}" stroke-width="1" stroke-dasharray="4,4"/>`);
      if (st.spokeLabel) {
        const spokeMidX = snapToGrid((st.cx + cx) / 2);
        const spokeMidY = snapToGrid((st.cy + cy) / 2);
        output.push(`  <rect x="${spokeMidX - 24}" y="${spokeMidY - 6}" width="48" height="12" rx="2" fill="${this.colors.paper}"/>`);
        output.push(`  <text x="${spokeMidX}" y="${spokeMidY + 3}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.08em">${st.spokeLabel.toUpperCase()}</text>`);
      }
    }

    // 2. Ring Connectors (Clockwise from st_k to st_{k+1})
    for (let k = 0; k < N; k++) {
      const stCurrent = stationPositions[k]!;
      const stNext = stationPositions[(k + 1) % N]!;

      // Connect perimeter arc
      const stroke = stCurrent.focal ? this.colors.accent : this.colors.muted;
      const marker = stCurrent.focal ? `url(#${this.id}-arrow-accent)` : `url(#${this.id}-arrow)`;

      output.push(`  <line x1="${stCurrent.cx}" y1="${stCurrent.cy}" x2="${stNext.cx}" y2="${stNext.cy}" stroke="${stroke}" stroke-width="${stCurrent.focal ? 1.5 : 1.2}" marker-end="${marker}"/>`);
    }

    // 3. Central Hub Box (drawn over spokes)
    const hubX = snapToGrid(cx - hW / 2);
    const hubY = snapToGrid(cy - hH / 2);

    output.push(`  <rect x="${hubX}" y="${hubY}" width="${hW}" height="${hH}" rx="8" fill="${this.colors.paper}"/>`);
    output.push(`  <rect x="${hubX}" y="${hubY}" width="${hW}" height="${hH}" rx="8" fill="rgba(45,49,66,0.05)" stroke="${this.colors.ink}" stroke-width="1.2"/>`);
    output.push(`  <text x="${cx}" y="${hubY + 16}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.12em">SHARED HUB</text>`);
    output.push(`  <text x="${cx}" y="${cy + 6}" fill="${this.colors.ink}" font-size="13" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${this.options.hub.name}</text>`);
    if (this.options.hub.sublabel) {
      output.push(`  <text x="${cx}" y="${cy + 22}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${this.options.hub.sublabel}</text>`);
    }

    // 4. Stations (drawn over ring connectors)
    for (const st of stationPositions) {
      const fill = st.focal ? this.colors.accentTint : '#ffffff';
      const stroke = st.focal ? this.colors.accent : this.colors.ink;

      output.push(`  <rect x="${st.x}" y="${st.y}" width="${sW}" height="${sH}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${st.x}" y="${st.y}" width="${sW}" height="${sH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);
      output.push(`  <text x="${st.cx}" y="${st.sublabel ? st.cy - 2 : st.cy + 4}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${st.name}</text>`);
      if (st.sublabel) {
        output.push(`  <text x="${st.cx}" y="${st.cy + 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${st.sublabel}</text>`);
      }
    }

    return output.join('\n');
  }
}
