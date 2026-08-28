import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface ItSystem {
  id: string;
  name: string;
  sublabel?: string;
  vendor?: string;
  status: 'legacy' | 'modern' | 'migrating' | 'retiring';
  x: number;
  y: number;
  width?: number;
  height?: number;
  focal?: boolean;
}

export interface ItDepartmentZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ItIntegration {
  from: string;
  to: string;
  protocol?: string;
  isBottleneck?: boolean;
  focal?: boolean;
}

export interface ItStateDiagramOptions extends BaseDiagramOptions {
  departments: ItDepartmentZone[];
  systems: ItSystem[];
  integrations?: ItIntegration[];
}

export class ItStateDiagram extends BaseDiagram<ItStateDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const sysMap = new Map<string, ItSystem & { w: number; h: number }>();

    for (const sys of this.options.systems) {
      const w = sys.width || 140;
      const h = sys.height || 64;
      sysMap.set(sys.id, { ...sys, w, h });
    }

    // 1. Department Zones
    for (const dept of this.options.departments) {
      const x = snapToGrid(dept.x);
      const y = snapToGrid(dept.y);
      const w = snapToGrid(dept.width);
      const h = snapToGrid(dept.height);

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.10)" stroke-width="0.8"/>`);
      output.push(`  <rect x="${x + 16}" y="${y + 4}" width="${Math.max(48, dept.name.length * 7 + 16)}" height="12" rx="2" fill="${this.colors.paper}"/>`);
      output.push(`  <text x="${x + 16 + Math.max(48, dept.name.length * 7 + 16) / 2}" y="${y + 13}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.12em">${dept.name.toUpperCase()}</text>`);
    }

    // 2. Integrations
    if (this.options.integrations) {
      for (const integ of this.options.integrations) {
        const src = sysMap.get(integ.from);
        const dst = sysMap.get(integ.to);
        if (!src || !dst) continue;

        const isRight = dst.x > src.x;
        const x1 = snapToGrid(isRight ? src.x + src.w : src.x);
        const y1 = snapToGrid(src.y + src.h / 2);
        const x2 = snapToGrid(isRight ? dst.x : dst.x + dst.w);
        const y2 = snapToGrid(dst.y + dst.h / 2);

        const stroke = integ.isBottleneck || integ.focal ? this.colors.accent : this.colors.muted;
        const marker = integ.isBottleneck || integ.focal ? `url(#${this.id}-arrow-accent)` : `url(#${this.id}-arrow)`;
        const midX = snapToGrid((x1 + x2) / 2);

        output.push(`  <path d="M ${x1},${y1} H ${midX - (isRight ? 8 : -8)} Q ${midX},${y1} ${midX},${y1 + (y2 > y1 ? 8 : -8)} V ${y2 - (y2 > y1 ? 8 : -8)} Q ${midX},${y2} ${midX + (isRight ? 8 : -8)},${y2} H ${x2}" fill="none" stroke="${stroke}" stroke-width="1.2" marker-end="${marker}"/>`);

        if (integ.protocol) {
          const midY = snapToGrid((y1 + y2) / 2);
          const labelW = Math.max(32, integ.protocol.length * 6.5 + 8);
          output.push(`  <rect x="${midX - labelW / 2}" y="${midY - 12}" width="${labelW}" height="12" rx="2" fill="${this.colors.paper}"/>`);
          output.push(`  <text x="${midX}" y="${midY - 3}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${integ.protocol}</text>`);
        }
      }
    }

    // 3. Systems
    for (const sys of this.options.systems) {
      const info = sysMap.get(sys.id)!;
      const x = snapToGrid(info.x);
      const y = snapToGrid(info.y);
      const w = snapToGrid(info.w);
      const h = snapToGrid(info.h);
      const cx = snapToGrid(x + w / 2);
      const cy = snapToGrid(y + h / 2);

      let stroke = this.colors.ink;
      let fill = '#ffffff';
      let strokeDash = '';

      if (sys.status === 'legacy') {
        fill = 'rgba(79,93,117,0.06)';
        stroke = this.colors.muted;
      } else if (sys.status === 'retiring') {
        fill = 'rgba(45,49,66,0.03)';
        stroke = this.colors.soft;
        strokeDash = ' stroke-dasharray="4,3"';
      } else if (sys.status === 'modern' || sys.focal) {
        fill = this.colors.accentTint;
        stroke = this.colors.accent;
      }

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1"${strokeDash}/>`);

      // Status tag
      const statusTag = sys.status.toUpperCase();
      output.push(`  <rect x="${x + 8}" y="${y + 6}" width="40" height="12" rx="2" fill="transparent" stroke="${stroke}" stroke-opacity="0.4" stroke-width="0.8"/>`);
      output.push(`  <text x="${x + 28}" y="${y + 15}" fill="${stroke}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${statusTag}</text>`);

      output.push(`  <text x="${cx}" y="${cy + 2}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}" text-anchor="middle">${sys.name}</text>`);
      if (sys.sublabel || sys.vendor) {
        const sub = sys.vendor ? `${sys.vendor} · ${sys.sublabel || ''}` : (sys.sublabel || '');
        output.push(`  <text x="${cx}" y="${cy + 16}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${sub}</text>`);
      }
    }

    return output.join('\n');
  }
}
