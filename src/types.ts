import type { RefObject, ReactNode, ComponentType } from 'react';
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
  /**
   * ID of a `<TourTarget>` to highlight — the declarative alternative to
   * `targetRef`. The tour waits briefly for the target to register (useful when
   * the screen mounts after the tour starts). If both are given, `targetRef`
   * wins.
   */
  targetId?: string;
  /**
   * Highlight a fixed screen region instead of a component — for map overlays,
   * camera views, canvases, or anything you can't attach a ref to. Uses the
   * same coordinate space as `measureInWindow` (the library applies the same
   * Android status-bar correction it applies to measured targets). Skips
   * measurement entirely; wins over targetRef/targetId.
   */
  targetRegion?: SpotlightTarget;
  /** Title shown in the tooltip */
  title: string;
  /** Description text in the tooltip */
  description: string;
  /** Position of the tooltip relative to the target (default: 'bottom', use 'auto' for smart positioning) */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /** Padding around the spotlight in px — a number for uniform padding, or per-side values (default: 0) */
  spotlightPadding?: number | Partial<EdgeInsets>;
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
  /**
   * Awaited before this step is measured and shown. Navigate, open a sheet, or
   * wait for data here — the spotlight only appears once the promise resolves.
   * Prefer this over guessing a `delayBefore`.
   */
  before?: () => void | Promise<void>;
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
  /**
   * Gates progression: `false` disables the Next button, pauses `autoAdvance`,
   * and turns a `backdropBehavior: 'next'` tap into a no-op until
   * `setStepCompleted(id, true)` is called (e.g. after the user performs the
   * action this step teaches). Explicit `nextStep()` calls from your own
   * handlers still advance. `undefined` means no gating.
   */
  completed?: boolean;
  /**
   * Let touches pass through the spotlight hole to the real element underneath,
   * so the user can actually tap the thing being highlighted. Requires
   * `config.overlayMode: 'inline'` — a Modal overlay swallows every touch.
   * Advance the tour from the element's own handler (call `nextStep()`), or
   * pair with `completed` gating.
   */
  interactive?: boolean;
  /** Custom tooltip renderer for this step only (overrides config.renderTooltip) */
  renderTooltip?: (props: TooltipProps) => ReactNode;
  /** Spotlight transition into this step (overrides config.motion) */
  motion?: SpotlightMotion;
}

/**
 * How the spotlight travels between steps:
 * - 'morph' (default): animates position, size and radius in one smooth move
 * - 'bounce': the same move on a spring, with a little overshoot
 * - 'fade': the overlay dips out, jumps, and fades back in at the new target
 * - 'none': instant jump, no animation
 */
export type SpotlightMotion = 'morph' | 'bounce' | 'fade' | 'none';

/**
 * Custom spotlight cutout path. Return an SVG subpath describing the hole
 * (it is punched out of the full-screen backdrop via evenodd fill).
 * The ultimate escape hatch — draw any highlight shape you like.
 */
export type SpotlightMaskPathFn = (args: {
  /** The measured target (unpadded), in window coordinates */
  target: SpotlightTarget;
  /** The padded bounding box the default shape would use */
  bounds: { x: number; y: number; width: number; height: number };
  screenWidth: number;
  screenHeight: number;
}) => string;

// ─── Headless component slots ───────────────────────────────────────────────

/** Props passed to a replacement tour button (Next / Back / Skip). */
export interface TourButtonProps {
  /** Resolved label text (respects configured button texts and Done on the last step) */
  label: string;
  onPress: () => void;
  /** True when `completed: false` gating disables this button */
  disabled?: boolean;
  /** True on the final step (Next slot only) */
  isLast?: boolean;
}

/** Props passed to a replacement progress indicator (StepCounter / ProgressDots). */
export interface TourProgressProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * Replace individual pieces of the built-in tooltip without rebuilding the
 * whole thing. Anything not provided keeps the default rendering. For a fully
 * custom tooltip, use `renderTooltip` instead.
 */
