import { StyleSheet, Platform, StatusBar } from 'react-native';
import type { ViewStyle } from 'react-native';

import type {
  EdgeInsets,
  MeasurableRef,
  OSConfig,
  PerPlatform,
  ResolvedTourGuideConfig,
  SpotlightTarget,
  TourGuideConfig,
} from './types';
import { warnOnce } from './dev';
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
export const resolveSafeAreaInsets = (config?: { insets?: Partial<EdgeInsets> }): EdgeInsets => {
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
    warnOnce(
      `Step "${stepId}" has a targetRef whose .current is null, so there is nothing to highlight. Showing a centered tooltip instead.`,
      'Attach the ref to a rendered host component (e.g. <View ref={ref}>) and make sure it is mounted before startTour() runs.'
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

/**
 * Scroll a scrollable ref to an absolute Y offset.
 *
 * Consumers pass all kinds of scrollables, and each exposes a different imperative
 * API — assuming `scrollTo` crashes with `scrollTo is not a function` on the most
 * common one (`FlatList`). This normalises across:
 *
 *  - `ScrollView` (and gesture-handler / Animated wrappers) → `scrollTo`
 *  - `FlatList` / `VirtualizedList`                         → `scrollToOffset`
 *  - `SectionList` and other list wrappers                  → `getScrollResponder()` / `getScrollRef()`
 *  - legacy `Animated.ScrollView`                           → `getNode()`
 *  - `KeyboardAwareScrollView`                              → `scrollToPosition`
 *
 * @returns true if a scroll was actually issued, false if the ref exposes no
 * usable scroll method (the caller should then continue without scrolling
 * rather than leaving the tour stuck).
 */
export const scrollRefToY = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scrollRef: { current: any } | null | undefined,
  y: number,
  animated: boolean
): boolean => {
  const node = scrollRef?.current;
  if (!node) return false;

  const targetY = Math.max(0, y);

  // Unwrap legacy Animated.ScrollView / list wrappers that hide the real
  // scrollable behind a getter.
  const candidates = [node];
  for (const getter of ['getNode', 'getScrollResponder', 'getScrollRef'] as const) {
    try {
      if (typeof node[getter] === 'function') {
        const inner = node[getter]();
        if (inner) candidates.push(inner);
      }
    } catch {
      // A getter that throws (unmounted inner list) is not usable — skip it.
    }
  }

  for (const c of candidates) {
    try {
      if (typeof c.scrollTo === 'function') {
        c.scrollTo({ x: 0, y: targetY, animated });
        return true;
      }
      if (typeof c.scrollToOffset === 'function') {
        c.scrollToOffset({ offset: targetY, animated });
        return true;
      }
      if (typeof c.scrollToPosition === 'function') {
        c.scrollToPosition(0, targetY, animated);
        return true;
      }
    } catch {
      // Try the next candidate rather than taking the whole tour down.
    }
  }

  return false;
};

// ─── Color parsing for readable-by-default tooltips ──────────────────────────

const NAMED_COLORS: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  gray: '#808080',
  grey: '#808080',
  red: '#ff0000',
  blue: '#0000ff',
  green: '#008000',
  yellow: '#ffff00',
  orange: '#ffa500',
  purple: '#800080',
  transparent: '#00000000',
};

/**
 * Whether a background color is light (true), dark (false), or unparseable
 * (null). Supports #rgb/#rgba/#rrggbb/#rrggbbaa, rgb()/rgba(), and a handful of
 * common named colors — enough for the tooltip-background use case; anything
 * exotic returns null and callers keep their existing defaults.
 *
 * Used to pick readable default text colors when a consumer sets a custom
 * tooltip background: a pale background used to get the built-in white title
 * text, which is invisible.
 */
export const isLightColor = (color: string): boolean | null => {
  if (typeof color !== 'string') return null;
  let c = color.trim().toLowerCase();
  c = NAMED_COLORS[c] ?? c;

  let r: number, g: number, b: number;

  const rgbMatch = c.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (rgbMatch) {
    r = parseFloat(rgbMatch[1] as string);
    g = parseFloat(rgbMatch[2] as string);
    b = parseFloat(rgbMatch[3] as string);
  } else if (/^#[0-9a-f]{3,8}$/.test(c)) {
    const hex = c.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      r = parseInt((hex[0] as string) + hex[0], 16);
      g = parseInt((hex[1] as string) + hex[1], 16);
      b = parseInt((hex[2] as string) + hex[2], 16);
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return null;
    }
  } else {
    return null;
  }

  if ([r, g, b].some((v) => Number.isNaN(v) || v < 0 || v > 255)) return null;

  // Perceived brightness (ITU-R BT.601), same scale tinycolor uses: 0-255.
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180;
};

// ─── Per-platform config values ──────────────────────────────────────────────

const OS_KEYS = new Set(['ios', 'android', 'web', 'default']);

const isOSConfig = (value: unknown): value is OSConfig<unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((k) => OS_KEYS.has(k));
};

/**
 * Resolve a possibly per-platform value for the running OS.
 * `{ ios: 12, default: 8 }` → 12 on iOS, 8 elsewhere.
 */
export const osValue = <T>(value: PerPlatform<T> | undefined): T | undefined => {
  if (value === undefined || !isOSConfig(value)) return value as T | undefined;
  const perOS = value as OSConfig<T>;
  return (perOS as Record<string, T | undefined>)[Platform.OS] ?? perOS.default;
};

// A typo'd OS key ({ iOS: 320 } or { web: 12, macos: 10 }) makes the object
// fail the OS-config signature check, so it passes through UNRESOLVED and
// reaches layout math as a raw object. Diagnose that in dev.
const warnIfMalformedOSConfig = (field: string, value: unknown): void => {
  if (typeof value !== 'object' || value === null || Array.isArray(value) || isOSConfig(value)) {
    return;
  }
  const keys = Object.keys(value);
  // Only flag objects that LOOK like an attempted per-platform value.
  if (keys.some((k) => OS_KEYS.has(k)) || keys.some((k) => /^(ios|android|web)$/i.test(k))) {
    warnOnce(
      `config.${field} looks like a per-platform value but has unrecognised keys (${keys.join(', ')}), so it was not resolved.`,
      'Use exactly { ios, android, web, default } — lowercase — e.g. { ios: 320, default: 300 }.'
    );
  }
};

/**
 * Resolve every PerPlatform field of a tour config for the running OS.
 * Called once in startTour, so everything downstream reads plain values.
 */
export const resolvePlatformConfig = (
  config: TourGuideConfig | undefined
): ResolvedTourGuideConfig | undefined => {
  if (!config) return config;
  warnIfMalformedOSConfig('animationDuration', config.animationDuration);
  warnIfMalformedOSConfig('motion', config.motion);
  warnIfMalformedOSConfig('safeZoneOffset', config.safeZoneOffset);
  warnIfMalformedOSConfig('tooltipWidth', config.tooltipWidth);
  warnIfMalformedOSConfig('triangleSize', config.triangleSize);
  warnIfMalformedOSConfig('tooltipOffset', config.tooltipOffset);
  return {
    ...config,
    animationDuration: osValue(config.animationDuration),
    motion: osValue(config.motion),
    safeZoneOffset: osValue(config.safeZoneOffset),
    tooltipWidth: osValue(config.tooltipWidth),
    triangleSize: osValue(config.triangleSize),
    tooltipOffset: osValue(config.tooltipOffset),
  };
};
