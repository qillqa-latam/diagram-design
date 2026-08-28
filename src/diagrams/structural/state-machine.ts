import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface StateNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  isInitial?: boolean;
  isFinal?: boolean;
  focal?: boolean;
}

export interface StateTransition {
  from: string;
  to: string;
  event: string;
  guard?: string;
  action?: string;
  focal?: boolean;
}

export interface StateMachineDiagramOptions extends BaseDiagramOptions {
  states: StateNode[];
  transitions: StateTransition[];
}

export class StateMachineDiagram extends BaseDiagram<StateMachineDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const stateMap = new Map<string, StateNode & { w: number; h: number }>();

    for (const state of this.options.states) {
      const w = state.width || (state.isInitial || state.isFinal ? 32 : 140);
      const h = state.height || (state.isInitial || state.isFinal ? 32 : 56);
      stateMap.set(state.id, { ...state, w, h });
    }

    // 1. Transitions
    for (const trans of this.options.transitions) {
      const src = stateMap.get(trans.from);
      const dst = stateMap.get(trans.to);
      if (!src || !dst) continue;

      const isRight = dst.x > src.x;
      const x1 = snapToGrid(isRight ? src.x + src.w : src.x);
      const y1 = snapToGrid(src.y + src.h / 2);
      const x2 = snapToGrid(isRight ? dst.x : dst.x + dst.w);
      const y2 = snapToGrid(dst.y + dst.h / 2);

      const stroke = trans.focal ? this.colors.accent : this.colors.muted;
      const marker = trans.focal ? `url(#${this.id}-arrow-accent)` : `url(#${this.id}-arrow)`;

      if (Math.abs(y1 - y2) < 4) {
        output.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2" marker-end="${marker}"/>`);
      } else {
        const midX = snapToGrid((x1 + x2) / 2);
        output.push(`  <path d="M ${x1},${y1} H ${midX - (isRight ? 8 : -8)} Q ${midX},${y1} ${midX},${y1 + (y2 > y1 ? 8 : -8)} V ${y2 - (y2 > y1 ? 8 : -8)} Q ${midX},${y2} ${midX + (isRight ? 8 : -8)},${y2} H ${x2}" fill="none" stroke="${stroke}" stroke-width="1.2" marker-end="${marker}"/>`);
      }

      // Label (event [guard] / action)
      const labelText = [
        trans.event,
        trans.guard ? `[${trans.guard}]` : '',
        trans.action ? `/ ${trans.action}` : ''
      ].filter(Boolean).join(' ');

      const midX = snapToGrid((x1 + x2) / 2);
      const midY = snapToGrid((y1 + y2) / 2);
      const labelW = Math.max(36, labelText.length * 6.5 + 12);

      output.push(`  <rect x="${midX - labelW / 2}" y="${midY - 14}" width="${labelW}" height="12" rx="2" fill="${this.colors.paper}"/>`);
      output.push(`  <text x="${midX}" y="${midY - 5}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${labelText}</text>`);
    }

    // 2. States
    for (const state of this.options.states) {
      const info = stateMap.get(state.id)!;
      const x = snapToGrid(info.x);
      const y = snapToGrid(info.y);
      const w = snapToGrid(info.w);
      const h = snapToGrid(info.h);
      const cx = snapToGrid(x + w / 2);
      const cy = snapToGrid(y + h / 2);

      if (state.isInitial) {
        output.push(`  <circle cx="${cx}" cy="${cy}" r="10" fill="${this.colors.ink}"/>`);
      } else if (state.isFinal) {
        output.push(`  <circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="${this.colors.ink}" stroke-width="1.5"/>`);
        output.push(`  <circle cx="${cx}" cy="${cy}" r="7" fill="${this.colors.ink}"/>`);
      } else {
        const fill = state.focal ? this.colors.accentTint : '#ffffff';
        const stroke = state.focal ? this.colors.accent : this.colors.ink;

        output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${this.colors.paper}"/>`);
        output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);
        output.push(`  <text x="${cx}" y="${state.sublabel ? cy - 2 : cy + 4}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${state.label}</text>`);
        if (state.sublabel) {
          output.push(`  <text x="${cx}" y="${cy + 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${state.sublabel}</text>`);
        }
      }
    }

    return output.join('\n');
  }
}
