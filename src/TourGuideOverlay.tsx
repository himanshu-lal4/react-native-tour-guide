import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Dimensions, Modal, Platform, StyleSheet, View, findNodeHandle } from 'react-native';

import { useTourGuide } from './TourGuideContext';
import SpotlightOverlay from './SpotlightOverlay';
import Tooltip from './Tooltip';
import {
  validateRef,
  computeTooltipPosition,
  extractBorderRadius,
  resolveInsets,
  resolveSafeAreaInsets,
  scrollRefToY,
} from './utils';
import { announceStep } from './accessibility';
import { warnOnce } from './dev';
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

// How long a step with a targetId waits for its <TourTarget> to register
// before falling back to a centered tooltip (covers screens that mount after
// the tour starts).
const TARGET_WAIT_INTERVAL = 120;
const TARGET_WAIT_RETRIES = 10; // ~1.2s total

// Measurement watchdog: if a step has started measuring but neither produced a
// target layout nor fallen back within this window, force the centered
// fallback. Guards against measure callbacks that never fire at all (detached
// nodes, exotic hosts) — without it the user is stuck behind the backdrop with
// no tooltip. Generous on purpose: an animated auto-scroll + settle polling can
// legitimately take ~2s.
const MEASURE_WATCHDOG_MS = 4000;

/**
 * Cross-platform measurement helper.
 * Uses getBoundingClientRect on web, measureInWindow on native.
 */
