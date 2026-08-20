import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type {
  MeasurableRef,
  RegisteredTarget,
  ResolvedTourGuideConfig,
  SpotlightTarget,
  TourGuideConfig,
  TourGuideContextValue,
  TourStep,
} from './types';
import { resolvePlatformConfig } from './utils';
import { createTourEvents } from './events';
import { isDev, warn, warnOnce } from './dev';
import { validateTour } from './validation';

// How long to wait after startTour() before concluding that no overlay is
// mounted. Generous enough to cover a lazily-rendered or navigation-mounted
// overlay, short enough to surface the problem while the developer is looking.
const MISSING_OVERLAY_CHECK_MS = 1000;

const TourGuideContext = createContext<TourGuideContextValue | undefined>(undefined);

export interface TourGuideProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps your app to enable tour guide functionality.
 * Place this at the root of your app, typically in App.tsx.
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
export const TourGuideProvider: React.FC<TourGuideProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [activeSteps, setActiveSteps] = useState<TourStep[]>([]);
  const [config, setConfig] = useState<ResolvedTourGuideConfig | undefined>(undefined);
  const [targetLayout, setTargetLayout] = useState<SpotlightTarget | null>(null);
  const [activeTourId, setActiveTourId] = useState<string | undefined>(undefined);

  // Lock to prevent double-taps during async beforeStepChange
  const isTransitioning = useRef(false);
  // Refs for stable access in callbacks without nested setState
  const configRef = useRef<ResolvedTourGuideConfig | undefined>(undefined);
  const activeStepsRef = useRef<TourStep[]>([]);
  const currentStepRef = useRef(0);

  // Number of mounted <TourGuideOverlay /> instances, used to diagnose the two
  // most common integration mistakes: no overlay at all (tour silently does
  // nothing) and more than one (two stacked modals).
  const overlayCount = useRef(0);
  const missingOverlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(false);

  // Keep refs in sync with state
  activeStepsRef.current = activeSteps;
  currentStepRef.current = currentStep;
  isActiveRef.current = isActive;

  const clearMissingOverlayCheck = useCallback(() => {
    if (missingOverlayTimer.current) {
      clearTimeout(missingOverlayTimer.current);
      missingOverlayTimer.current = null;
    }
  }, []);

  useEffect(() => clearMissingOverlayCheck, [clearMissingOverlayCheck]);

  // <TourTarget> registry. A ref, not state: registration must never re-render
  // the app, and lookups happen inside measurement callbacks.
  const targetsRef = useRef<Map<string, RegisteredTarget>>(new Map());

  const registerTarget = useCallback(
    (id: string, ref: MeasurableRef, style?: StyleProp<ViewStyle>) => {
      if (targetsRef.current.has(id)) {
        warnOnce(
          `Two <TourTarget> components share the id "${id}" — the later one wins.`,
          'Give every TourTarget a unique id.'
        );
      }
      targetsRef.current.set(id, { ref, style });
    },
    []
  );

  const unregisterTarget = useCallback((id: string, ref?: MeasurableRef) => {
    // Only remove the entry if it belongs to the caller. Duplicate ids are
    // tolerated ("the later one wins"), but an unmounting loser must not
    // clobber the still-mounted winner's registration — e.g. a stack-navigator
    // screen popping while the previous screen keeps the same TourTarget id.
    if (ref && targetsRef.current.get(id)?.ref !== ref) return;
    targetsRef.current.delete(id);
  }, []);

  const getTarget = useCallback(
    (id: string): RegisteredTarget | undefined => targetsRef.current.get(id),
    []
  );

  // Lifecycle event emitter — stable for the provider's lifetime. Lazily
  // initialised so the factory doesn't run on every render just to be thrown
  // away by useRef.
  const eventsRef = useRef<ReturnType<typeof createTourEvents> | null>(null);
  if (eventsRef.current === null) {
    eventsRef.current = createTourEvents();
  }
  const events = eventsRef.current;

  // Guarantees every emitted 'start' is paired with exactly one 'end', no
  // matter which exit path runs (finish, skip, programmatic endTour, or a
  // startTour that replaces a live tour). True when no tour is active or the
  // active tour's 'end' has already been emitted.
  const endEmitted = useRef(true);

  // Scroll plumbing for useTourScroll: consumers report offsets/momentum-end
  // through the hook; the overlay subscribes for followTarget tracking and the
  // exact settle signal. Refs, not state — scroll must never re-render the app.
  const scrollListeners = useRef(new Set<(y: number) => void>());
  const scrollEndListeners = useRef(new Set<() => void>());
  const trackedScrollY = useRef<number | undefined>(undefined);

  const __reportScroll = useCallback((y: number) => {
    trackedScrollY.current = y;
    for (const cb of scrollListeners.current) cb(y);
  }, []);

  const __reportScrollEnd = useCallback(() => {
    for (const cb of scrollEndListeners.current) cb();
  }, []);

  const __subscribeScroll = useCallback((cb: (y: number) => void) => {
    scrollListeners.current.add(cb);
    return () => {
      scrollListeners.current.delete(cb);
    };
  }, []);

  const __subscribeScrollEnd = useCallback((cb: () => void) => {
    scrollEndListeners.current.add(cb);
    return () => {
      scrollEndListeners.current.delete(cb);
    };
  }, []);

  const __getTrackedScrollY = useCallback(() => trackedScrollY.current, []);

  // Tours registered up front via defineTour, startable by id from anywhere.
  const definedToursRef = useRef<Map<string, { steps: TourStep[]; config?: TourGuideConfig }>>(
    new Map()
  );

  const defineTour = useCallback(
    (tourId: string, tourSteps: TourStep[], tourConfig?: TourGuideConfig) => {
      if (!tourId || !Array.isArray(tourSteps)) {
        warn(
          'defineTour(tourId, steps, config?) needs a non-empty id and a steps array.',
          "Example: defineTour('onboarding', steps, { showProgressDots: true })."
        );
        return;
      }
      definedToursRef.current.set(tourId, { steps: tourSteps, config: tourConfig });
    },
    []
  );

  const removeTour = useCallback((tourId: string) => {
    definedToursRef.current.delete(tourId);
  }, []);

  const canStartTour = useCallback((tourOrSteps: string | TourStep[]): boolean => {
    const tourSteps =
      typeof tourOrSteps === 'string'
        ? definedToursRef.current.get(tourOrSteps)?.steps
        : tourOrSteps;
    if (!tourSteps || tourSteps.length === 0) return false;
    return tourSteps.every(
      (st) =>
        !st.targetId || // steps without targetId are always ready
        Boolean(st.targetRef) ||
        Boolean(st.targetRegion) ||
        targetsRef.current.has(st.targetId)
    );
  }, []);

  /**
   * Flip a step's `completed` gate. Updates both the full and active step
   * lists so the tooltip's Next button reflects it immediately.
   */
  const setStepCompleted = useCallback((stepId: string, completed: boolean) => {
    const apply = (list: TourStep[]) => {
      const i = list.findIndex((st) => st.id === stepId);
      if (i < 0) return list;
      const next = list.slice();
      next[i] = { ...(next[i] as TourStep), completed };
      return next;
    };
    setSteps(apply);
    setActiveSteps((prev) => {
      const next = apply(prev);
      activeStepsRef.current = next;
      return next;
    });
  }, []);

  /**
   * Called by <TourGuideOverlay /> on mount. Returns its unmount cleanup.
   * @internal
   */
  const registerOverlay = useCallback(() => {
    overlayCount.current += 1;
    if (overlayCount.current > 1) {
      warnOnce(
        `${overlayCount.current} <TourGuideOverlay /> components are mounted at once, which stacks multiple modals on top of each other.`,
        'Render exactly one <TourGuideOverlay /> for the whole app, just inside <TourGuideProvider>.'
      );
    }
    return () => {
      overlayCount.current = Math.max(0, overlayCount.current - 1);
    };
  }, []);

  const startTour = useCallback(
    (stepsOrId: TourStep[] | string, configOverride?: TourGuideConfig) => {
      // String form: start a tour registered with defineTour, with the passed
      // config overriding the stored one field-by-field.
      let tourSteps: TourStep[];
      let rawConfig: TourGuideConfig | undefined;
      if (typeof stepsOrId === 'string') {
        const defined = definedToursRef.current.get(stepsOrId);
        if (!defined) {
          warn(
            `startTour("${stepsOrId}") was called but no tour with that id was registered.`,
            `Call defineTour('${stepsOrId}', steps, config) first, or pass a steps array directly.`
          );
          return;
        }
        tourSteps = defined.steps;
        rawConfig = configOverride ? { ...defined.config, ...configOverride } : defined.config;
      } else {
        tourSteps = stepsOrId;
        rawConfig = configOverride;
      }

      // Per-platform values ({ ios, android, web, default }) resolve here, so
      // everything downstream reads plain values.
      const tourConfig = resolvePlatformConfig(rawConfig);

      // Dev-only: surface malformed steps/config before they fail silently.
      validateTour(tourSteps, tourConfig);

      if (!Array.isArray(tourSteps)) return;

      if (isActiveRef.current) {
        warn(
          'startTour() was called while a tour was already running. The previous tour is replaced without firing its onTourEnd.',
          "Call endTour() or skipTour() first if you need the previous tour's onTourEnd to run."
        );
        // The events API still guarantees start/end pairing even on this path.
        if (!endEmitted.current) {
          events.emit('end', { completed: false, tourId: configRef.current?.tourId });
          endEmitted.current = true;
        }
      }

      const filtered = tourSteps.filter((s) => s && s.active !== false);

      if (filtered.length === 0) {
        warn(
          'No active steps to show, so the tour was not started.',
          'Check that at least one step does not have active: false.'
        );
        return;
      }

      // Release the transition lock: a previous tour may have been torn down
      // mid-transition (e.g. an unresolved beforeStepChange promise), which would
      // otherwise leave next/prev permanently dead for this new tour.
      isTransitioning.current = false;

      setSteps(tourSteps);
      setActiveSteps(filtered);
      activeStepsRef.current = filtered;
      setConfig(tourConfig);
      configRef.current = tourConfig;
      setActiveTourId(tourConfig?.tourId);
      setCurrentStep(0);
      currentStepRef.current = 0;
      setIsPaused(false);
      setIsActive(true);
      isActiveRef.current = true;
      tourConfig?.onTourStart?.();
      endEmitted.current = false;
      events.emit('start', { tourId: tourConfig?.tourId, totalSteps: filtered.length });

      // Dev-only: a tour with no overlay mounted renders nothing at all, with no
      // error to explain why. Check shortly after start, once mounting settles.
      if (isDev()) {
        clearMissingOverlayCheck();
        missingOverlayTimer.current = setTimeout(() => {
          missingOverlayTimer.current = null;
          if (overlayCount.current === 0 && isActiveRef.current) {
            warnOnce(
              'startTour() was called but no <TourGuideOverlay /> is mounted, so the tour is running invisibly.',
              'Render <TourGuideOverlay /> once inside <TourGuideProvider>, after your app content.'
            );
          }
        }, MISSING_OVERLAY_CHECK_MS);
      }
    },
    [clearMissingOverlayCheck]
  );

  const endTour = useCallback(() => {
    // endTour() is a public exit path: if the finish/skip flows haven't already
    // emitted this tour's 'end', do it here so start/end always pair up —
    // otherwise a custom close button or logout effect leaves analytics with
    // an open-ended tour.
    if (isActiveRef.current && !endEmitted.current) {
      events.emit('end', { completed: false, tourId: configRef.current?.tourId });
    }
    endEmitted.current = true;
    clearMissingOverlayCheck();
    setIsActive(false);
    isActiveRef.current = false;
    setIsPaused(false);
    setCurrentStep(0);
    currentStepRef.current = 0;
    setSteps([]);
    setActiveSteps([]);
    activeStepsRef.current = [];
    setConfig(undefined);
    configRef.current = undefined;
    setActiveTourId(undefined);
    setTargetLayout(null);
    isTransitioning.current = false;
  }, [clearMissingOverlayCheck, events]);

  const pauseTour = useCallback(() => {
    if (isActive && !isPaused) {
      setIsPaused(true);
      events.emit('pause', { at: currentStepRef.current });
    }
  }, [isActive, isPaused, events]);

  const resumeTour = useCallback(() => {
    if (isActive && isPaused) {
      setIsPaused(false);
      setTargetLayout(null); // Force re-measurement
      events.emit('resume', { at: currentStepRef.current });
    }
  }, [isActive, isPaused, events]);

  /**
   * Run a beforeStepChange guard with the transition lock held, releasing the
   * lock on EVERY outcome — allow, block, reject, or a synchronous throw. A
   * throwing guard used to leave the lock permanently engaged, killing
   * next/prev/goToStep for the rest of the session.
   */
  const runGuard = useCallback(
    (
      guard: NonNullable<TourGuideConfig['beforeStepChange']>,
      from: number,
      to: number,
      proceed: () => void
    ) => {
      isTransitioning.current = true;
      let result: boolean | Promise<boolean>;
      try {
        result = guard(from, to);
      } catch (error) {
        isTransitioning.current = false;
        warn(
          `beforeStepChange(${from}, ${to}) threw: ${String(error)}. The step change was blocked.`,
          'Note that on the final step `to` equals the number of steps (one past the end) — guard against out-of-range indexing.'
        );
        return;
      }
      if (result instanceof Promise) {
        result
          .then((allowed) => {
            if (allowed) {
              proceed();
            } else {
              isTransitioning.current = false;
            }
          })
          .catch((error) => {
            isTransitioning.current = false;
            warn(
              `beforeStepChange(${from}, ${to}) rejected: ${String(error)}. The step change was blocked.`
            );
          });
      } else if (result) {
        proceed();
      } else {
        isTransitioning.current = false;
      }
    },
    []
  );

  const nextStep = useCallback(() => {
    if (isTransitioning.current) return;

    const prev = currentStepRef.current;
    const currentActiveSteps = activeStepsRef.current;
    const currentConfig = configRef.current;
    const step = currentActiveSteps[prev];
    const isLastStep = prev >= currentActiveSteps.length - 1;

    const doTransition = () => {
      if (isLastStep) {
        step?.onNext?.();
        currentConfig?.onTourEnd?.(true);
        events.emit('end', { completed: true, tourId: currentConfig?.tourId });
        endEmitted.current = true;
        endTour();
      } else {
        step?.onNext?.();
        currentConfig?.onStepChange?.(prev, prev + 1);
        events.emit('stepChange', {
          from: prev,
          to: prev + 1,
          step: currentActiveSteps[prev + 1],
        });
        currentStepRef.current = prev + 1;
        setCurrentStep(prev + 1);
        setTargetLayout(null);
      }
      isTransitioning.current = false;
    };

    if (currentConfig?.beforeStepChange) {
      // On the last step the tour finishes, so the "to" index is one past the
      // end (prev + 1 === totalSteps). Reporting `prev` here instead would make
      // a guard like `(from, to) => to > from` silently block the Done button.
      runGuard(currentConfig.beforeStepChange, prev, prev + 1, doTransition);
    } else {
      doTransition();
    }
  }, [endTour, runGuard]);

  const prevStep = useCallback(() => {
    if (isTransitioning.current) return;

    const prev = currentStepRef.current;
    if (prev <= 0) return;

    const currentActiveSteps = activeStepsRef.current;
    const currentConfig = configRef.current;
    const step = currentActiveSteps[prev];

    const doTransition = () => {
      step?.onPrev?.();
      currentConfig?.onStepChange?.(prev, prev - 1);
      events.emit('stepChange', {
        from: prev,
        to: prev - 1,
        step: currentActiveSteps[prev - 1],
      });
      currentStepRef.current = prev - 1;
      setCurrentStep(prev - 1);
      setTargetLayout(null);
      isTransitioning.current = false;
    };

    if (currentConfig?.beforeStepChange) {
      runGuard(currentConfig.beforeStepChange, prev, prev - 1, doTransition);
    } else {
      doTransition();
    }
  }, [runGuard]);

  const skipTour = useCallback(() => {
    const step = activeStepsRef.current[currentStepRef.current];
    step?.onSkip?.();
    configRef.current?.onTourEnd?.(false);
    events.emit('skip', { at: currentStepRef.current });
    events.emit('end', { completed: false, tourId: configRef.current?.tourId });
    endEmitted.current = true;
    endTour();
  }, [endTour, events]);

  const goToStep = useCallback(
    (index: number) => {
      if (isTransitioning.current) return;

      const len = activeStepsRef.current.length;
      if (!Number.isInteger(index) || index < 0 || index >= len) {
        warn(
          `goToStep(${index}) is out of bounds — there ${len === 1 ? 'is' : 'are'} ${len} active step${len === 1 ? '' : 's'} (valid range 0-${Math.max(0, len - 1)}).`,
          'Pass an index within the active steps; note that steps with active: false are excluded from the index.'
        );
        return;
      }

      const from = currentStepRef.current;
      if (from === index) return;

      // goToStep is a step change like any other: it fires onStepChange AND
      // respects the beforeStepChange guard — a custom progress-dots tooltip
      // jumping by index must not bypass a gate that Next/Back honour.
      const doTransition = () => {
        configRef.current?.onStepChange?.(from, index);
        events.emit('stepChange', { from, to: index, step: activeStepsRef.current[index] });
        currentStepRef.current = index;
        setCurrentStep(index);
        setTargetLayout(null);
        isTransitioning.current = false;
      };

      const guard = configRef.current?.beforeStepChange;
      if (guard) {
        runGuard(guard, from, index, doTransition);
      } else {
        doTransition();
      }
    },
    [runGuard]
  );

  const value = useMemo<TourGuideContextValue>(
    () => ({
      currentStep,
      isActive,
      isPaused,
      activeTourId,
      steps,
      activeSteps,
      config,
      startTour,
      defineTour,
      removeTour,
      canStartTour,
      nextStep,
      prevStep,
      skipTour,
      endTour,
      goToStep,
      pauseTour,
      resumeTour,
      setStepCompleted,
      registerTarget,
      unregisterTarget,
      getTarget,
      setTargetLayout,
      targetLayout,
      events,
      __reportScroll,
      __reportScrollEnd,
      __subscribeScroll,
      __subscribeScrollEnd,
      __getTrackedScrollY,
      __registerOverlay: registerOverlay,
    }),
    [
      currentStep,
      isActive,
      isPaused,
      activeTourId,
      steps,
      activeSteps,
      config,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      endTour,
      goToStep,
      pauseTour,
      resumeTour,
      targetLayout,
      registerOverlay,
      setStepCompleted,
      registerTarget,
      unregisterTarget,
      getTarget,
      defineTour,
      removeTour,
      canStartTour,
      events,
      __reportScroll,
      __reportScrollEnd,
      __subscribeScroll,
      __subscribeScrollEnd,
      __getTrackedScrollY,
    ]
  );

  return <TourGuideContext.Provider value={value}>{children}</TourGuideContext.Provider>;
};

/**
 * Hook to access tour guide functionality.
 * Must be used within a TourGuideProvider.
 *
 * @example
 * ```tsx
 * const { startTour, isActive } = useTourGuide();
 *
 * const handleStartTour = () => {
 *   startTour([
 *     {
 *       id: 'step1',
 *       targetRef: myButtonRef,
 *       title: 'Welcome!',
 *       description: 'This is your first step.',
 *     },
 *   ]);
 * };
 * ```
 */
export const useTourGuide = (): TourGuideContextValue => {
  const context = useContext(TourGuideContext);
  if (!context) {
    throw new Error('useTourGuide must be used within TourGuideProvider');
  }
  return context;
};
