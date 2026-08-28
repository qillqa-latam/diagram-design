import { describe, it, expect } from 'vitest';
import { validateGeometryMasks, validate4pxGrid, validateComplexityBudget } from './index.js';

describe('Taste Gate & Linters Test Suite', () => {
  it('should detect when a label mask is clipped by a later painted node', () => {
    // Label mask at (60, 90, 48x12), then Node at (80, 80, 140x60) painted after (crossing the border)
    const invalidSvg = `
      <svg>
        <rect x="60" y="90" width="48" height="12" fill="#ffffff"/>
        <rect x="80" y="80" width="140" height="60" fill="#ffffff"/>
      </svg>
    `;
    const issues = validateGeometryMasks(invalidSvg);
    expect(issues.length).toBe(1);
    expect(issues[0]!.rule).toBe('geometry-no-clipping');
  });

  it('should pass valid SVG when nodes are drawn properly', () => {
    const validSvg = `
      <svg>
        <rect x="40" y="40" width="140" height="60" fill="#ffffff"/>
        <rect x="240" y="40" width="140" height="60" fill="#ffffff"/>
        <rect x="190" y="30" width="36" height="12" fill="#f5f5f5"/>
      </svg>
    `;
    const issues = validateGeometryMasks(validSvg);
    expect(issues.length).toBe(0);
  });

  it('should check for 4px grid violations', () => {
    const offGridSvg = `<svg><rect x="17" y="22" width="103" height="49"/></svg>`;
    const issues = validate4pxGrid(offGridSvg);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(i => i.rule === 'grid-4px-aligned')).toBe(true);
  });

  it('should warn when complexity budget is exceeded', () => {
    const issues = validateComplexityBudget({
      nodeCount: 15, // max recommended 9
      focalCount: 4 // max allowed 2
    });
    expect(issues.length).toBe(2);
    expect(issues.some(i => i.severity === 'error' && i.rule === 'complexity-focal-budget')).toBe(true);
    expect(issues.some(i => i.severity === 'warning' && i.rule === 'complexity-node-budget')).toBe(true);
  });
});