const measureElement = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: { current: any },
  callback: (x: number, y: number, width: number, height: number) => void
): boolean => {
  const node = ref?.current;
  // A null ref is not measurable. Reading `.current.measureInWindow` here used
  // to throw if the target unmounted between the check and the call.
  if (!node) return false;

  if (isWeb) {
    try {
      // react-native-web: findNodeHandle returns the DOM node directly
      const handle = findNodeHandle(node);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const domNode = (handle ?? node) as any;
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
        return true;
      }
    } catch {
      // Fall through to the native path if available
    }
  }

  // Native path
  if (typeof node.measureInWindow === 'function') {
    node.measureInWindow(callback);
    return true;
  }

  // Some refs expose only measure() — notably class components that forward to
  // a host view via a legacy API. measure() reports page coordinates in its
  // 5th/6th args, which is what measureInWindow returns.
  if (typeof node.measure === 'function') {
    node.measure(
      (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) =>
        callback(pageX, pageY, width, height)
    );
    return true;
  }

  // Nothing measurable. Returning false lets callers fall back to a centered
  // tooltip instead of waiting forever for a callback that never fires — which
  // left the user trapped behind a backdrop with no tooltip and no way out.
  return false;
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
    getTarget,
    __registerOverlay,
  } = useTourGuide();

  // Let the provider know an overlay exists, so it can warn (in dev) when a tour
  // is started with no overlay mounted — or with more than one.
  useEffect(() => __registerOverlay?.(), [__registerOverlay]);

  // Track screen dimensions for orientation changes
  const [screenDimensions, setScreenDimensions] = useState<{ width: number; height: number }>(
    () => {
      const { width, height } = Dimensions.get('window');
      return { width, height };
    }
  );
  const currentStepData = activeSteps[currentStep];

  // Resolve the step's target: an explicit targetRef wins; otherwise a
  // registered <TourTarget> looked up by targetId. The proxy ref reads the
  // registry live on every `.current` access, so a target that registers AFTER
  // the step becomes active (late-mounting screen) is picked up by the
  // measurement retry loops without any extra wiring.
  const effectiveTargetRef = useMemo(() => {
    if (!currentStepData) return undefined;
    if (currentStepData.targetRef) return currentStepData.targetRef;
    const id = currentStepData.targetId;
    if (!id) return undefined;
    return {
      get current() {
        return getTarget(id)?.ref.current ?? null;
      },
    };
  }, [currentStepData, getTarget]);

  // Shape source: the step's targetStyle wins; otherwise the registered
  // TourTarget's wrapper style (so <TourTarget style={{borderRadius: 24}}>
  // drives shape matching with zero step config).
  const effectiveTargetStyle =
    currentStepData?.targetStyle ??
    (currentStepData?.targetId ? getTarget(currentStepData.targetId)?.style : undefined);

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
    // Inline overlay renders inside the app's own view tree, so it shares
    // measureInWindow's coordinate space — no status-bar correction needed.
    if (config?.overlayMode === 'inline') return 0;
    return resolveSafeAreaInsets({ insets: config?.insets }).top;
  }, [config?.insets, config?.overlayMode]);

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

  // Which step's before() hook has already run. Keyed by index+id so the hook
  // fires once per step VISIT: the main effect legitimately re-runs for the
  // same step (setStepCompleted rebuilds the step object; rotation recreates
  // callbacks), and before() must not navigate/fetch again on those re-runs.
  const beforeRanKey = useRef<string | null>(null);

  // A new startTour() replaces the config state (setStepCompleted does not),
  // so config identity marks a tour (re)start: clear the before() bookkeeping
  // so the new tour's hooks run even when step ids collide with the last run's.
  useEffect(() => {
    beforeRanKey.current = null;
  }, [config]);

  // Mirrors for the watchdog (it runs in a timeout and must read fresh values).
  const targetLayoutRef = useRef(targetLayout);
  targetLayoutRef.current = targetLayout;
  const centeredFallbackRef = useRef(centeredFallback);
  centeredFallbackRef.current = centeredFallback;
  const watchdogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Orientation change handling ---
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window: win }: { window: { width: number; height: number } }) => {
        setScreenDimensions(win);
        // Re-measure current target after orientation change
        if (isActive && effectiveTargetRef?.current) {
          setTargetLayout(null);
        }
      }
    );

    return () => subscription.remove();
  }, [isActive, currentStepData, effectiveTargetRef, setTargetLayout]);

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

  // A target we can never measure (a ref that never reaches a host component,
  // or one pointing at something without a measure API) must not leave the user
  // staring at a backdrop with no tooltip — fall back to a centered tooltip.
  const fallBackToCentered = useCallback(
    (stepId: string, reason: string) => {
      if (!isMounted.current) return;
      warnOnce(
        `Step "${stepId}" ${reason}, so it cannot be highlighted. Showing a centered tooltip instead.`,
        'Attach targetRef to a React Native host component (View, Text, Pressable…). Custom components must forward the ref with React.forwardRef.'
      );
      measureRetryCount.current = 0;
      setTargetLayout(null);
      setCenteredFallback(true);
    },
    [setTargetLayout]
  );

  // --- Scroll to target logic ---
  // Ensures both the target AND tooltip are fully visible in the viewport.
  // If they don't fit, auto-scrolls the parent ScrollView.
  // --- Measure target with retry logic ---
  const measureTarget = useCallback(
    (epoch: number, retryCount = 0) => {
      if (!currentStepData) return;
      if (!effectiveTargetRef?.current) {
        // No target ref — show tooltip without spotlight
        setTargetLayout(null);
        return;
      }

      const dispatched = measureElement(
        effectiveTargetRef as { current: Record<string, unknown> },
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
            // Don't trap the user — fall back to a centered, dismissible tooltip.
            fallBackToCentered(
              currentStepData.id,
              `measured as 0x0 after ${MAX_MEASURE_RETRIES} retries`
            );
          }
        }
      );

      // The ref exposes no measurement API at all, so no callback will ever
      // arrive. Fall back now rather than leaving the overlay empty forever.
      if (!dispatched) {
        fallBackToCentered(currentStepData.id, 'has a targetRef that cannot be measured');
      }
    },
    [currentStepData, effectiveTargetRef, setTargetLayout, measureTopOffset, fallBackToCentered]
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
      if (!currentStepData) return;
      if (!effectiveTargetRef?.current) {
        setTargetLayout(null);
        return;
      }

      const dispatched = measureElement(
        effectiveTargetRef as { current: Record<string, unknown> },
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
            // Don't trap the user — fall back to a centered, dismissible tooltip.
            fallBackToCentered(currentStepData.id, 'measured as 0x0 after scrolling');
          }
        }
      );

      if (!dispatched) {
        fallBackToCentered(currentStepData.id, 'has a targetRef that cannot be measured');
      }
    },
    [currentStepData, effectiveTargetRef, setTargetLayout, measureTopOffset, fallBackToCentered]
  );

  const warnUnusableScrollRef = useCallback(() => {
    warnOnce(
      'The scrollRef passed to the tour exposes no usable scroll method, so auto-scroll was skipped.',
      'Pass a ref attached directly to a ScrollView, FlatList or SectionList (ref={scrollViewRef}), not to a wrapper View.'
    );
  }, []);

  const hasScrollOffsetGetter = Boolean(
    currentStepData?.scrollToTarget?.getCurrentScrollOffset ?? config?.getCurrentScrollOffset
  );

  // Without an offset getter we derive the destination from layout instead:
  // measureLayout gives the target's Y inside the scroll CONTENT, and
  // measureInWindow on the scroll view gives where the viewport sits. The
  // desired content offset is then contentY - (idealScreenY - scrollViewY) —
  // no knowledge of the current offset needed. This removes the silent
  // mis-scroll when consumers forget getCurrentScrollOffset.
  const scrollViaContentCoords = useCallback(
    (
      epoch: number,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scrollRef: { current: any },
      idealTargetScreenY: number,
      extraOffset: number,
      animated: boolean
    ): boolean => {
      const targetNode = effectiveTargetRef?.current;
      const scrollNode = scrollRef.current;
      if (!targetNode || typeof targetNode.measureLayout !== 'function' || !scrollNode) {
        return false;
      }

      // The host node measureLayout expects: FlatList exposes it via
      // getNativeScrollRef / the underlying host component; findNodeHandle
      // still resolves both architectures.
      let relativeTo: unknown = null;
      try {
        relativeTo = findNodeHandle(scrollNode) ?? scrollNode;
      } catch {
        relativeTo = scrollNode;
      }
      if (!relativeTo) return false;

      const dispatchedScrollMeasure = measureElement(
        scrollRef as { current: Record<string, unknown> },
        (_sx: number, scrollWinY: number) => {
          if (epoch !== stepEpoch.current || !isMounted.current) return;
          try {
            targetNode.measureLayout(
              relativeTo,
              (_lx: number, contentY: number) => {
                if (epoch !== stepEpoch.current || !isMounted.current) return;
                const scrollToY =
                  contentY - (idealTargetScreenY - measureTopOffset - scrollWinY) + extraOffset;
                if (!scrollRefToY(scrollRef, scrollToY, animated)) {
                  warnUnusableScrollRef();
                  measureTarget(epoch);
                  return;
                }
                setTargetLayout(null);
                lastSettleY.current = null;
                setTimeout(() => measureUntilSettled(epoch), animated ? 100 : 50);
              },
              () => {
                // measureLayout failed (detached / cross-tree) — measure in place.
                if (epoch !== stepEpoch.current || !isMounted.current) return;
                measureTarget(epoch);
              }
            );
          } catch {
            measureTarget(epoch);
          }
        }
      );
      return dispatchedScrollMeasure;
    },
    [
      effectiveTargetRef,
      measureTarget,
      measureUntilSettled,
      measureTopOffset,
      setTargetLayout,
      warnUnusableScrollRef,
    ]
  );

  const scrollAndMeasure = useCallback(
    (epoch: number) => {
      if (!currentStepData) return;
      const scrollRef = getScrollRef();
      const stepScrollConfig = currentStepData?.scrollToTarget;

      // Handle absolute scroll positioning
      if (stepScrollConfig?.absolute && scrollRef?.current) {
        const offset = stepScrollConfig.offset ?? 0;
        const animated = stepScrollConfig.animated ?? true;
        // Works with ScrollView, FlatList, SectionList and wrapped scrollables —
        // assuming scrollTo() crashed on every list component.
        if (!scrollRefToY(scrollRef, offset, animated)) {
          warnUnusableScrollRef();
          measureTarget(epoch);
          return;
        }
        // Hide the highlight while we scroll, then reveal it once settled — this
        // is what stops the spotlight flickering/chasing during the scroll.
        setTargetLayout(null);
        lastSettleY.current = null;
        setTimeout(() => measureUntilSettled(epoch), animated ? 100 : 50);
        return;
      }

      // No target to measure
      if (!effectiveTargetRef?.current) {
        measureTarget(epoch);
        return;
      }

      // Measure the target, then decide if scrolling is needed
      const dispatched = measureElement(
        effectiveTargetRef as { current: Record<string, unknown> },
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
            ESTIMATED_TOOLTIP_HEIGHT + (config?.tooltipOffset ?? 8) + (config?.triangleSize ?? 12);

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
          const targetFullyVisible = targetTop >= topMargin && targetBottom <= sh - bottomMargin;
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

          // No offset getter → derive the destination from content coordinates
          // (measureLayout), which needs no offset at all.
          if (!hasScrollOffsetGetter) {
            if (
              scrollViaContentCoords(epoch, scrollRef, idealTargetScreenY, extraOffset, animated)
            ) {
              return;
            }
            // Fall through to the offset path (offset 0) if unsupported.
          }

          const scrollDelta = targetTop - idealTargetScreenY;
          const scrollToY = currentScrollOffset + scrollDelta + extraOffset;

          if (!scrollRefToY(scrollRef, scrollToY, animated)) {
            // The ref is not a usable scrollable — highlight it where it is
            // rather than failing the step.
            warnUnusableScrollRef();
            measureTarget(epoch);
            return;
          }

          // Hide the highlight while we scroll, then reveal it once settled at the
          // target's new position — no flicker, no chasing the moving target.
          setTargetLayout(null);
          lastSettleY.current = null;
          setTimeout(() => measureUntilSettled(epoch), animated ? 100 : 50);
        }
      );

      // This ref exposes no measurement API, so the callback above will never
      // run. Without this the overlay stayed on screen with no tooltip forever.
      if (!dispatched) {
        fallBackToCentered(currentStepData.id, 'has a targetRef that cannot be measured');
      }
    },
    [
      currentStepData,
      effectiveTargetRef,
      measureTarget,
      measureUntilSettled,
      getScrollRef,
      getScrollOffset,
      screenDimensions.height,
      config,
      insets,
      measureTopOffset,
      warnUnusableScrollRef,
      fallBackToCentered,
      hasScrollOffsetGetter,
      scrollViaContentCoords,
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

    if (!isActive || isPaused || !currentStepData) {
      // Tour ended or paused — the next tour (or resume) runs before() afresh.
      beforeRanKey.current = null;
      return undefined;
    }

    // New step → bump the epoch so any in-flight measurement from the previous
    // step is ignored, and clear the centered fallback from the previous step.
    const epoch = ++stepEpoch.current;
    setCenteredFallback(false);

    const startMeasurement = (attempt = 0) => {
      if (epoch !== stepEpoch.current || !isMounted.current) return;

      // Fixed-region step: no measurement at all — highlight the given window
      // rectangle (maps, camera views, anything without a ref). The region is
      // in measureInWindow coordinates, so it gets the same Android status-bar
      // correction as measured targets — otherwise the identical rect would
      // land ~a status-bar height too high under the translucent Modal.
      if (currentStepData.targetRegion) {
        const region = currentStepData.targetRegion;
        setTargetLayout({ ...region, y: region.y + measureTopOffset });
        return;
      }

      // A targetId whose <TourTarget> hasn't registered yet (screen still
      // mounting) gets a short grace period before we give up — this is what
      // makes "start the tour, then navigate" work without manual delays.
      if (currentStepData.targetId && !currentStepData.targetRef && !effectiveTargetRef?.current) {
        if (attempt < TARGET_WAIT_RETRIES) {
          delayTimer.current = setTimeout(
            () => startMeasurement(attempt + 1),
            TARGET_WAIT_INTERVAL
          );
          return;
        }
        warnOnce(
          `Step "${currentStepData.id}" references targetId "${currentStepData.targetId}", but no <TourTarget id="${currentStepData.targetId}"> registered in time. Showing a centered tooltip instead.`,
          'Render a <TourTarget> with that id, or check the id for typos.'
        );
        setTargetLayout(null);
        setCenteredFallback(true);
        return;
      }

      const hasValidRef = currentStepData.targetId
        ? Boolean(effectiveTargetRef?.current)
        : validateRef(currentStepData.targetRef, currentStepData.id);

      if (hasValidRef) {
        // Watchdog: no layout and no fallback after the deadline means some
        // measure callback silently never fired — rescue with the centered
        // tooltip rather than leaving the user trapped.
        if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
        watchdogTimer.current = setTimeout(() => {
          watchdogTimer.current = null;
          if (
            epoch === stepEpoch.current &&
            isMounted.current &&
            !targetLayoutRef.current &&
            !centeredFallbackRef.current
          ) {
            fallBackToCentered(currentStepData.id, 'never completed measurement');
          }
        }, MEASURE_WATCHDOG_MS);
        scrollAndMeasure(epoch);
      } else {
        // No valid ref — show a centered tooltip without spotlight.
        setTargetLayout(null);
        setCenteredFallback(true);
      }
    };

    // The awaited per-step hook runs first: navigate, open a sheet, fetch —
    // the spotlight only appears once it resolves. Errors don't trap the user;
    // we warn and proceed to measure whatever is there.
    const begin = () => {
      const hook = currentStepData.before;
      const visitKey = `${currentStep}:${currentStepData.id}`;
      if (!hook || beforeRanKey.current === visitKey) {
        startMeasurement();
        return;
      }
      beforeRanKey.current = visitKey;
      let result: void | Promise<void>;
      try {
        result = hook();
      } catch (error) {
        warnOnce(
          `Step "${currentStepData.id}" before() threw: ${String(error)}. Proceeding to show the step.`,
          'Make before() handle its own errors if the step should still be shown.'
        );
        startMeasurement();
        return;
      }
      if (result && typeof (result as Promise<void>).then === 'function') {
        (result as Promise<void>)
          .then(() => startMeasurement())
          .catch((error) => {
            if (epoch !== stepEpoch.current || !isMounted.current) return;
            warnOnce(
              `Step "${currentStepData.id}" before() rejected: ${String(error)}. Proceeding to show the step.`,
              'Make before() handle its own errors if the step should still be shown.'
            );
            startMeasurement();
          });
      } else {
        startMeasurement();
      }
    };

    // Apply delay if configured
    const delay = currentStepData.delayBefore ?? 0;
    if (delay > 0) {
      delayTimer.current = setTimeout(begin, delay);
    } else {
      // Small delay to ensure layout is ready
      delayTimer.current = setTimeout(begin, 100);
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
      if (watchdogTimer.current) {
        clearTimeout(watchdogTimer.current);
        watchdogTimer.current = null;
      }
    };
  }, [
    isActive,
    isPaused,
    currentStep,
    currentStepData,
    effectiveTargetRef,
    fallBackToCentered,
    scrollAndMeasure,
    setTargetLayout,
  ]);

  // The step is on screen once the target is measured OR we've committed to a
  // centered tooltip. Both paths must drive announcements and auto-advance —
  // gating on targetLayout alone silently disabled them for centered steps.
  const isStepVisible = Boolean(targetLayout) || centeredFallback;

  // --- Accessibility announcement ---
  useEffect(() => {
    if (isActive && currentStepData && isStepVisible) {
      announceStep(currentStepData, currentStep, activeSteps.length, config);
    }
  }, [isActive, currentStepData, isStepVisible, currentStep, activeSteps.length, config]);

  // --- Auto-advance timer ---
  useEffect(() => {
    if (!isActive || isPaused || !currentStepData || !isStepVisible) return undefined;

    const { autoAdvance } = currentStepData;
    // completed:false gates progression — the timer must not advance past a
    // step the user hasn't finished. setStepCompleted(id, true) rebuilds the
    // step object, which re-runs this effect and arms the timer.
    if (currentStepData.completed === false) return undefined;
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
  }, [isActive, isPaused, currentStepData, isStepVisible, nextStep]);

  if (!isActive || isPaused || !currentStepData) return null;

  // --- Backdrop behavior ---
  const resolveBackdropBehavior = (behavior: BackdropBehavior | undefined) => {
    const effective = behavior ?? config?.defaultBackdropBehavior ?? 'none';
    if (effective === 'dismiss') return skipTour;
    if (effective === 'next') {
      // completed:false gates progression — a backdrop tap must not advance
      // past an unfinished step any more than the (disabled) Next button can.
      // Explicit nextStep() calls from the consumer's own handlers still work.
      return currentStepData.completed === false ? undefined : nextStep;
    }
    if (typeof effective === 'function') return effective;
    return undefined; // 'none'
  };

  const onBackdropPress = resolveBackdropBehavior(currentStepData.backdropBehavior);

  // --- Tooltip position resolution ---
  const resolvedTooltipPosition = (() => {
    const preferred = currentStepData.tooltipPosition ?? 'auto';

    // Auto-positioning is ON by default so tooltips never render off-screen.
    // Setting `autoPositionTooltip: false` opts out entirely and honours the
    // step's explicit position, even where it does not fit.
    if (config?.autoPositionTooltip === false && preferred !== 'auto') {
      return preferred;
    }

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
    // completed:false gates the Next button until setStepCompleted(id, true).
    nextDisabled: currentStepData.completed === false,
    isLastStep: currentStep === activeSteps.length - 1,
  };

  // --- Resolve border radius: explicit > extracted from targetStyle > default ---
  // Pass the measured target so percentage radii (e.g. '50%') resolve to a real
  // pixel radius — this is what keeps circular targets round instead of square.
  const effectiveBorderRadius =
    currentStepData.spotlightBorderRadius ??
    extractBorderRadius(effectiveTargetStyle, targetLayout ?? undefined);

  // --- Shared spotlight props ---
  const spotlightProps = {
    target: targetLayout,
    padding: currentStepData.spotlightPadding,
    borderRadius: effectiveBorderRadius,
    styles: config?.spotlightStyles,
    screenWidth: screenDimensions.width,
    screenHeight: screenDimensions.height,
    animationDuration: config?.animationDuration,
    motion: currentStepData.motion ?? config?.motion,
    onBackdropPress,
    onSpotlightPress: currentStepData.onSpotlightPress,
    // Touches pass through the hole to the real element (inline mode only —
    // in a Modal there is nothing underneath to receive them).
    interactive: currentStepData.interactive === true && config?.overlayMode === 'inline',
  };

  // Show the tooltip once the target is measured, or immediately for a
  // centered/no-target step. This is what prevents the user from being trapped
  // behind a backdrop with no tooltip to interact with.
  const showTooltip = isStepVisible;

  // One Modal for both paths. Previously the custom-renderer branch passed
  // `navigationBarTranslucent` and the default branch did not, so whether the
  // overlay covered the Android navigation bar depended on which tooltip you
  // used. (The prop is ignored on React Native versions that predate it.)
  const renderTooltipContent = () => {
    if (!showTooltip) return null;
    const renderer = currentStepData.renderTooltip ?? config?.renderTooltip;
    return renderer ? renderer(tooltipProps) : <Tooltip {...tooltipProps} />;
  };

  // Inline mode: an absolutely-positioned layer instead of a Modal. Interactive
  // steps need this — a Modal swallows every touch, so nothing underneath is
  // reachable. Requires <TourGuideOverlay /> to sit at the app root so
  // absoluteFill covers the whole screen.
  if (config?.overlayMode === 'inline') {
    return (
      <View style={[StyleSheet.absoluteFill, inlineStyles.layer]} pointerEvents="box-none">
        <SpotlightOverlay {...spotlightProps} />
        {renderTooltipContent()}
      </View>
    );
  }

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
      {renderTooltipContent()}
    </Modal>
  );
};

const inlineStyles = StyleSheet.create({
  // High enough to clear app content; transparent, so Android elevation draws
  // no shadow. zIndex covers iOS/web stacking.
  layer: { zIndex: 10000, elevation: 1000 },
});

export default TourGuideOverlay;
