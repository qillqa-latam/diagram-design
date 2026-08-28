import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface SwimlaneStep {
  id: string;
  lane: string;
  label: string;
  sublabel?: string;
  x: number;
  width?: number;
  focal?: boolean;
}

export interface SwimlaneLane {
  id: string;
  name: string;
}

export interface SwimlaneHandoff {
  from: string;
  to: string;
  label?: string;
  focal?: boolean;
}

export interface SwimlaneDiagramOptions extends BaseDiagramOptions {
  lanes: SwimlaneLane[];
  steps: SwimlaneStep[];
  handoffs: SwimlaneHandoff[];
}

export class SwimlaneDiagram extends BaseDiagram<SwimlaneDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const { width, height } = this.viewBox;

    const startX = 64;
    const laneW = width - 128;
    const laneHeaderW = 120;
    const laneCount = this.options.lanes.length;
    const laneH = snapToGrid((height - 96) / laneCount);
    const startY = 48;

    const laneYMap = new Map<string, { y: number; cy: number }>();

    // 1. Lanes
    this.options.lanes.forEach((lane, idx) => {
      const ly = snapToGrid(startY + idx * laneH);
      const lcy = snapToGrid(ly + laneH / 2);
      laneYMap.set(lane.id, { y: ly, cy: lcy });

      // Lane container
      output.push(`  <rect x="${startX}" y="${ly}" width="${laneW}" height="${laneH}" fill="${idx % 2 === 0 ? 'rgba(45,49,66,0.02)' : 'transparent'}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
      // Header strip
      output.push(`  <rect x="${startX}" y="${ly}" width="${laneHeaderW}" height="${laneH}" fill="${this.colors.paper2}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
      output.push(`  <text x="${startX + laneHeaderW / 2}" y="${lcy + 4}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${lane.name}</text>`);
    });

    const stepMap = new Map<string, { x: number; y: number; w: number; h: number; focal?: boolean; label: string; sublabel?: string }>();
    const stepW = 132;
    const stepH = 48;

    for (const step of this.options.steps) {
      const laneInfo = laneYMap.get(step.lane);
      if (!laneInfo) continue;
      const x = snapToGrid(step.x);
      const y = snapToGrid(laneInfo.cy - stepH / 2);
      stepMap.set(step.id, { x, y, w: step.width || stepW, h: stepH, focal: step.focal, label: step.label, sublabel: step.sublabel });
    }

    // 2. Handoffs (drawn before steps)
    for (const handoff of this.options.handoffs) {
      const src = stepMap.get(handoff.from);
      const dst = stepMap.get(handoff.to);
      if (!src || !dst) continue;

      const isRight = dst.x > src.x;
      const x1 = snapToGrid(isRight ? src.x + src.w : src.x);
      const y1 = snapToGrid(src.y + src.h / 2);
      const x2 = snapToGrid(isRight ? dst.x : dst.x + dst.w);
      const y2 = snapToGrid(dst.y + dst.h / 2);

      const stroke = handoff.focal ? this.colors.accent : this.colors.muted;
      const marker = handoff.focal ? `url(#${this.id}-arrow-accent)` : `url(#${this.id}-arrow)`;
      const midX = snapToGrid((x1 + x2) / 2);

      if (Math.abs(y1 - y2) < 4) {
        output.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2" marker-end="${marker}"/>`);
      } else {
        output.push(`  <path d="M ${x1},${y1} H ${midX - (isRight ? 8 : -8)} Q ${midX},${y1} ${midX},${y1 + (y2 > y1 ? 8 : -8)} V ${y2 - (y2 > y1 ? 8 : -8)} Q ${midX},${y2} ${midX + (isRight ? 8 : -8)},${y2} H ${x2}" fill="none" stroke="${stroke}" stroke-width="1.2" marker-end="${marker}"/>`);
      }

      if (handoff.label) {
        const midY = snapToGrid((y1 + y2) / 2);
        const labelW = Math.max(32, handoff.label.length * 6.5 + 8);
        output.push(`  <rect x="${midX - labelW / 2}" y="${midY - 12}" width="${labelW}" height="12" rx="2" fill="${this.colors.paper}"/>`);
        output.push(`  <text x="${midX}" y="${midY - 3}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${handoff.label}</text>`);
      }
    }

    // 3. Steps
    for (const [, step] of stepMap) {
      const { x, y, w, h } = step;
      const cx = snapToGrid(x + w / 2);
      const cy = snapToGrid(y + h / 2);

      const fill = step.focal ? this.colors.accentTint : '#ffffff';
      const stroke = step.focal ? this.colors.accent : this.colors.ink;

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);
      output.push(`  <text x="${cx}" y="${step.sublabel ? cy - 2 : cy + 4}" fill="${this.colors.ink}" font-size="11" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${step.label}</text>`);
      if (step.sublabel) {
        output.push(`  <text x="${cx}" y="${cy + 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${step.sublabel}</text>`);
      }
    }

    return output.join('\n');
  }
}