export interface TooltipComponents {
  NextButton?: ComponentType<TourButtonProps>;
  PrevButton?: ComponentType<TourButtonProps>;
  SkipButton?: ComponentType<TourButtonProps>;
  StepCounter?: ComponentType<TourProgressProps>;
  ProgressDots?: ComponentType<TourProgressProps>;
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
  /**
   * Custom cutout shape: return an SVG subpath for the spotlight hole.
   * Overrides the automatic shape matching for every step. Shape animation is
   * skipped for custom paths (the hole jumps between steps).
   */
  maskPath?: SpotlightMaskPathFn;
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
  /** Replace individual tooltip pieces (buttons, counter, dots) while keeping the rest */
  components?: TooltipComponents;
  /**
   * How the overlay is mounted (default: 'modal').
   * - 'modal': a React Native Modal — always on top, immune to parent overflow,
   *   but the app underneath is unreachable while the tour runs.
   * - 'inline': an absolutely-positioned view rendered where <TourGuideOverlay />
   *   sits. Required for `interactive` steps (touches can reach the highlighted
   *   element). Place <TourGuideOverlay /> at the root of your app so it covers
   *   the full screen; the Android back button is not intercepted in this mode.
   */
  overlayMode?: 'modal' | 'inline';
  /** Whether tooltip text respects the OS font-size setting (default: true) */
  allowFontScaling?: boolean;
  /** Cap on OS font scaling applied to tooltip text (default: unlimited) */
  maxFontSizeMultiplier?: number;
  /** Animation duration in ms for spotlight transitions (default: 300) */
  animationDuration?: number;
  /** Default spotlight transition between steps (default: 'morph'); steps can override */
  motion?: SpotlightMotion;

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
  /**
   * Smart tooltip auto-positioning, which flips the tooltip to whichever side
   * has room so it never renders off-screen (default: true).
   * Set to `false` to always honour each step's explicit `tooltipPosition`.
   */
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
 * Props passed to custom tooltip render functions and the built-in tooltip.
 *
 * This is the library's **headless contract**: everything a fully custom
 * tooltip needs — target geometry, resolved placement, safe-area insets, and
 * navigation callbacks. Treat it as a stable public API.
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
  /** True when `completed: false` gating should disable the Next button */
  nextDisabled?: boolean;
  /** True on the final step (Next acts as Done) */
  isLastStep?: boolean;
}

/** A target registered by <TourTarget>, addressable from steps via `targetId`. */
export interface RegisteredTarget {
  ref: MeasurableRef;
  /** The wrapper's style — used for spotlight shape extraction when the step has no targetStyle */
  style?: StyleProp<ViewStyle>;
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
  /**
   * Start a tour: pass a steps array (with optional config), or the id of a
   * tour previously registered with `defineTour` (config then overrides the
   * stored one field-by-field).
   */
  startTour: (steps: TourStep[] | string, config?: TourGuideConfig) => void;
  /**
   * Register a named tour up front so it can be started by id from anywhere
   * (`startTour('onboarding')`) and checked with `canStartTour`.
   */
  defineTour: (tourId: string, steps: TourStep[], config?: TourGuideConfig) => void;
  /** Remove a tour registered with defineTour. */
  removeTour: (tourId: string) => void;
  /**
   * Whether a tour is ready to start: every step that references a `targetId`
   * has its <TourTarget> registered (steps with targetRef / targetRegion / no
   * target always count as ready). Accepts a defined tour's id or a steps
   * array. Useful to delay startTour until async screens have mounted.
   */
  canStartTour: (tourOrSteps: string | TourStep[]) => boolean;
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
  /**
   * Mark a step's gating condition met (or unmet). A step with
   * `completed: false` keeps its Next button disabled until this is called
   * with `true`.
   */
  setStepCompleted: (stepId: string, completed: boolean) => void;
  /** Register a <TourTarget> so steps can reference it by `targetId`. Called by TourTarget. */
  registerTarget: (id: string, ref: MeasurableRef, style?: StyleProp<ViewStyle>) => void;
  /**
   * Unregister a <TourTarget> (called on unmount). Pass the same ref that was
   * registered so an unmounting duplicate can't remove a still-mounted
   * instance's registration; without a ref, removal is unconditional.
   */
  unregisterTarget: (id: string, ref?: MeasurableRef) => void;
  /** Look up a registered target by id. */
  getTarget: (id: string) => RegisteredTarget | undefined;
  /** Set the target layout (internal) */
  setTargetLayout: (layout: SpotlightTarget | null) => void;
  /** Current target layout */
  targetLayout: SpotlightTarget | null;
  /**
   * Registers a mounted `<TourGuideOverlay />` so the provider can warn (in dev)
   * when no overlay — or more than one — is mounted. Returns its cleanup.
   * @internal Not part of the supported public API.
   */
  __registerOverlay?: () => () => void;
}
