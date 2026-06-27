import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Dimensions, Modal, Platform, findNodeHandle } from 'react-native';

import { useTourGuide } from './TourGuideContext';
import SpotlightOverlay from './SpotlightOverlay';
import Tooltip from './Tooltip';
import {
  validateRef,
  computeTooltipPosition,
  extractBorderRadius,
  resolveInsets,
  resolveSafeAreaInsets,
} from './utils';
import { announceStep } from './accessibility';
import type { BackdropBehavior } from './types';

const isWeb = Platform.OS === 'web';

const MAX_MEASURE_RETRIES = 3;
const MEASURE_RETRY_DELAY = 100;

// After a programmatic scroll, the animation finishes at an unpredictable time
// (varies by distance/device/platform; iOS animated scrolls don't fire reliable
// scroll-end events). So instead of measuring once after a fixed delay — which
// captures the target mid-flight and leaves the spotlight/tooltip behind — we
// poll until the measured position stops changing (settled) or we hit the cap.
const SETTLE_POLL_INTERVAL = 80;
const MAX_SETTLE_POLLS = 12; // ~960ms cap — covers long animated scrolls
const SETTLE_EPSILON = 0.5; // px; two readings this close count as settled

/**
 * Cross-platform measurement helper.
 * Uses getBoundingClientRect on web, measureInWindow on native.
 */
const measureElement = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: { current: any },
  callback: (x: number, y: number, width: number, height: number) => void
) => {
  if (isWeb) {
    try {
      // react-native-web: findNodeHandle returns the DOM node directly
      const node = findNodeHandle(ref.current);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const domNode = (node ?? ref.current) as any;
      if (domNode && typeof domNode.getBoundingClientRect === 'function') {
        const rect = domNode.getBoundingClientRect();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = globalThis as any;
        callback(
          rect.left + (win.scrollX ?? 0),
          rect.top + (win.scrollY ?? 0),
          rect.width,
          rect.height
        );
        return;
      }
    } catch {
      // Fall through to measureInWindow if available
    }
  }

  // Native path
  if (typeof ref.current.measureInWindow === 'function') {
    ref.current.measureInWindow(callback);
  }
};

/**
 * Main overlay component that displays the tour guide.
 * This should be placed at the root level of your app, after your main content.
 *
 * @example
 * ```tsx
 * import { TourGuideProvider, TourGuideOverlay } from '@wrack/react-native-tour-guide';
 *
 * export default function App() {
 *   return (
 *     <TourGuideProvider>
 *       <YourApp />
 *       <TourGuideOverlay />
 *     </TourGuideProvider>
 *   );
 * }
 * ```
 */
