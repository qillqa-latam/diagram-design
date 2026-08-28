import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { snapToGrid } from '../../layout/math.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface DeploymentArtifact {
  name: string;
  kind?: string;
  port?: string;
}

export interface DeploymentHost {
  id: string;
  label: string;
  ipOrDns?: string;
  x: number;
  y: number;
  width?: number;
  artifacts: DeploymentArtifact[];
  focal?: boolean;
}

export interface DeploymentZone {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DeploymentConnection {
  from: string;
  to: string;
  label?: string;
  port?: string;
  focal?: boolean;
}

export interface DeploymentDiagramOptions extends BaseDiagramOptions {
  zones: DeploymentZone[];
  hosts: DeploymentHost[];
  connections?: DeploymentConnection[];
}

export class DeploymentDiagram extends BaseDiagram<DeploymentDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const hostMap = new Map<string, DeploymentHost & { w: number; h: number }>();

    for (const host of this.options.hosts) {
      const w = host.width || 180;
      const h = 40 + host.artifacts.length * 36 + 12;
      hostMap.set(host.id, { ...host, w, h });
    }

    // 1. Zones
    for (const zone of this.options.zones) {
      const x = snapToGrid(zone.x);
      const y = snapToGrid(zone.y);
      const w = snapToGrid(zone.width);
      const h = snapToGrid(zone.height);

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="rgba(45,49,66,0.02)" stroke="rgba(45,49,66,0.15)" stroke-width="0.8" stroke-dasharray="4,4"/>`);
      output.push(`  <rect x="${x + 16}" y="${y + 4}" width="${Math.max(48, zone.label.length * 7 + 16)}" height="12" rx="2" fill="${this.colors.paper}"/>`);
      output.push(`  <text x="${x + 16 + Math.max(48, zone.label.length * 7 + 16) / 2}" y="${y + 13}" fill="${this.colors.muted}" font-size="7" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.12em">${zone.label.toUpperCase()}</text>`);
    }

    // 2. Connections
    if (this.options.connections) {
      for (const conn of this.options.connections) {
        const src = hostMap.get(conn.from);
        const dst = hostMap.get(conn.to);
        if (!src || !dst) continue;

        const isRight = dst.x > src.x;
        const x1 = snapToGrid(isRight ? src.x + src.w : src.x);
        const y1 = snapToGrid(src.y + src.h / 2);
        const x2 = snapToGrid(isRight ? dst.x : dst.x + dst.w);
        const y2 = snapToGrid(dst.y + dst.h / 2);

        const stroke = conn.focal ? this.colors.accent : this.colors.muted;
        const marker = conn.focal ? `url(#${this.id}-arrow-accent)` : `url(#${this.id}-arrow)`;
        const midX = snapToGrid((x1 + x2) / 2);

        output.push(`  <path d="M ${x1},${y1} H ${midX - (isRight ? 8 : -8)} Q ${midX},${y1} ${midX},${y1 + (y2 > y1 ? 8 : -8)} V ${y2 - (y2 > y1 ? 8 : -8)} Q ${midX},${y2} ${midX + (isRight ? 8 : -8)},${y2} H ${x2}" fill="none" stroke="${stroke}" stroke-width="1.2" marker-end="${marker}"/>`);

        const labelText = conn.port ? `${conn.label || ''} :${conn.port}`.trim() : (conn.label || '');
        if (labelText) {
          const midY = snapToGrid((y1 + y2) / 2);
          const labelW = Math.max(32, labelText.length * 6.5 + 8);
          output.push(`  <rect x="${midX - labelW / 2}" y="${midY - 12}" width="${labelW}" height="12" rx="2" fill="${this.colors.paper}"/>`);
          output.push(`  <text x="${midX}" y="${midY - 3}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle">${labelText}</text>`);
        }
      }
    }

    // 3. Hosts
    for (const host of this.options.hosts) {
      const info = hostMap.get(host.id)!;
      const x = snapToGrid(info.x);
      const y = snapToGrid(info.y);
      const w = snapToGrid(info.w);
      const h = snapToGrid(info.h);

      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${this.colors.paper}"/>`);
      output.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#ffffff" stroke="${host.focal ? this.colors.accent : this.colors.ink}" stroke-width="1"/>`);

      // Host Header
      output.push(`  <text x="${x + 12}" y="${y + 20}" fill="${this.colors.ink}" font-size="12" font-weight="600" font-family="${FONT_FAMILIES.sans}">${host.label}</text>`);
      if (host.ipOrDns) {
        output.push(`  <text x="${x + w - 12}" y="${y + 20}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="end">${host.ipOrDns}</text>`);
      }
      output.push(`  <line x1="${x}" y1="${y + 30}" x2="${x + w}" y2="${y + 30}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);

      // Artifacts / Containers
      let currY = y + 40;
      for (const artifact of host.artifacts) {
        output.push(`  <rect x="${x + 8}" y="${currY}" width="${w - 16}" height="28" rx="4" fill="${this.colors.paper2}" stroke="${this.colors.rule}" stroke-width="0.8"/>`);
        output.push(`  <text x="${x + 16}" y="${currY + 18}" fill="${this.colors.ink}" font-size="10" font-family="${FONT_FAMILIES.sans}">${artifact.name}</text>`);
        if (artifact.port) {
          output.push(`  <text x="${x + w - 16}" y="${currY + 18}" fill="${this.colors.muted}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="end">:${artifact.port}</text>`);
        }
        currY += 36;
      }
    }

    return output.join('\n');
  }
}
