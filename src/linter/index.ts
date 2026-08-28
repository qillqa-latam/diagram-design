import type { BaseDiagram } from '../diagrams/base.js';
import { validateGeometryMasks, type LinterIssue } from './geometry.js';
import { validate4pxGrid } from './grid.js';

export * from './geometry.js';
export * from './grid.js';
export * from './conservation.js';
export * from './budget.js';

export function lintDiagram(diagram: BaseDiagram): LinterIssue[] {
  const svg = diagram.renderSvg();
  const issues: LinterIssue[] = [];

  // 1. Geometry Mask Clipping
  issues.push(...validateGeometryMasks(svg));

  // 2. 4px Grid Alignment
  issues.push(...validate4pxGrid(svg));

  return issues;
}
