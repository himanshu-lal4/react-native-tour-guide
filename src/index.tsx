// Main exports
export { TourGuideProvider, useTourGuide } from './TourGuideContext';
export { TourTarget } from './TourTarget';
export { default as TourGuideOverlay } from './TourGuideOverlay';
export { default as SpotlightOverlay } from './SpotlightOverlay';
export { default as Tooltip } from './Tooltip';

// Hook exports
export { useTourPersistence } from './useTourPersistence';
export { useTourScroll } from './useTourScroll';
export type { TourScrollBinding } from './useTourScroll';
export { detectStorage } from './storage';
export type { StorageType } from './storage';
export type { TourEvents, TourEventMap, TourEventName, TourEventHandler } from './events';

// Theme exports
export { darkTheme, lightTheme, minimalTheme, vibrantTheme, createTheme } from './themes';

// Shape exports
export { computeShape, roundedRectPath, shapeInnerPath } from './shapes';

// Utility exports (useful for custom tooltip renderers)
export {
  computeTooltipPosition,
  validateRef,
  extractBorderRadius,
  resolveInsets,
  resolveSafeAreaInsets,
  osValue,
} from './utils';
export { announceStep, getTooltipAccessibilityProps } from './accessibility';

// Type exports
export type {
  TourStep,
  RegisteredTarget,
  TooltipComponents,
  TourButtonProps,
  TourProgressProps,
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
  SpotlightMotion,
  SpotlightMaskPathFn,
  OSConfig,
  PerPlatform,
  ResolvedTourGuideConfig,
} from './types';

export type { SpotlightBorderRadius, SpotlightPadding, ShapeBounds, ShapeResult } from './shapes';

export type { TourGuideProviderProps } from './TourGuideContext';
export type { TourTargetProps } from './TourTarget';
export type { SpotlightOverlayProps } from './SpotlightOverlay';
