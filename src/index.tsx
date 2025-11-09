// Main exports
export { TourGuideProvider, useTourGuide } from './TourGuideContext';
export { default as TourGuideOverlay } from './TourGuideOverlay';
export { default as SpotlightOverlay } from './SpotlightOverlay';
export { default as Tooltip } from './Tooltip';

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
} from './types';
