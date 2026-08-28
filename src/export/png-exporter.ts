import { Resvg } from '@resvg/resvg-js';
import type { BaseDiagram } from '../diagrams/base.js';

export interface PngExportOptions {
  scale?: number;
  background?: string;
  width?: number;
  height?: number;
}

export async function renderToPngBuffer(
  svgStringOrDiagram: string | BaseDiagram,
  options: PngExportOptions = {}
): Promise<Buffer> {
  const svg = typeof svgStringOrDiagram === 'string'
    ? svgStringOrDiagram
    : svgStringOrDiagram.renderSvg();

  const resvg = new Resvg(svg, {
    fitTo: options.scale
      ? { mode: 'zoom', value: options.scale }
      : options.width
      ? { mode: 'width', value: options.width }
      : { mode: 'zoom', value: 2 },
    background: options.background
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
