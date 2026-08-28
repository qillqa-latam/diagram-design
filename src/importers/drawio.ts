import { ArchitectureDiagram } from '../diagrams/structural/architecture.js';
import type { BaseDiagram } from '../diagrams/base.js';

export interface DrawioImportOptions {
  title?: string;
  theme?: 'light' | 'dark' | 'terminal';
}

export function importDrawio(xmlSource: string, options: DrawioImportOptions = {}): BaseDiagram {
  const title = options.title || 'Redrawn Draw.io Diagram';

  // Parse mxCell elements
  const cellRegex = /<mxCell\b([^>]*?)(?:\/>|>([\s\S]*?)<\/mxCell>)/gi;
  const nodes: Array<{ id: string; label: string; x: number; y: number; width: number; height: number }> = [];
  const connections: Array<{ from: string; to: string; label?: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = cellRegex.exec(xmlSource)) !== null) {
    const attrs = match[1]!;
    const valMatch = attrs.match(/\bvalue="([^"]*)"/);
    const idMatch = attrs.match(/\bid="([^"]*)"/);
    const srcMatch = attrs.match(/\bsource="([^"]*)"/);
    const tgtMatch = attrs.match(/\btarget="([^"]*)"/);
    const edgeMatch = attrs.match(/\bedge="1"/);

    if (edgeMatch && srcMatch && tgtMatch) {
      connections.push({
        from: srcMatch[1]!,
        to: tgtMatch[1]!,
        label: valMatch ? valMatch[1] : undefined
      });
    } else if (idMatch && valMatch && valMatch[1]) {
      const geoMatch = match[0].match(/<mxGeometry\b[^>]*?\bx="(?<x>-?[\d.]+)"\s+y="(?<y>-?[\d.]+)"\s+width="(?<w>[\d.]+)"\s+height="(?<h>[\d.]+)"/i);
      if (geoMatch && geoMatch.groups) {
        nodes.push({
          id: idMatch[1]!,
          label: valMatch[1]!,
          x: parseFloat(geoMatch.groups['x']!),
          y: parseFloat(geoMatch.groups['y']!),
          width: parseFloat(geoMatch.groups['w']!),
          height: parseFloat(geoMatch.groups['h']!)
        });
      }
    }
  }

  const archNodes = nodes.map((n, idx) => ({
    id: n.id,
    label: n.label,
    x: n.x,
    y: n.y,
    width: n.width,
    height: n.height,
    focal: idx === 0
  }));

  return new ArchitectureDiagram({
    title,
    theme: options.theme || 'light',
    nodes: archNodes,
    connections
  });
}
