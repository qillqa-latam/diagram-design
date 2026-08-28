import { BaseDiagram, type BaseDiagramOptions } from '../base.js';
import { buildNodeBox, buildZoneContainer, buildAnnotationCallout } from '../../svg/primitives.js';
import { routeOrthogonalConnector, resolveAutoPorts, getFannedAttachPoint } from '../../layout/router.js';
import { FONT_FAMILIES } from '../../tokens/typography.js';

export interface ArchitectureNode {
  id: string;
  label: string;
  sublabel?: string;
  tag?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  kind?: 'backend' | 'focal' | 'store' | 'external' | 'input' | 'optional' | 'security';
  focal?: boolean;
}

export interface ArchitectureZone {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ArchitectureConnection {
  from: string;
  to: string;
  label?: string;
  kind?: 'default' | 'accent' | 'link' | 'dashed';
  fromSide?: 'top' | 'bottom' | 'left' | 'right';
  toSide?: 'top' | 'bottom' | 'left' | 'right';
}

export interface ArchitectureDiagramOptions extends BaseDiagramOptions {
  zones?: ArchitectureZone[];
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
  callouts?: Array<{
    text: string;
    targetNodeId: string;
    textPoint: { x: number; y: number };
    focal?: boolean;
  }>;
}

export class ArchitectureDiagram extends BaseDiagram<ArchitectureDiagramOptions> {
  renderInnerSvg(): string {
    const output: string[] = [];
    const nodeMap = new Map<string, ArchitectureNode & { w: number; h: number }>();

    for (const node of this.options.nodes) {
      nodeMap.set(node.id, {
        ...node,
        w: node.width || 140,
        h: node.height || 64
      });
    }

    // 1. Zones (drawn first so background washes stay under arrows & nodes)
    if (this.options.zones) {
      for (const zone of this.options.zones) {
        output.push(buildZoneContainer(this.colors, zone));
      }
    }

    // 2. Connectors / Arrows (drawn before nodes so arrows terminate neatly at box edges)
    const edgeCounts = new Map<string, { count: number; current: number }>();
    for (const conn of this.options.connections) {
      const keyFrom = `${conn.from}-${conn.fromSide || 'auto'}`;
      const keyTo = `${conn.to}-${conn.toSide || 'auto'}`;
      edgeCounts.set(keyFrom, { count: (edgeCounts.get(keyFrom)?.count || 0) + 1, current: 0 });
      edgeCounts.set(keyTo, { count: (edgeCounts.get(keyTo)?.count || 0) + 1, current: 0 });
    }

    const labelsToDraw: string[] = [];

    for (const conn of this.options.connections) {
      const src = nodeMap.get(conn.from);
      const dst = nodeMap.get(conn.to);
      if (!src || !dst) continue;

      const auto = resolveAutoPorts(
        { x: src.x, y: src.y, width: src.w, height: src.h },
        { x: dst.x, y: dst.y, width: dst.w, height: dst.h }
      );

      const srcSide = conn.fromSide || auto.sourcePort;
      const dstSide = conn.toSide || auto.targetPort;

      const srcAttach = getFannedAttachPoint(
        { x: src.x, y: src.y, width: src.w, height: src.h },
        srcSide
      );
      const dstAttach = getFannedAttachPoint(
        { x: dst.x, y: dst.y, width: dst.w, height: dst.h },
        dstSide
      );

      const route = routeOrthogonalConnector(srcAttach, dstAttach);

      let stroke = this.colors.muted;
      let marker = `url(#${this.id}-arrow)`;
      let strokeDash = '';
      let strokeWidth = '1.2';

      if (conn.kind === 'accent') {
        stroke = this.colors.accent;
        marker = `url(#${this.id}-arrow-accent)`;
        strokeWidth = '1.4';
      } else if (conn.kind === 'link') {
        stroke = this.colors.link;
        marker = `url(#${this.id}-arrow-link)`;
      } else if (conn.kind === 'dashed') {
        stroke = this.colors.muted;
        strokeDash = ' stroke-dasharray="4,3"';
        strokeWidth = '1';
      }

      output.push(`  <path d="${route.pathD}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"${strokeDash} marker-end="${marker}"/>`);

      // Label with paper mask
      if (conn.label) {
        const mask = route.maskRect;
        const lp = route.labelPoint;
        labelsToDraw.push(`  <rect x="${mask.x}" y="${mask.y}" width="${mask.width}" height="${mask.height}" rx="2" fill="${this.colors.paper}"/>\n  <text x="${lp.x}" y="${lp.y}" fill="${stroke}" font-size="8" font-family="${FONT_FAMILIES.mono}" text-anchor="middle" letter-spacing="0.08em">${conn.label.toUpperCase()}</text>`);
      }
    }

    // 3. Labels
    output.push(...labelsToDraw);

    // 4. Nodes
    for (const node of this.options.nodes) {
      output.push(
        buildNodeBox(this.colors, {
          x: node.x,
          y: node.y,
          width: node.width || 140,
          height: node.height || 64,
          label: node.label,
          sublabel: node.sublabel,
          tag: node.tag,
          kind: node.kind,
          focal: node.focal
        })
      );
    }

    // 5. Callouts
    if (this.options.callouts) {
      for (const callout of this.options.callouts) {
        const target = nodeMap.get(callout.targetNodeId);
        if (target) {
          output.push(
            buildAnnotationCallout(this.colors, {
              text: callout.text,
              targetPoint: { x: target.x + target.w / 2, y: target.y + target.h / 2 },
              textPoint: callout.textPoint,
              focal: callout.focal
            })
          );
        }
      }
    }

    return output.join('\n');
  }
}
