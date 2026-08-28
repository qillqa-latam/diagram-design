export interface LinterIssue {
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  element?: string;
}

const RECT_REGEX = /<rect\b[^>]*?\bx="(?<x>-?[\d.]+)"\s+y="(?<y>-?[\d.]+)"\s+width="(?<w>[\d.]+)"\s+height="(?<h>[\d.]+)"/gi;

interface ParsedRect {
  x: number;
  y: number;
  w: number;
  h: number;
  offset: number;
}

export function validateGeometryMasks(svgString: string): LinterIssue[] {
  const issues: LinterIssue[] = [];
  const rects: ParsedRect[] = [];

  let match: RegExpExecArray | null;
  while ((match = RECT_REGEX.exec(svgString)) !== null) {
    if (match.groups) {
      rects.push({
        x: parseFloat(match.groups['x']!),
        y: parseFloat(match.groups['y']!),
        w: parseFloat(match.groups['w']!),
        h: parseFloat(match.groups['h']!),
        offset: match.index
      });
    }
  }

  // Node heuristic: rect >= 60x40
  // Mask heuristic: rect width 20..200 and height 8..14
  for (let i = 0; i < rects.length; i++) {
    const r1 = rects[i]!;
    const isMask = r1.w >= 20 && r1.w <= 200 && r1.h >= 8 && r1.h <= 16;
    if (!isMask) continue;

    for (let j = i + 1; j < rects.length; j++) {
      const r2 = rects[j]!;
      const isNode = r2.w >= 60 && r2.h >= 40;
      if (!isNode) continue;

      // Check if mask r1 intersects node r2 (which is painted AFTER r1)
      const overlapX = Math.min(r1.x + r1.w, r2.x + r2.w) - Math.max(r1.x, r2.x);
      const overlapY = Math.min(r1.y + r1.h, r2.y + r2.h) - Math.max(r1.y, r2.y);

      if (overlapX > 0.5 && overlapY > 0.5) {
        // Check if mask is fully contained inside node (allowed badge chip)
        const isBadge =
          r1.x >= r2.x - 0.5 &&
          r1.y >= r2.y - 0.5 &&
          r1.x + r1.w <= r2.x + r2.w + 0.5 &&
          r1.y + r1.h <= r2.y + r2.h + 0.5;

        if (!isBadge) {
          issues.push({
            rule: 'geometry-no-clipping',
            severity: 'error',
            message: `Label mask (${r1.x},${r1.y} ${r1.w}x${r1.h}) is clipped by later-painted node (${r2.x},${r2.y} ${r2.w}x${r2.h})`
          });
        }
      }
    }
  }

  return issues;
}
