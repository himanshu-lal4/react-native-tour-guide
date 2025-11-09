import type { RefObject, ReactNode } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';

/**
 * Represents the position and dimensions of a spotlight target
 */
export interface SpotlightTarget {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Configuration for automatic scrolling to a target
 */
export interface ScrollToTargetConfig {
  /** Reference to the ScrollView component */
  scrollRef: RefObject<any>;
  /** Additional offset in pixels (positive = scroll down more, negative = scroll up) */
  offset?: number;
  /** Whether to animate the scroll (default: true) */
  animated?: boolean;
  /** If true, offset is absolute position; if false (default), it's relative to target */
  absolute?: boolean;
  /** Function to get the current scroll Y position */
  getCurrentScrollOffset?: () => number;
}

/**
 * Configuration for a single tour step
 */
export interface TourStep {
  /** Unique identifier for the step */
  id: string;
  /** Reference to the component to highlight (optional for full-screen tooltips) */
  targetRef?: RefObject<any>;
  /** Title shown in the tooltip */
  title: string;
  /** Description text in the tooltip */
  description: string;
  /** Position of the tooltip relative to the target (default: 'bottom') */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Shape of the spotlight (default: 'rectangle') */
  spotlightShape?: 'circle' | 'rectangle';
  /** Custom padding around spotlight in pixels (default: 8) */
  spotlightPadding?: number;
  /** Custom border radius for rectangle shape in pixels (default: 12) */
  spotlightBorderRadius?: number;
  /** Configuration for auto-scrolling to the target */
  scrollToTarget?: ScrollToTargetConfig;
  /** Callback invoked when moving to the next step */
  onNext?: () => void;
  /** Callback invoked when moving to the previous step */
  onPrev?: () => void;
  /** Callback invoked when skipping the tour */
  onSkip?: () => void;
}

/**
 * Customization options for the tooltip component
 */
export interface TooltipStyles {
  /** Background color of the tooltip */
  backgroundColor?: string;
  /** Border radius of the tooltip */
  borderRadius?: number;
  /** Text color for title */
  titleColor?: string;
  /** Text color for description */
  descriptionColor?: string;
  /** Button text color */
  buttonTextColor?: string;
  /** Primary button background color */
  primaryButtonColor?: string;
  /** Secondary button background color */
  secondaryButtonColor?: string;
  /** Skip button color */
  skipButtonColor?: string;
  /** Custom title text style */
  titleStyle?: TextStyle;
  /** Custom description text style */
  descriptionStyle?: TextStyle;
  /** Custom tooltip container style */
  containerStyle?: ViewStyle;
}

/**
 * Customization options for the spotlight overlay
 */
export interface SpotlightStyles {
  /** Opacity of the overlay (0-1, default: 0.6) */
  overlayOpacity?: number;
  /** Color of the overlay (default: 'black') */
  overlayColor?: string;
  /** Blur amount (0-100, default: 4) - requires @react-native-community/blur */
  blurAmount?: number;
  /** Enable blur effect (default: false) */
  enableBlur?: boolean;
  /** Enable gradient overlay (default: false) */
  enableGradient?: boolean;
  /** Gradient colors (requires react-native-linear-gradient) */
  gradientColors?: string[];
}

/**
 * Configuration for the tour guide
 */
export interface TourGuideConfig {
  /** Custom tooltip styles */
  tooltipStyles?: TooltipStyles;
  /** Custom spotlight styles */
  spotlightStyles?: SpotlightStyles;
  /** Show progress dots (default: true) */
  showProgressDots?: boolean;
  /** Show step counter (default: true) */
  showStepCounter?: boolean;
  /** Enable back button (default: true) */
  enableBackButton?: boolean;
  /** Text for the next button (default: 'Next') */
  nextButtonText?: string;
  /** Text for the previous button (default: 'Back') */
  prevButtonText?: string;
  /** Text for the skip button (default: 'Skip') */
  skipButtonText?: string;
  /** Text for the done button (default: 'Done') */
  doneButtonText?: string;
  /** Custom render function for tooltip */
  renderTooltip?: (props: TooltipProps) => ReactNode;
  /** Animation duration in ms (default: 300) */
  animationDuration?: number;
}

/**
 * Props passed to custom tooltip render function
 */
export interface TooltipProps {
  title: string;
  description: string;
  position: { x: number; y: number };
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev?: () => void;
  onSkip: () => void;
  targetHeight?: number;
  targetWidth?: number;
  config?: TourGuideConfig;
}

/**
 * Context value for the tour guide
 */
export interface TourGuideContextValue {
  /** Current step index */
  currentStep: number;
  /** Whether a tour is currently active */
  isActive: boolean;
  /** Array of tour steps */
  steps: TourStep[];
  /** Configuration for the tour */
  config?: TourGuideConfig;
  /** Start a new tour with the given steps */
  startTour: (steps: TourStep[], config?: TourGuideConfig) => void;
  /** Move to the next step */
  nextStep: () => void;
  /** Move to the previous step */
  prevStep: () => void;
  /** Skip the entire tour */
  skipTour: () => void;
  /** End the tour programmatically */
  endTour: () => void;
  /** Set the target layout (internal) */
  setTargetLayout: (layout: SpotlightTarget | null) => void;
  /** Current target layout */
  targetLayout: SpotlightTarget | null;
}
