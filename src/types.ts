import type { RefObject, ReactNode } from 'react';
import type { ViewStyle, TextStyle, StyleProp } from 'react-native';

/**
 * A ref target that can be measured (View-like component).
 * Uses a flexible type to support multiple React Native versions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MeasurableRef = RefObject<any>;

/**
 * A ref to a scrollable component (ScrollView-like).
 * Uses a flexible type to support multiple React Native versions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScrollableRef = RefObject<any>;

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
 * Edge insets (in px) describing regions the tour should stay clear of:
 * the status bar / notch (top), the home indicator or Android navigation bar
 * (bottom), and any side insets. Used to keep tooltips on-screen and to scroll
 * targets out from behind system chrome.
 */
export interface EdgeInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Configuration for automatic scrolling to a target
 */
export interface ScrollToTargetConfig {
  /** Reference to the ScrollView component */
  scrollRef: ScrollableRef;
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
 * Backdrop press behavior options
 * - 'dismiss': Skip/close the tour
 * - 'next': Advance to next step
 * - 'none': Do nothing (default)
 * - function: Custom handler
 */
export type BackdropBehavior = 'dismiss' | 'next' | 'none' | (() => void);

/**
 * Configuration for a single tour step
 */
export interface TourStep {
  /** Unique identifier for the step */
  id: string;
  /** Reference to the component to highlight (optional for full-screen tooltips) */
  targetRef?: MeasurableRef;
  /** Title shown in the tooltip */
  title: string;
  /** Description text in the tooltip */
  description: string;
  /** Position of the tooltip relative to the target (default: 'bottom', use 'auto' for smart positioning) */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /** Custom padding around spotlight in pixels (default: 8) */
  spotlightPadding?: number;
  /** Uniform border radius override for the spotlight (default: 12). For per-corner control, use targetStyle instead. */
  spotlightBorderRadius?: number;
  /** Style applied to the target component — border radius is auto-extracted for spotlight shape matching */
  targetStyle?: StyleProp<ViewStyle>;
  /** Configuration for auto-scrolling to the target */
  scrollToTarget?: ScrollToTargetConfig;
  /** Callback invoked when moving to the next step */
  onNext?: () => void;
  /** Callback invoked when moving to the previous step */
  onPrev?: () => void;
  /** Callback invoked when skipping the tour */
  onSkip?: () => void;
  /** Whether this step is active/included in the tour (default: true) */
  active?: boolean;
  /** What happens when the backdrop (dark overlay) is pressed */
  backdropBehavior?: BackdropBehavior;
  /** Callback when the spotlight area is pressed */
  onSpotlightPress?: () => void;
  /** Delay in ms before showing this step (useful for waiting on animations) */
  delayBefore?: number;
  /** Auto-advance to next step after this many ms (0 = disabled) */
  autoAdvance?: number;
  /** Hide the next/done button for this step */
  hideNextButton?: boolean;
  /** Hide the previous/back button for this step */
  hidePrevButton?: boolean;
  /** Hide the skip button for this step */
  hideSkipButton?: boolean;
  /** Custom accessibility label for this step (overrides auto-generated one) */
  accessibilityLabel?: string;
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
  /** Enable pulsing border around spotlight (default: false) */
  enablePulse?: boolean;
  /** Pulse border color (default: '#FFFFFF') */
  pulseColor?: string;
  /** Pulse border width in px (default: 2) */
  pulseWidth?: number;
  /** Pulse animation duration for one full cycle in ms (default: 1500) */
  pulseDuration?: number;
  /** Pulse min opacity (default: 0.2) */
  pulseMinOpacity?: number;
  /** Pulse max opacity (default: 0.8) */
  pulseMaxOpacity?: number;
}

/**
 * A complete theme preset combining tooltip and spotlight styles
 */
export interface TourTheme {
  tooltipStyles: TooltipStyles;
  spotlightStyles: SpotlightStyles;
}

/**
 * Storage adapter for tour persistence.
 * Implement this interface to use any storage solution (AsyncStorage, MMKV, etc.)
 */
export interface TourStorage {
  /** Get a value by key. Return null if not found. */
  getItem: (key: string) => Promise<string | null> | string | null;
  /** Set a value by key */
  setItem: (key: string, value: string) => Promise<void> | void;
  /** Remove a value by key */
  removeItem: (key: string) => Promise<void> | void;
}

/**
 * Configuration for the tour guide
 */
export interface TourGuideConfig {
  /** Custom tooltip styles */
  tooltipStyles?: TooltipStyles;
  /** Custom spotlight styles */
  spotlightStyles?: SpotlightStyles;
  /** Show progress dots (default: false) */
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
  /** Animation duration in ms for spotlight transitions (default: 300) */
  animationDuration?: number;

