import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Dimensions, Modal, Platform, StatusBar, findNodeHandle } from 'react-native';

import { useTourGuide } from './TourGuideContext';
import SpotlightOverlay from './SpotlightOverlay';
import Tooltip from './Tooltip';
import { validateRef, computeTooltipPosition, extractBorderRadius } from './utils';
import { announceStep } from './accessibility';
import type { BackdropBehavior } from './types';

const isWeb = Platform.OS === 'web';

const MAX_MEASURE_RETRIES = 3;
const MEASURE_RETRY_DELAY = 100;

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

  // Refs for cleanup
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const measureRetryCount = useRef(0);

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

  // Estimated tooltip height for scroll calculations (title + description + buttons + padding)
  const ESTIMATED_TOOLTIP_HEIGHT = 200;

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
    (retryCount = 0) => {
      if (!currentStepData?.targetRef?.current) {
        // No target ref — show tooltip without spotlight
        setTargetLayout(null);
        return;
      }

      measureElement(
        currentStepData.targetRef as { current: Record<string, unknown> },
        (x: number, y: number, width: number, height: number) => {
          if (width > 0 && height > 0) {
            const statusBarHeight =
              !isWeb && Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
            const adjustedY = y + statusBarHeight;
            setTargetLayout({ x, y: adjustedY, width, height });
            measureRetryCount.current = 0;
          } else if (retryCount < MAX_MEASURE_RETRIES) {
            // Element not laid out yet — retry
            setTimeout(() => measureTarget(retryCount + 1), MEASURE_RETRY_DELAY);
          } else {
            console.warn(
              `react-native-tour-guide: Step "${currentStepData.id}" target measured as 0x0 after ${MAX_MEASURE_RETRIES} retries.`
            );
            measureRetryCount.current = 0;
          }
        }
      );
    },
    [currentStepData, setTargetLayout]
  );

  // --- Scroll to target logic ---
  // Ensures both the target AND tooltip are fully visible in the viewport.
  // If they don't fit, auto-scrolls the parent ScrollView.
  const scrollAndMeasure = useCallback(() => {
    const scrollRef = getScrollRef();
    const stepScrollConfig = currentStepData?.scrollToTarget;

    // Handle absolute scroll positioning
    if (stepScrollConfig?.absolute && scrollRef?.current) {
      const offset = stepScrollConfig.offset ?? 0;
      const animated = stepScrollConfig.animated ?? true;
      scrollRef.current.scrollTo({ y: Math.max(0, offset), animated });
      setTimeout(() => measureTarget(), animated ? 400 : 100);
      return;
    }

    // No target to measure
    if (!currentStepData?.targetRef?.current) {
      measureTarget();
      return;
    }

    // Measure the target, then decide if scrolling is needed
    measureElement(
      currentStepData.targetRef as { current: Record<string, unknown> },
      (_: number, y: number, width: number, height: number) => {
        if (width <= 0 || height <= 0) {
          measureTarget();
          return;
        }

        // If no scroll ref available, just measure and render
        if (!scrollRef?.current) {
          measureTarget();
          return;
        }

        const statusBarHeight =
          !isWeb && Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
        const adjustedY = y + statusBarHeight;
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

        // Margins: top needs room for status bar, bottom needs generous room
        const topMargin = 80;
        const bottomMargin = 40;

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
          measureTarget();
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

        scrollRef.current.scrollTo({ y: Math.max(0, scrollToY), animated });
        setTimeout(() => measureTarget(), animated ? 400 : 100);
      }
    );
  }, [
    currentStepData,
    measureTarget,
    getScrollRef,
    getScrollOffset,
    screenDimensions.height,
    config,
  ]);

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

    // Validate ref
    const hasValidRef = validateRef(currentStepData.targetRef, currentStepData.id);

    const startMeasurement = () => {
      if (hasValidRef) {
        scrollAndMeasure();
      } else {
        // No valid ref — show tooltip without spotlight (centered)
        setTargetLayout(null);
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
        });

        // If user explicitly chose a position (not 'auto'), prefer it if it fits
        if (preferred !== 'auto') {
          const offset = (config?.tooltipOffset ?? 8) + (config?.triangleSize ?? 12);
          const tooltipHeight = 150;
          const fits = (() => {
            switch (preferred) {
              case 'bottom':
                return (
                  screenDimensions.height - (targetLayout.y + targetLayout.height + offset) >=
                  tooltipHeight
                );
              case 'top':
                return targetLayout.y - offset >= tooltipHeight;
              case 'left':
                return targetLayout.x - offset >= (config?.tooltipWidth ?? 320) * 0.6;
              case 'right':
                return (
                  screenDimensions.width - (targetLayout.x + targetLayout.width + offset) >=
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
      : { x: screenDimensions.width / 2, y: screenDimensions.height / 2 },
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
  };

  // --- Resolve border radius: explicit > extracted from targetStyle > default ---
  const effectiveBorderRadius =
    currentStepData.spotlightBorderRadius ?? extractBorderRadius(currentStepData.targetStyle);

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

  // Custom tooltip renderer
  if (config?.renderTooltip && targetLayout) {
    return (
      <Modal
        visible={isActive}
        transparent
        animationType="fade"
        statusBarTranslucent
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
      {targetLayout ? <Tooltip {...tooltipProps} /> : null}
    </Modal>
  );
};

export default TourGuideOverlay;
