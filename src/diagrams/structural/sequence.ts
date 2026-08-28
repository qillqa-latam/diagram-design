import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface SequenceActor {
  id: string;
  label: string;
  sublabel?: string;
  focal?: boolean;
}

export type SequenceMessageKind = 'sync' | 'return' | 'async' | 'accent';

export interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  kind?: SequenceMessageKind;
  y: number;
}

export interface SequenceActivation {
  actor: string;
  startY: number;
  endY: number;
}

export interface SequenceFragment {
  operator: 'alt' | 'opt' | 'loop';
  condition?: string;
  startY: number;
  endY: number;
  lifelines: string[];
}

export interface SequenceDiagramOptions extends BaseDiagramOptions {
  actors: SequenceActor[];
  messages: SequenceMessage[];
  activations?: SequenceActivation[];
  fragments?: SequenceFragment[];
}

export class SequenceDiagram extends BaseDiagram<SequenceDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const actorCount = this.options.actors.length;
    const { width, height } = this.viewBox;

    const startX = 64;
    const availableWidth = width - 128;
    const actorSpacing = availableWidth / Math.max(1, actorCount - 1);

    const actorPositions = new Map<string, { x: number; cx: number }>();
    const actorWidth = 112;
    const actorHeight = 48;
    const actorY = 48;
    const lifelineEndY = height - 48;

    this.options.actors.forEach((actor, i) => {
      const cx = snapToGrid(startX + i * actorSpacing);
      const x = snapToGrid(cx - actorWidth / 2);
      actorPositions.set(actor.id, { x, cx });
    });

    // 1. Lifelines
    for (const actor of this.options.actors) {
      const pos = actorPositions.get(actor.id)!;
      output.push(`  <line x1="${pos.cx}" y1="${actorY + actorHeight}" x2="${pos.cx}" y2="${lifelineEndY}" stroke="${this.colors.ruleSolid}" stroke-width="1" stroke-dasharray="4,4"/>`);
    }

    // 2. Fragments (alt / opt / loop)
    if (this.options.fragments) {
      for (const frag of this.options.fragments) {
        const actorCxs = frag.lifelines.map(id => actorPositions.get(id)?.cx || 0).filter(cx => cx > 0);
        if (actorCxs.length === 0) continue;
        const minCx = Math.min(...actorCxs);
        const maxCx = Math.max(...actorCxs);
        const fx = snapToGrid(minCx - 40);
        const fw = snapToGrid(maxCx - minCx + 80);
        const fy = snapToGrid(frag.startY);
        const fh = snapToGrid(frag.endY - frag.startY);

        // Frame
        output.push(`  <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="4" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.22)" stroke-width="1"/>`);
        // Tab
        output.push(`  <rect x="${fx}" y="${fy}" width="40" height="16" rx="2" fill="${this.colors.paper}" stroke="rgba(45,49,66,0.22)" stroke-width="1"/>`);
        output.push(`  <text x="${fx + 20}" y="${fy + 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.12em">${frag.operator.toUpperCase()}</text>`);
        if (frag.condition) {
          output.push(`  <text x="${fx + 48}" y="${fy + 12}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}">[${frag.condition}]</text>`);
        }
      }
    }

    // 3. Activation Bars
    if (this.options.activations) {
      for (const act of this.options.activations) {
        const pos = actorPositions.get(act.actor);
        if (!pos) continue;
        const ax = snapToGrid(pos.cx - 4);
        const ay = snapToGrid(act.startY);
        const ah = snapToGrid(act.endY - act.startY);
        output.push(`  <rect x="${ax}" y="${ay}" width="8" height="${ah}" rx="2" fill="${this.colors.paper2}" stroke="${this.colors.muted}" stroke-width="0.8"/>`);
      }
    }

    // 4. Messages
    for (const msg of this.options.messages) {
      const fromPos = actorPositions.get(msg.from);
      const toPos = actorPositions.get(msg.to);
      if (!fromPos || !toPos) continue;

      const y = snapToGrid(msg.y);
      const isReturn = msg.kind === 'return';
      const isAsync = msg.kind === 'async';
      const isAccent = msg.kind === 'accent';

      let stroke = isAccent ? this.colors.accent : this.colors.muted;
      let marker = isAccent
        ? `url(#${this.id}-arrow-accent)`
        : isAsync
        ? `url(#${this.id}-arrow-open)`
        : `url(#${this.id}-arrow)`;
      let strokeDash = isReturn || isAsync ? ' stroke-dasharray="4,3"' : '';

      const x1 = fromPos.cx;
      const x2 = toPos.cx;

      output.push(`  <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${stroke}" stroke-width="1.2"${strokeDash} marker-end="${marker}"/>`);

      // Label
      const midX = snapToGrid((x1 + x2) / 2);
      const labelW = Math.max(40, msg.label.length * 6.5 + 12);
      output.push(`  <rect x="${midX - labelW / 2}" y="${y - 14}" width="${labelW}" height="12" rx="2" fill="${this.colors.paper}"/>`);
      output.push(`  <text x="${midX}" y="${y - 5}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${msg.label}</text>`);
    }

    // 5. Actor Boxes (drawn on top)
    for (const actor of this.options.actors) {
      const pos = actorPositions.get(actor.id)!;
      const x = pos.x;
      const y = actorY;
      const w = actorWidth;
      const h = actorHeight;
      const cx = pos.cx;
      const cy = y + h / 2;

      const fill = actor.focal ? this.colors.accentTint : '#ffffff';
      const stroke = actor.focal ? this.colors.accent : this.colors.ink;

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`);
      output.push(`  <text x="${cx}" y="${actor.sublabel ? cy - 2 : cy + 4}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${actor.label}</text>`);
      if (actor.sublabel) {
        output.push(`  <text x="${cx}" y="${cy + 12}" fill="${this.colors.muted}" font-size="9" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${actor.sublabel}</text>`);
      }
    }

    return output.join('\n');
  }
}
