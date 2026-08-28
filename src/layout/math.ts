export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Snap a value to the nearest multiple of 4 (the mandatory grid rule).
 */
export function snapToGrid(value: number, grid: number = 4): number {
  return Math.round(value / grid) * grid;
}

/**
 * Check if a value is strictly divisible by 4.
 */
export function isGridAligned(value: number, grid: number = 4): boolean {
  return Math.abs(value % grid) < 1e-6;
}

/**
 * Convert polar coordinates (angle in degrees, radius) to Cartesian (x, y)
 * 0 degrees = right (standard math), -90 degrees = top (diagram convention)
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): Point {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: snapToGrid(centerX + radius * Math.cos(angleInRadians)),
    y: snapToGrid(centerY + radius * Math.sin(angleInRadians))
  };
}

/**
 * Exact polar to Cartesian without grid snapping (for smooth curves/paths).
 */
export function polarToCartesianExact(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): Point {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

/**
 * Check if two rectangles intersect.
 */
export function rectsOverlap(r1: Rect, r2: Rect, tolerance: number = 0.5): boolean {
  const overlapX = Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x);
  const overlapY = Math.min(r1.y + r1.height, r2.y + r2.height) - Math.max(r1.y, r2.y);
  return overlapX > tolerance && overlapY > tolerance;
}

/**
 * Check if rect `child` is completely contained inside `parent`.
 */
export function rectContains(parent: Rect, child: Rect, tolerance: number = 0.5): boolean {
  return (
    child.x >= parent.x - tolerance &&
    child.y >= parent.y - tolerance &&
    child.x + child.width <= parent.x + parent.width + tolerance &&
    child.y + child.height <= parent.y + parent.height + tolerance
  );
}

/**
 * Compute the bounding box of a list of points or rects.
 */
export function getBoundingBox(rects: Rect[]): Rect {
  if (rects.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const r of rects) {
    if (r.x < minX) minX = r.x;
    if (r.y < minY) minY = r.y;
    if (r.x + r.width > maxX) maxX = r.x + r.width;
    if (r.y + r.height > maxY) maxY = r.y + r.height;
  }

  return {
    x: snapToGrid(minX),
    y: snapToGrid(minY),
    width: snapToGrid(maxX - minX),
    height: snapToGrid(maxY - minY)
  };
}
