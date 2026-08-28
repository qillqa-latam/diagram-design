import { describe, it, expect } from 'vitest';
import { routeOrthogonalConnector, getFannedAttachPoint, snapToGrid, isGridAligned } from './index.js';

describe('Orthogonal Router & 4px Grid Tests', () => {
  it('should snap numbers strictly to 4px grid', () => {
    expect(snapToGrid(1)).toBe(0);
    expect(snapToGrid(2)).toBe(4);
    expect(snapToGrid(6)).toBe(8);
    expect(snapToGrid(15)).toBe(16);
    expect(isGridAligned(16)).toBe(true);
    expect(isGridAligned(17)).toBe(false);
  });

  it('should generate collinear horizontal connectors without elbows', () => {
    const route = routeOrthogonalConnector({ x: 100, y: 200 }, { x: 300, y: 200 });
    expect(route.isStraightLine).toBe(true);
    expect(route.pathD).toBe('M 100,200 H 300');
  });

  it('should generate 2-bend orthogonal elbows with r=8 for off-axis points', () => {
    const route = routeOrthogonalConnector({ x: 100, y: 100 }, { x: 300, y: 200 });
    expect(route.isStraightLine).toBe(false);
    expect(route.pathD).toContain('H 192 Q 200,100 200,108 V 192 Q 200,200 208,200 H 300');
  });

  it('should fan attach points evenly on shared edges with >= 12px separation', () => {
    const node = { x: 100, y: 100, width: 140, height: 60 };
    const p1 = getFannedAttachPoint(node, 'right', 0, 3);
    const p2 = getFannedAttachPoint(node, 'right', 1, 3);
    const p3 = getFannedAttachPoint(node, 'right', 2, 3);

    expect(p1.x).toBe(240);
    expect(p2.x).toBe(240);
    expect(p3.x).toBe(240);

    // Check separation
    expect(p2.y - p1.y).toBeGreaterThanOrEqual(12);
    expect(p3.y - p2.y).toBeGreaterThanOrEqual(12);
  });

  it('should insert bridge/hop arcs when crossing lines', () => {
    const route = routeOrthogonalConnector(
      { x: 100, y: 200 },
      { x: 400, y: 200 },
      { bridgeHops: [{ x: 250, y: 200 }] }
    );
    expect(route.pathD).toContain('a 8,8 0 0,1 16,0');
  });
});
