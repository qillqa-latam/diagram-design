import type { LinterIssue } from './geometry.js';
import { isGridAligned } from '../layout/math.js';

export function validate4pxGrid(svgString: string): LinterIssue[] {
  const issues: LinterIssue[] = [];

  // Match coordinates in rects, circles, lines, text
  const numRegex = /\b(?:x|y|x1|y1|x2|y2|width|height|cx|cy)="(?<val>-?[\d.]+)"/gi;
  let match: RegExpExecArray | null;

  while ((match = numRegex.exec(svgString)) !== null) {
    const val = parseFloat(match.groups!['val']!);
    if (!isGridAligned(val)) {
      issues.push({
        rule: 'grid-4px-aligned',
        severity: 'warning',
        message: `Value ${val} is not aligned to the 4px grid.`
      });
    }
  }

  return issues;
}