  // --- Lifecycle events ---

  /** Called when a tour starts */
  onTourStart?: () => void;
  /** Called when a tour ends (completed = true if finished all steps, false if skipped) */
  onTourEnd?: (completed: boolean) => void;
  /** Called when the step changes */
  onStepChange?: (fromIndex: number, toIndex: number) => void;
  /** Called before step changes. Return false (or resolve false) to prevent the transition. */
  beforeStepChange?: (fromIndex: number, toIndex: number) => boolean | Promise<boolean>;

  // --- Safe-area / layout insets ---

  /**
   * Safe-area insets to respect (status bar, notch, Android nav bar, home
   * indicator). Tooltips are clamped within these and targets are scrolled out
   * from behind them. If omitted, insets are auto-detected from
   * react-native-safe-area-context (when installed) or fall back to the Android
   * status-bar height. Provide partial values to override specific edges.
   *
   * @example
   * const insets = useSafeAreaInsets();
   * startTour(steps, { insets });
   */
  insets?: Partial<EdgeInsets>;
  /**
   * Extra insets ADDED on top of the safe area for app chrome that overlaps the
   * content — e.g. a bottom tab bar, a top tab bar, or a custom header. The tour
   * keeps tooltips and targets clear of these too.
   *
   * @example
   * // 56px bottom tab bar + 48px top tabs, on top of the safe area
   * startTour(steps, { insets, extraInsets: { top: 48, bottom: 56 } });
   */
  extraInsets?: Partial<EdgeInsets>;

  // --- Configurable layout values ---

  /** Default backdrop behavior for all steps (default: 'none') */
  defaultBackdropBehavior?: BackdropBehavior;
  /** Enable smart tooltip auto-positioning (default: false) */
  autoPositionTooltip?: boolean;
  /** Safe zone offset in px for scroll calculations (default: 120) */
  safeZoneOffset?: number;
  /** Tooltip width in px (default: 320) */
  tooltipWidth?: number;
  /** Triangle/arrow size in px (default: 12) */
  triangleSize?: number;
  /** Gap between target and tooltip in px (default: 8) */
  tooltipOffset?: number;

  // --- Auto-scroll ---

  /** Reference to the ScrollView wrapping your tour content. Enables automatic scrolling when the target + tooltip would be off-screen. */
  scrollRef?: ScrollableRef;
  /** Function returning the current scroll Y offset (needed for accurate scroll calculations) */
  getCurrentScrollOffset?: () => number;

  // --- Tour identification ---

  /** Unique ID for this tour (used for persistence and multiple tours) */
  tourId?: string;

  // --- Accessibility ---

  /** Enable accessibility announcements (default: true) */
  enableAccessibility?: boolean;
  /** Custom accessibility label prefix (default: 'Tour guide') */
  accessibilityLabelPrefix?: string;
}

/**
 * Props passed to custom tooltip render function
 */
export interface TooltipProps {
  title: string;
  description: string;
  position: { x: number; y: number };
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev?: () => void;
  onSkip: () => void;
  targetHeight?: number;
  targetWidth?: number;
  config?: TourGuideConfig;
  hideNextButton?: boolean;
  hidePrevButton?: boolean;
  hideSkipButton?: boolean;
  screenWidth?: number;
  screenHeight?: number;
  /** Resolved safe-area + extra insets the tooltip must stay within */
  insets?: EdgeInsets;
}

/**
 * Context value for the tour guide
 */
export interface TourGuideContextValue {
  /** Current step index (within active steps) */
  currentStep: number;
  /** Whether a tour is currently active */
  isActive: boolean;
  /** Whether the tour is paused (overlay hidden but state preserved) */
  isPaused: boolean;
  /** The ID of the currently active tour (from config.tourId) */
  activeTourId?: string;
  /** All tour steps (including inactive) */
  steps: TourStep[];
  /** Only active/visible steps (filtered from steps where active !== false) */
  activeSteps: TourStep[];
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
  /** Jump to a specific step index (within active steps) */
  goToStep: (index: number) => void;
  /** Pause the tour (hides overlay, preserves state) */
  pauseTour: () => void;
  /** Resume a paused tour */
  resumeTour: () => void;
  /** Set the target layout (internal) */
  setTargetLayout: (layout: SpotlightTarget | null) => void;
  /** Current target layout */
  targetLayout: SpotlightTarget | null;
}
