import { StyleSheet, Platform, StatusBar } from 'react-native';
import type { ViewStyle } from 'react-native';

import type { EdgeInsets, MeasurableRef, SpotlightTarget } from './types';
import type { SpotlightBorderRadius } from './shapes';

const ZERO_INSETS: EdgeInsets = { top: 0, bottom: 0, left: 0, right: 0 };

/**
 * Compute the best tooltip position based on available screen space.
 * Prefers: bottom > top > right > left.
 * `insets` shrink the usable area so the tour avoids system chrome.
 */
interface TooltipPositionOptions {
  target: SpotlightTarget;
  screenWidth: number;
  screenHeight: number;
  tooltipWidth: number;
  tooltipHeight?: number;
  offset?: number;
  insets?: EdgeInsets;
}

export const computeTooltipPosition = ({
  target,
  screenWidth,
  screenHeight,
  tooltipWidth,
  tooltipHeight = 150,
  offset = 20,
  insets = ZERO_INSETS,
}: TooltipPositionOptions): 'top' | 'bottom' | 'left' | 'right' => {
  const spaceAbove = target.y - offset - insets.top;
  const spaceBelow = screenHeight - insets.bottom - (target.y + target.height + offset);
  const spaceLeft = target.x - offset - insets.left;
  const spaceRight = screenWidth - insets.right - (target.x + target.width + offset);

  if (spaceBelow >= tooltipHeight) return 'bottom';
  if (spaceAbove >= tooltipHeight) return 'top';
  if (spaceRight >= tooltipWidth * 0.6) return 'right';
  if (spaceLeft >= tooltipWidth * 0.6) return 'left';

  return spaceBelow >= spaceAbove ? 'bottom' : 'top';
};

// Cache the safe-area lookup from react-native-safe-area-context (optional dep).
// `undefined` = not resolved yet, `null` = lib unavailable.
let _autoInsets: EdgeInsets | null | undefined;

const getAutoInsets = (): EdgeInsets => {
  if (_autoInsets === undefined) {
    try {
      // initialWindowMetrics is a synchronous snapshot — no hook required, so
      // this works from plain functions and is set once at app launch.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('react-native-safe-area-context');
      const metricsInsets = mod?.initialWindowMetrics?.insets;
      _autoInsets = metricsInsets
        ? {
            top: metricsInsets.top ?? 0,
            bottom: metricsInsets.bottom ?? 0,
            left: metricsInsets.left ?? 0,
            right: metricsInsets.right ?? 0,
          }
        : null;
    } catch {
      _autoInsets = null;
    }
  }
  if (_autoInsets) return _autoInsets;
  // Fallback: Android status-bar height for the top edge; nothing reliable for
  // the bottom without the safe-area lib, so consumers should pass `insets`.
  const top = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
  return { top, bottom: 0, left: 0, right: 0 };
};

/**
 * Resolve just the safe-area insets (auto-detected, or overridden via
 * `config.insets`) — WITHOUT any `extraInsets`. This is the value that mirrors
 * system chrome like the status bar, and is what corrects `measureInWindow`
 * coordinates on Android (see TourGuideOverlay).
 */
export const resolveSafeAreaInsets = (config?: {
  insets?: Partial<EdgeInsets>;
}): EdgeInsets => {
  const auto = getAutoInsets();
  return {
    top: config?.insets?.top ?? auto.top,
    bottom: config?.insets?.bottom ?? auto.bottom,
    left: config?.insets?.left ?? auto.left,
    right: config?.insets?.right ?? auto.right,
  };
};

/**
 * Resolve the effective insets the tour should respect for layout/clamping:
 * the safe area plus any `config.extraInsets` for app chrome like tab bars and
 * headers.
 */
export const resolveInsets = (config?: {
  insets?: Partial<EdgeInsets>;
  extraInsets?: Partial<EdgeInsets>;
}): EdgeInsets => {
  const base = resolveSafeAreaInsets(config);
  const extra = config?.extraInsets;
  return {
    top: base.top + (extra?.top ?? 0),
    bottom: base.bottom + (extra?.bottom ?? 0),
    left: base.left + (extra?.left ?? 0),
    right: base.right + (extra?.right ?? 0),
  };
};

/**
 * Validate that a ref is valid and points to a mounted component.
 * Returns true if valid, false otherwise.
 */
export const validateRef = (ref: MeasurableRef | undefined, stepId: string): boolean => {
  // No ref at all is an intentional, supported case: a centered tooltip with no
  // spotlight (e.g. a welcome/finish step). Don't warn — it's not a mistake.
  if (!ref) {
    return false;
  }

  // A ref was provided but points to nothing — this usually IS a mistake
  // (component not mounted yet / wrong ref), so it's worth a dev warning.
  if (!ref.current) {
    console.warn(
      `react-native-tour-guide: Step "${stepId}" targetRef.current is null. The component may not be mounted; showing a centered tooltip instead.`
    );
    return false;
  }

  return true;
};

/**
 * Extract border radius values from a View style.
 * Returns a SpotlightBorderRadius (number if uniform, object if per-corner),
 * or undefined if no border radius is specified.
 *
 * Percentage radii (e.g. `'50%'`, supported by React Native 0.76+) are resolved
 * against the target's shorter side when `target` dimensions are provided — this
 * is what keeps a circular avatar (`borderRadius: '50%'`) round instead of square.
 * Without `target`, percentages fall back to the numeric base/0.
 */
export const extractBorderRadius = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: any,
  target?: { width: number; height: number }
): SpotlightBorderRadius | undefined => {
  if (!style) return undefined;

  const flat = StyleSheet.flatten(style) as ViewStyle | undefined;
  if (!flat) return undefined;

  const {
    borderRadius,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius,
  } = flat;

  // No border radius properties at all
  if (
    borderRadius === undefined &&
    borderTopLeftRadius === undefined &&
    borderTopRightRadius === undefined &&
    borderBottomLeftRadius === undefined &&
    borderBottomRightRadius === undefined
  ) {
    return undefined;
  }

  // The shorter side: a radius of `minDim / 2` produces a circle (square target)
  // or a pill (rectangular target), which is exactly how RN renders `'50%'`.
  const minDim = target ? Math.min(target.width, target.height) : 0;

  // Coerce to a number, resolving percentage strings against the target.
  const toNum = (v: string | number | undefined, fallback: number): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (trimmed.endsWith('%')) {
        const pct = parseFloat(trimmed);
        if (!Number.isNaN(pct) && minDim > 0) return (pct / 100) * minDim;
      }
    }
    return fallback;
  };

  const base = toNum(borderRadius, 0);
  const tl = toNum(borderTopLeftRadius, base);
  const tr = toNum(borderTopRightRadius, base);
  const br = toNum(borderBottomRightRadius, base);
  const bl = toNum(borderBottomLeftRadius, base);

  // All corners the same → return number for smooth rect animation
  if (tl === tr && tr === br && br === bl) {
    return tl;
  }

  return { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl };
};