const TourGuideOverlay: React.FC = () => {
  const {
    isActive,
    isPaused,
    currentStep,
    activeSteps,
    config,
    targetLayout,
    setTargetLayout,
    nextStep,
    prevStep,
    skipTour,
  } = useTourGuide();

  // Track screen dimensions for orientation changes
  const [screenDimensions, setScreenDimensions] = useState<{ width: number; height: number }>(
    () => {
      const { width, height } = Dimensions.get('window');
      return { width, height };
    }
  );
  const currentStepData = activeSteps[currentStep];

  // Resolve safe-area + extra insets once per config change. Keeps tooltips on
  // screen and targets clear of the status bar / nav bar / tab bars.
  const insets = useMemo(
    () => resolveInsets({ insets: config?.insets, extraInsets: config?.extraInsets }),
    [config?.insets, config?.extraInsets]
  );

  // On Android, measureInWindow returns coordinates relative to the app content
  // area, which sits BELOW the status bar — but the overlay Modal is
  // statusBarTranslucent and spans the full screen from y=0. So we add the
  // (dp-correct) status-bar height to align the spotlight with the real element.
  // iOS measureInWindow already uses full-screen coordinates, so no offset.
  // NB: use the safe-area top only (not extraInsets) — a tab bar doesn't shift
  // measureInWindow, and using raw StatusBar.currentHeight risks px-vs-dp bugs.
  const measureTopOffset = useMemo(() => {
    if (isWeb || Platform.OS !== 'android') return 0;
    return resolveSafeAreaInsets({ insets: config?.insets }).top;
  }, [config?.insets]);

  // Refs for cleanup
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const measureRetryCount = useRef(0);

  // Monotonic step token: every step change bumps this. Async measurement
  // callbacks compare against it and bail if they belong to a previous step,
  // preventing stale layout from one step landing on another (measurement race).
  const stepEpoch = useRef(0);
  // Last screen-Y seen while polling for a programmatic scroll to settle. Reset
  // to null at the start of each settle loop so the first reading is never
  // mistaken for "settled" against a stale value from a previous step.
  const lastSettleY = useRef<number | null>(null);
  // Guards setState after unmount inside async measure callbacks.
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // When a step has no measurable target (no ref, or measurement failed), we
  // show a centered tooltip instead of leaving the user trapped behind a
  // non-interactive backdrop with nothing to tap.
  const [centeredFallback, setCenteredFallback] = useState(false);

  // --- Orientation change handling ---
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window: win }: { window: { width: number; height: number } }) => {
        setScreenDimensions(win);
        // Re-measure current target after orientation change
        if (isActive && currentStepData?.targetRef?.current) {
          setTargetLayout(null);
        }
      }
    );

    return () => subscription.remove();
  }, [isActive, currentStepData, setTargetLayout]);

  // Estimated tooltip height for scroll calculations. Generous on purpose: a
  // tooltip with progress dots + a long description + buttons can be ~280px, and
  // under-reserving makes the tooltip overlap the target after an auto-scroll.
  const ESTIMATED_TOOLTIP_HEIGHT = 260;

  // --- Resolve the effective scroll ref (per-step overrides global config) ---
  const getScrollRef = useCallback(() => {
    return currentStepData?.scrollToTarget?.scrollRef ?? config?.scrollRef ?? null;
  }, [currentStepData, config]);

  const getScrollOffset = useCallback(() => {
    return (
      currentStepData?.scrollToTarget?.getCurrentScrollOffset?.() ??
      config?.getCurrentScrollOffset?.() ??
      0
    );
  }, [currentStepData, config]);

  // --- Measure target with retry logic ---
  const measureTarget = useCallback(
    (epoch: number, retryCount = 0) => {
      if (!currentStepData?.targetRef?.current) {
        // No target ref — show tooltip without spotlight
        setTargetLayout(null);
        return;
      }

      measureElement(
        currentStepData.targetRef as { current: Record<string, unknown> },
        (x: number, y: number, width: number, height: number) => {
          // Bail if the step changed or we unmounted while measuring async.
          if (epoch !== stepEpoch.current || !isMounted.current) return;

          if (width > 0 && height > 0) {
            // Align with the full-screen overlay Modal (see measureTopOffset).
            setTargetLayout({ x, y: y + measureTopOffset, width, height });
            measureRetryCount.current = 0;
          } else if (retryCount < MAX_MEASURE_RETRIES) {
            // Element not laid out yet — retry
            setTimeout(() => measureTarget(epoch, retryCount + 1), MEASURE_RETRY_DELAY);
          } else {
            console.warn(
              `react-native-tour-guide: Step "${currentStepData.id}" target measured as 0x0 after ${MAX_MEASURE_RETRIES} retries. Showing a centered tooltip instead.`
            );
            measureRetryCount.current = 0;
            // Don't trap the user — fall back to a centered, dismissible tooltip.
            setCenteredFallback(true);
          }
        }
      );
    },
    [currentStepData, setTargetLayout, measureTopOffset]
  );

  // --- Measure after a scroll, polling until the scroll settles ---
  // The highlight is hidden (targetLayout=null) while the programmatic scroll
  // animates. We poll the target position WITHOUT committing it until two
  // consecutive readings agree (the scroll has stopped), then reveal the
  // spotlight ONCE at its final position. Committing intermediate readings would
  // make the cutout chase the moving target and flicker; waiting for settle also
  // prevents latching onto a mid-animation position (the "left behind" bug).
  const measureUntilSettled = useCallback(
    (epoch: number, attempt = 0) => {
      if (!currentStepData?.targetRef?.current) {
        setTargetLayout(null);
        return;
      }

      measureElement(
        currentStepData.targetRef as { current: Record<string, unknown> },
        (x: number, y: number, width: number, height: number) => {
          // Bail if the step changed or we unmounted while measuring async.
          if (epoch !== stepEpoch.current || !isMounted.current) return;

          if (width > 0 && height > 0) {
            // Align with the full-screen overlay Modal (see measureTopOffset).
            const adjustedY = y + measureTopOffset;
            const prev = lastSettleY.current;
            lastSettleY.current = adjustedY;
            const settled = prev !== null && Math.abs(adjustedY - prev) < SETTLE_EPSILON;

            if (settled || attempt >= MAX_SETTLE_POLLS) {
              // Scroll has come to rest — reveal the highlight at its final spot.
              setTargetLayout({ x, y: adjustedY, width, height });
              measureRetryCount.current = 0;
            } else {
              // Still moving — keep polling without showing anything yet.
              setTimeout(() => measureUntilSettled(epoch, attempt + 1), SETTLE_POLL_INTERVAL);
            }
          } else if (attempt < MAX_SETTLE_POLLS) {
            // Element not laid out yet — keep trying.
            setTimeout(() => measureUntilSettled(epoch, attempt + 1), SETTLE_POLL_INTERVAL);
          } else {
            console.warn(
              `react-native-tour-guide: Step "${currentStepData.id}" target measured as 0x0 after scrolling. Showing a centered tooltip instead.`
            );
            measureRetryCount.current = 0;
            // Don't trap the user — fall back to a centered, dismissible tooltip.
            setCenteredFallback(true);
          }
        }
      );
    },
    [currentStepData, setTargetLayout, measureTopOffset]
  );

  // --- Scroll to target logic ---
  // Ensures both the target AND tooltip are fully visible in the viewport.
  // If they don't fit, auto-scrolls the parent ScrollView.
  const scrollAndMeasure = useCallback(
    (epoch: number) => {
    const scrollRef = getScrollRef();
    const stepScrollConfig = currentStepData?.scrollToTarget;

    // Handle absolute scroll positioning
    if (stepScrollConfig?.absolute && scrollRef?.current) {
      const offset = stepScrollConfig.offset ?? 0;
      const animated = stepScrollConfig.animated ?? true;
      // Hide the highlight while we scroll, then reveal it once settled — this
      // is what stops the spotlight flickering/chasing during the scroll.
      setTargetLayout(null);
      scrollRef.current.scrollTo({ y: Math.max(0, offset), animated });
      lastSettleY.current = null;
      setTimeout(() => measureUntilSettled(epoch), animated ? 100 : 50);
      return;
    }

    // No target to measure
    if (!currentStepData?.targetRef?.current) {
      measureTarget(epoch);
      return;
    }

    // Measure the target, then decide if scrolling is needed
    measureElement(
      currentStepData.targetRef as { current: Record<string, unknown> },
      (_: number, y: number, width: number, height: number) => {
        // Bail if the step changed or we unmounted while measuring async.
        if (epoch !== stepEpoch.current || !isMounted.current) return;

        if (width <= 0 || height <= 0) {
          measureTarget(epoch);
          return;
        }

        // If no scroll ref available, just measure and render
        if (!scrollRef?.current) {
          measureTarget(epoch);
          return;
        }

        // Align with the full-screen overlay Modal (see measureTopOffset).
        const adjustedY = y + measureTopOffset;
        const animated = stepScrollConfig?.animated ?? true;
        const extraOffset = stepScrollConfig?.offset ?? 0;
        const currentScrollOffset = getScrollOffset();

        // How much space tooltip + arrow + gap needs
        const tooltipSpace =
          ESTIMATED_TOOLTIP_HEIGHT +
          (config?.tooltipOffset ?? 8) +
          (config?.triangleSize ?? 12);

        const targetTop = adjustedY;
        const targetBottom = adjustedY + height;
        const sh = screenDimensions.height;

        // Margins keep the target clear of system chrome: the status bar/notch
        // at the top and the nav bar / home indicator / tab bar at the bottom.
        const topMargin = insets.top + 24;
        const bottomMargin = insets.bottom + 24;

        // Space available above and below the target for the tooltip
        const spaceAbove = targetTop - topMargin;
        const spaceBelow = sh - targetBottom - bottomMargin;

        // Is the full target visible with comfortable margins?
        const targetFullyVisible =
          targetTop >= topMargin && targetBottom <= sh - bottomMargin;
        // Does the tooltip fit on at least one side?
        const tooltipFits = spaceBelow >= tooltipSpace || spaceAbove >= tooltipSpace;

        if (targetFullyVisible && tooltipFits) {
          // Everything fits — no scroll needed
          measureTarget(epoch);
          return;
        }

        // Need to scroll. Calculate where the target should be on screen.
        // Strategy: place target so the LARGER space (above or below) gets the tooltip.
        let idealTargetScreenY: number;

        // Prefer tooltip above: scroll target toward the bottom half
        // This way user sees the target clearly and tooltip appears above
        const targetWithTooltipAbove = tooltipSpace + topMargin;
        const targetWithTooltipBelow = topMargin;

        if (targetWithTooltipAbove + height + bottomMargin <= sh) {
          // Tooltip above fits — place target below the tooltip space
          idealTargetScreenY = targetWithTooltipAbove;
        } else if (targetWithTooltipBelow + height + tooltipSpace + bottomMargin <= sh) {
          // Tooltip below fits — place target near top
          idealTargetScreenY = targetWithTooltipBelow;
        } else {
          // Tight space — center the target, tooltip will auto-position
          idealTargetScreenY = (sh - height) / 2;
        }

        // Ensure the target bottom is fully visible on screen
        const maxTargetY = sh - height - bottomMargin;
        idealTargetScreenY = Math.min(idealTargetScreenY, maxTargetY);

        const scrollDelta = targetTop - idealTargetScreenY;
        const scrollToY = currentScrollOffset + scrollDelta + extraOffset;

        // Hide the highlight while we scroll, then reveal it once settled at the
        // target's new position — no flicker, no chasing the moving target.
        setTargetLayout(null);
        scrollRef.current.scrollTo({ y: Math.max(0, scrollToY), animated });
        lastSettleY.current = null;
        setTimeout(() => measureUntilSettled(epoch), animated ? 100 : 50);
      }
    );
    },
    [
      currentStepData,
      measureTarget,
      measureUntilSettled,
      getScrollRef,
      getScrollOffset,
      screenDimensions.height,
      config,
      insets,
      measureTopOffset,
    ]
  );

  // --- Main effect: step changes ---
  useEffect(() => {
    // Cleanup previous timers
    if (delayTimer.current) {
      clearTimeout(delayTimer.current);
      delayTimer.current = null;
    }
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }

    if (!isActive || isPaused || !currentStepData) return undefined;

    // New step → bump the epoch so any in-flight measurement from the previous
    // step is ignored, and clear the centered fallback from the previous step.
    const epoch = ++stepEpoch.current;
    setCenteredFallback(false);

    // Validate ref
    const hasValidRef = validateRef(currentStepData.targetRef, currentStepData.id);

    const startMeasurement = () => {
      if (hasValidRef) {
        scrollAndMeasure(epoch);
      } else {
        // No valid ref — show a centered tooltip without spotlight.
        setTargetLayout(null);
        setCenteredFallback(true);
      }
    };

    // Apply delay if configured
    const delay = currentStepData.delayBefore ?? 0;
    if (delay > 0) {
      delayTimer.current = setTimeout(startMeasurement, delay);
    } else {
      // Small delay to ensure layout is ready
      delayTimer.current = setTimeout(startMeasurement, 100);
    }

    return () => {
      if (delayTimer.current) {
        clearTimeout(delayTimer.current);
        delayTimer.current = null;
      }
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = null;
      }
    };
  }, [isActive, isPaused, currentStep, currentStepData, scrollAndMeasure, setTargetLayout]);

  // --- Accessibility announcement ---
  useEffect(() => {
    if (isActive && currentStepData && targetLayout) {
      announceStep(currentStepData, currentStep, activeSteps.length, config);
    }
  }, [isActive, currentStepData, targetLayout, currentStep, activeSteps.length, config]);

  // --- Auto-advance timer ---
  useEffect(() => {
    if (!isActive || !currentStepData || !targetLayout) return undefined;

    const { autoAdvance } = currentStepData;
    if (autoAdvance && autoAdvance > 0) {
      autoAdvanceTimer.current = setTimeout(() => {
        nextStep();
      }, autoAdvance);

      return () => {
        if (autoAdvanceTimer.current) {
          clearTimeout(autoAdvanceTimer.current);
          autoAdvanceTimer.current = null;
        }
      };
    }

    return undefined;
  }, [isActive, currentStepData, targetLayout, nextStep]);

  if (!isActive || isPaused || !currentStepData) return null;

  // --- Backdrop behavior ---
  const resolveBackdropBehavior = (behavior: BackdropBehavior | undefined) => {
    const effective = behavior ?? config?.defaultBackdropBehavior ?? 'none';
    if (effective === 'dismiss') return skipTour;
    if (effective === 'next') return nextStep;
    if (typeof effective === 'function') return effective;
    return undefined; // 'none'
  };

  const onBackdropPress = resolveBackdropBehavior(currentStepData.backdropBehavior);

  // --- Tooltip position resolution ---
  const resolvedTooltipPosition = (() => {
    const preferred = currentStepData.tooltipPosition ?? 'auto';

    // Always auto-position to avoid off-screen tooltips, unless explicitly overridden
    if (preferred === 'auto' || config?.autoPositionTooltip !== false) {
      if (targetLayout) {
        // If user set explicit position (not 'auto'), use it as a hint but validate
        const autoResult = computeTooltipPosition({
          target: targetLayout,
          screenWidth: screenDimensions.width,
          screenHeight: screenDimensions.height,
          tooltipWidth: config?.tooltipWidth ?? 320,
          tooltipHeight: 150,
          offset: (config?.tooltipOffset ?? 8) + (config?.triangleSize ?? 12),
          insets,
        });

        // If user explicitly chose a position (not 'auto'), prefer it if it fits
        if (preferred !== 'auto') {
          const offset = (config?.tooltipOffset ?? 8) + (config?.triangleSize ?? 12);
          const tooltipHeight = 150;
          const fits = (() => {
            switch (preferred) {
              case 'bottom':
                return (
                  screenDimensions.height -
                    insets.bottom -
                    (targetLayout.y + targetLayout.height + offset) >=
                  tooltipHeight
                );
              case 'top':
                return targetLayout.y - offset - insets.top >= tooltipHeight;
              case 'left':
                return targetLayout.x - offset - insets.left >= (config?.tooltipWidth ?? 320) * 0.6;
              case 'right':
                return (
                  screenDimensions.width -
                    insets.right -
                    (targetLayout.x + targetLayout.width + offset) >=
                  (config?.tooltipWidth ?? 320) * 0.6
                );
              default:
                return false;
            }
          })();
          if (fits) return preferred;
        }

        return autoResult;
      }
    }

    return preferred === 'auto' ? 'bottom' : preferred;
  })();

  // --- Shared tooltip props ---
  const tooltipProps = {
    title: currentStepData.title,
    description: currentStepData.description,
    position: targetLayout
      ? { x: targetLayout.x, y: targetLayout.y }
      : {
          // Centered (no-target) step: center within the safe area.
          x: screenDimensions.width / 2,
          y: (insets.top + (screenDimensions.height - insets.bottom)) / 2,
        },
    tooltipPosition: resolvedTooltipPosition,
    currentStep,
    totalSteps: activeSteps.length,
    targetHeight: targetLayout?.height ?? 0,
    targetWidth: targetLayout?.width ?? 0,
    onNext: nextStep,
    onPrev: currentStep > 0 ? prevStep : undefined,
    onSkip: skipTour,
    config,
    hideNextButton: currentStepData.hideNextButton,
    hidePrevButton: currentStepData.hidePrevButton,
    hideSkipButton: currentStepData.hideSkipButton,
    screenWidth: screenDimensions.width,
    screenHeight: screenDimensions.height,
    insets,
  };

  // --- Resolve border radius: explicit > extracted from targetStyle > default ---
  // Pass the measured target so percentage radii (e.g. '50%') resolve to a real
  // pixel radius — this is what keeps circular targets round instead of square.
  const effectiveBorderRadius =
    currentStepData.spotlightBorderRadius ??
    extractBorderRadius(currentStepData.targetStyle, targetLayout ?? undefined);

  // --- Shared spotlight props ---
  const spotlightProps = {
    target: targetLayout,
    padding: currentStepData.spotlightPadding,
    borderRadius: effectiveBorderRadius,
    styles: config?.spotlightStyles,
    screenWidth: screenDimensions.width,
    screenHeight: screenDimensions.height,
    animationDuration: config?.animationDuration,
    onBackdropPress,
    onSpotlightPress: currentStepData.onSpotlightPress,
  };

  // Show the tooltip once the target is measured, or immediately for a
  // centered/no-target step. This is what prevents the user from being trapped
  // behind a backdrop with no tooltip to interact with.
  const showTooltip = Boolean(targetLayout) || centeredFallback;

  // Custom tooltip renderer
  if (config?.renderTooltip && showTooltip) {
    return (
      <Modal
        visible={isActive}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={skipTour}
      >
        <SpotlightOverlay {...spotlightProps} />
        {config.renderTooltip(tooltipProps)}
      </Modal>
    );
  }

  return (
    <Modal
      visible={isActive}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={skipTour}
    >
      <SpotlightOverlay {...spotlightProps} />
      {showTooltip ? <Tooltip {...tooltipProps} /> : null}
    </Modal>
  );
};

export default TourGuideOverlay;
