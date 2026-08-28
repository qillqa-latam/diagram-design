import type { Point, Rect } from './math.js';
import { snapToGrid } from './math.js';

export type PortSide = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface ConnectorEndpoint {
  x: number;
  y: number;
  side?: PortSide;
}

export interface ConnectorRouteOptions {
  radius?: number;
  bridgeHops?: Point[]; // Points where this line crosses another and should hop
  hopRadius?: number;
  labelPosition?: 'auto' | 'midpoint' | 'source' | 'target';
  labelMargin?: number; // Minimum 6px, default 8px
}

export interface ComputedRoute {
  pathD: string;
  isStraightLine: boolean;
  labelPoint: Point;
  maskRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Calculate the attach point on a node's edge with fanning support (Rule 4: >=12px gap).
 * k is 0-indexed index of connection, total is number of connections on this edge.
 */
export function getFannedAttachPoint(
  node: Rect,
  side: PortSide,
  index: number = 0,
  total: number = 1
): Point {
  if (total <= 1) {
    switch (side) {
      case 'top':
        return { x: snapToGrid(node.x + node.width / 2), y: snapToGrid(node.y) };
      case 'bottom':
        return { x: snapToGrid(node.x + node.width / 2), y: snapToGrid(node.y + node.height) };
      case 'left':
        return { x: snapToGrid(node.x), y: snapToGrid(node.y + node.height / 2) };
      case 'right':
        return { x: snapToGrid(node.x + node.width), y: snapToGrid(node.y + node.height / 2) };
      default:
        return { x: snapToGrid(node.x + node.width / 2), y: snapToGrid(node.y + node.height / 2) };
    }
  }

  // Fanning formula: offset = Length * (index + 1) / (total + 1)
  if (side === 'top' || side === 'bottom') {
    const y = side === 'top' ? node.y : node.y + node.height;
    const offset = (node.width * (index + 1)) / (total + 1);
    return { x: snapToGrid(node.x + offset), y: snapToGrid(y) };
  } else {
    const x = side === 'left' ? node.x : node.x + node.width;
    const offset = (node.height * (index + 1)) / (total + 1);
    return { x: snapToGrid(x), y: snapToGrid(node.y + offset) };
  }
}

/**
 * Automatically determine the best ports between two nodes based on their relative geometry.
 */
export function resolveAutoPorts(
  source: Rect,
  target: Rect
): { sourcePort: PortSide; targetPort: PortSide } {
  const dx = target.x + target.width / 2 - (source.x + source.width / 2);
  const dy = target.y + target.height / 2 - (source.y + source.height / 2);

  // If predominantly horizontal
  if (Math.abs(dx) >= Math.abs(dy)) {
    return {
      sourcePort: dx > 0 ? 'right' : 'left',
      targetPort: dx > 0 ? 'left' : 'right'
    };
  } else {
    // Predominantly vertical (top/bottom ports)
    return {
      sourcePort: dy > 0 ? 'bottom' : 'top',
      targetPort: dy > 0 ? 'top' : 'bottom'
    };
  }
}

/**
 * Route an orthogonal connector between two points adhering strictly to the 6 connector rules.
 */
export function routeOrthogonalConnector(
  start: Point,
  end: Point,
  options: ConnectorRouteOptions = {}
): ComputedRoute {
  const r = options.radius ?? 8;
  const labelMargin = Math.max(6, options.labelMargin ?? 8);
  const x1 = snapToGrid(start.x);
  const y1 = snapToGrid(start.y);
  const x2 = snapToGrid(end.x);
  const y2 = snapToGrid(end.y);

  // Case 1: Collinear horizontal
  if (y1 === y2) {
    const midX = snapToGrid((x1 + x2) / 2);
    let pathD = `M ${x1},${y1} H ${x2}`;

    if (options.bridgeHops && options.bridgeHops.length > 0) {
      const sortedHops = [...options.bridgeHops].sort((a, b) =>
        x1 < x2 ? a.x - b.x : b.x - a.x
      );
      pathD = `M ${x1},${y1}`;
      let currX = x1;
      for (const hop of sortedHops) {
        if ((x1 < x2 && hop.x > currX && hop.x < x2) || (x1 > x2 && hop.x < currX && hop.x > x2)) {
          const hopStartX = x1 < x2 ? hop.x - 8 : hop.x + 8;
          const hopDir = x1 < x2 ? 1 : 0;
          pathD += ` H ${hopStartX} a 8,8 0 0,${hopDir} ${x1 < x2 ? 16 : -16},0`;
          currX = x1 < x2 ? hop.x + 8 : hop.x - 8;
        }
      }
      pathD += ` H ${x2}`;
    }

    return {
      pathD,
      isStraightLine: true,
      labelPoint: { x: midX, y: y1 - (labelMargin + 4) },
      maskRect: {
        x: midX - 24,
        y: y1 - (labelMargin + 12),
        width: 48,
        height: 12
      }
    };
  }

  // Case 2: Collinear vertical
  if (x1 === x2) {
    const midY = snapToGrid((y1 + y2) / 2);
    const pathD = `M ${x1},${y1} V ${y2}`;
    return {
      pathD,
      isStraightLine: true,
      labelPoint: { x: x1 + (labelMargin + 16), y: midY },
      maskRect: {
        x: x1 + labelMargin,
        y: midY - 6,
        width: 32,
        height: 12
      }
    };
  }

  // Case 3: Standard 2-bend orthogonal elbow (right/left then up/down)
  const midX = snapToGrid((x1 + x2) / 2);
  const dx = x2 - x1;
  const dy = y2 - y1;

  const rX1 = dx > 0 ? r : -r;
  const rY1 = dy > 0 ? r : -r;
  const rX2 = dx > 0 ? r : -r;
  const rY2 = dy > 0 ? r : -r;

  // Formula from SKILL.md and type-architecture.md:
  // H mid-r Q mid,y1 mid,y1+r V y2-r Q mid,y2 mid+r,y2 H x2
  const pathD = `M ${x1},${y1} H ${midX - rX1} Q ${midX},${y1} ${midX},${y1 + rY1} V ${y2 - rY2} Q ${midX},${y2} ${midX + rX2},${y2} H ${x2}`;

  const labelY = snapToGrid((y1 + y2) / 2);
  const labelX = midX;

  return {
    pathD,
    isStraightLine: false,
    labelPoint: { x: labelX + (labelMargin + 16), y: labelY },
    maskRect: {
      x: labelX + labelMargin,
      y: labelY - 6,
      width: 40,
      height: 12
    }
  };
}

/**
 * Single-bend L-path connector (horizontal -> corner -> vertical into node).
 */
export function routeLPathConnector(
  start: Point,
  end: Point,
  radius: number = 8
): ComputedRoute {
  const x1 = snapToGrid(start.x);
  const y1 = snapToGrid(start.y);
  const x2 = snapToGrid(end.x);
  const y2 = snapToGrid(end.y);

  const rX = x2 > x1 ? radius : -radius;
  const rY = y2 > y1 ? radius : -radius;

  // M x1,y1 H x2-rX Q x2,y1 x2,y1+rY V y2
  const pathD = `M ${x1},${y1} H ${x2 - rX} Q ${x2},${y1} ${x2},${y1 + rY} V ${y2}`;

  return {
    pathD,
    isStraightLine: false,
    labelPoint: { x: snapToGrid((x1 + x2) / 2), y: y1 - 12 },
    maskRect: {
      x: snapToGrid((x1 + x2) / 2) - 20,
      y: y1 - 18,
      width: 40,
      height: 12
    }
  };
}
