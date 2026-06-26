// Main exports
export { TourGuideProvider, useTourGuide } from './TourGuideContext';
export { default as TourGuideOverlay } from './TourGuideOverlay';
export { default as SpotlightOverlay } from './SpotlightOverlay';
export { default as Tooltip } from './Tooltip';

// Hook exports
export { useTourPersistence } from './useTourPersistence';

// Theme exports
export { darkTheme, lightTheme, minimalTheme, vibrantTheme, createTheme } from './themes';

// Shape exports
export { computeShape } from './shapes';

// Utility exports (useful for custom tooltip renderers)
export {
  computeTooltipPosition,
  validateRef,
  extractBorderRadius,
  resolveInsets,
  resolveSafeAreaInsets,
} from './utils';
export { announceStep, getTooltipAccessibilityProps } from './accessibility';

// Type exports
export type {
  TourStep,
  TourGuideConfig,
  TourGuideContextValue,
  SpotlightTarget,
  SpotlightStyles,
  TooltipStyles,
  TooltipProps,
  ScrollToTargetConfig,
  BackdropBehavior,
  TourStorage,
  TourTheme,
  MeasurableRef,
  ScrollableRef,
  EdgeInsets,
} from './types';

export type { SpotlightBorderRadius, ShapeBounds, ShapeResult } from './shapes';

export type { TourGuideProviderProps } from './TourGuideContext';
export type { SpotlightOverlayProps } from './SpotlightOverlay';
