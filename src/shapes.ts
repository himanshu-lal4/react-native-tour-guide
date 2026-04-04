import type { SpotlightTarget } from './types';

/**
 * Internal type for border radius — number for uniform, object for per-corner.
 * Users specify this via `targetStyle` (auto-extracted) or `spotlightBorderRadius` (number override).
 */
export type SpotlightBorderRadius =
  | number
  | {
      topLeft?: number;
      topRight?: number;
      bottomRight?: number;
      bottomLeft?: number;
    };

// --- Result types ---

export interface ShapeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RectShapeResult {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  ry: number;
}

export interface PathShapeResult {
  kind: 'path';
  d: string;
  bounds: ShapeBounds;
}

export type ShapeResult = RectShapeResult | PathShapeResult;

// --- Rect bounds computation ---

const computeRectBounds = (target: SpotlightTarget, padding: number) => ({
  x: target.x - padding,
  y: target.y - padding,
  width: target.width + padding * 2,
  height: target.height + padding * 2,
});

// --- Rounded rect with per-corner radii ---

const computeRoundedRectPath = (
  x: number,
  y: number,
  w: number,
  h: number,
  tl: number,
  tr: number,
  br: number,
  bl: number
): string => {
  // Clamp radii so they don't exceed half the smallest dimension
  const maxR = Math.min(w, h) / 2;
  const rtl = Math.min(tl, maxR);
  const rtr = Math.min(tr, maxR);
  const rbr = Math.min(br, maxR);
  const rbl = Math.min(bl, maxR);

  return [
    `M${x + rtl},${y}`,
    `L${x + w - rtr},${y}`,
    rtr > 0 ? `A${rtr},${rtr},0,0,1,${x + w},${y + rtr}` : `L${x + w},${y}`,
    `L${x + w},${y + h - rbr}`,
    rbr > 0 ? `A${rbr},${rbr},0,0,1,${x + w - rbr},${y + h}` : `L${x + w},${y + h}`,
    `L${x + rbl},${y + h}`,
    rbl > 0 ? `A${rbl},${rbl},0,0,1,${x},${y + h - rbl}` : `L${x},${y + h}`,
    `L${x},${y + rtl}`,
    rtl > 0 ? `A${rtl},${rtl},0,0,1,${x + rtl},${y}` : `L${x},${y}`,
    'Z',
  ].join(' ');
};

// --- Public API ---

/**
 * Adjust border radius for the larger spotlight bounds.
 * Fully rounded elements (circle/pill) stay fully rounded at the new size.
 * Partially rounded elements keep their exact original radius.
 */
const adjustRadius = (
  radius: number,
  targetWidth: number,
  targetHeight: number,
  padding: number
): number => {
  if (radius <= 0) return 0;
  const minTarget = Math.min(targetWidth, targetHeight);
  // Fully rounded (circle / pill) — stay fully rounded at the larger size
  if (radius >= minTarget / 2) {
    return Math.min(targetWidth + padding * 2, targetHeight + padding * 2) / 2;
  }
  // Partially rounded — keep exact same radius, only bounds grow
  return radius;
};

/**
 * Compute the spotlight shape for a target.
 * Always produces a rounded rectangle matching the target's border radius.
 * Border radii are scaled proportionally so circles stay circular with padding.
 */
export const computeShape = (
  target: SpotlightTarget,
  padding: number,
  customBorderRadius?: SpotlightBorderRadius
): ShapeResult => {
  const { x, y, width, height } = computeRectBounds(target, padding);

  // Per-corner border radius → generate path with individual corner arcs
  if (typeof customBorderRadius === 'object' && customBorderRadius !== null) {
    const { topLeft = 0, topRight = 0, bottomRight = 0, bottomLeft = 0 } = customBorderRadius;

    // Scale each corner
    const sTL = adjustRadius(topLeft, target.width, target.height, padding);
    const sTR = adjustRadius(topRight, target.width, target.height, padding);
    const sBR = adjustRadius(bottomRight, target.width, target.height, padding);
    const sBL = adjustRadius(bottomLeft, target.width, target.height, padding);

    // If all corners are the same, use rect for smooth animation
    if (sTL === sTR && sTR === sBR && sBR === sBL) {
      return { kind: 'rect', x, y, width, height, rx: sTL, ry: sTL };
    }

    // Different corners: use path
    const d = computeRoundedRectPath(x, y, width, height, sTL, sTR, sBR, sBL);
    return { kind: 'path', d, bounds: { x, y, width, height } };
  }

  const br = typeof customBorderRadius === 'number' ? customBorderRadius : 12;
  const scaledBr = adjustRadius(br, target.width, target.height, padding);
  return { kind: 'rect', x, y, width, height, rx: scaledBr, ry: scaledBr };
};
