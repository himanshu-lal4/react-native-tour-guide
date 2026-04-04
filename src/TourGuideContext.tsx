import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

import type { TourGuideContextValue, TourStep, SpotlightTarget, TourGuideConfig } from './types';

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
  const [config, setConfig] = useState<TourGuideConfig | undefined>(undefined);
  const [targetLayout, setTargetLayout] = useState<SpotlightTarget | null>(null);
  const [activeTourId, setActiveTourId] = useState<string | undefined>(undefined);

  // Lock to prevent double-taps during async beforeStepChange
  const isTransitioning = useRef(false);
  // Refs for stable access in callbacks without nested setState
  const configRef = useRef<TourGuideConfig | undefined>(undefined);
  const activeStepsRef = useRef<TourStep[]>([]);
  const currentStepRef = useRef(0);

  // Keep refs in sync with state
  activeStepsRef.current = activeSteps;
  currentStepRef.current = currentStep;

  const startTour = useCallback((tourSteps: TourStep[], tourConfig?: TourGuideConfig) => {
    const filtered = tourSteps.filter((s) => s.active !== false);

    if (filtered.length === 0) {
      console.warn('react-native-tour-guide: No active steps to show. Tour not started.');
      return;
    }

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
    tourConfig?.onTourStart?.();
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
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
  }, []);

  const pauseTour = useCallback(() => {
    if (isActive && !isPaused) {
      setIsPaused(true);
    }
  }, [isActive, isPaused]);

  const resumeTour = useCallback(() => {
    if (isActive && isPaused) {
      setIsPaused(false);
      setTargetLayout(null); // Force re-measurement
    }
  }, [isActive, isPaused]);

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
        endTour();
      } else {
        step?.onNext?.();
        currentConfig?.onStepChange?.(prev, prev + 1);
        currentStepRef.current = prev + 1;
        setCurrentStep(prev + 1);
        setTargetLayout(null);
      }
      isTransitioning.current = false;
    };

    if (currentConfig?.beforeStepChange) {
      isTransitioning.current = true;
      const nextIndex = isLastStep ? prev : prev + 1;
      const result = currentConfig.beforeStepChange(prev, nextIndex);

      if (result instanceof Promise) {
        result
          .then((allowed) => {
            if (allowed) {
              doTransition();
            } else {
              isTransitioning.current = false;
            }
          })
          .catch(() => {
            isTransitioning.current = false;
          });
      } else if (result) {
        doTransition();
      } else {
        isTransitioning.current = false;
      }
    } else {
      doTransition();
    }
  }, [endTour]);

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
      currentStepRef.current = prev - 1;
      setCurrentStep(prev - 1);
      setTargetLayout(null);
      isTransitioning.current = false;
    };

    if (currentConfig?.beforeStepChange) {
      isTransitioning.current = true;
      const result = currentConfig.beforeStepChange(prev, prev - 1);

      if (result instanceof Promise) {
        result
          .then((allowed) => {
            if (allowed) {
              doTransition();
            } else {
              isTransitioning.current = false;
            }
          })
          .catch(() => {
            isTransitioning.current = false;
          });
      } else if (result) {
        doTransition();
      } else {
        isTransitioning.current = false;
      }
    } else {
      doTransition();
    }
  }, []);

  const skipTour = useCallback(() => {
    const step = activeStepsRef.current[currentStepRef.current];
    step?.onSkip?.();
    configRef.current?.onTourEnd?.(false);
    endTour();
  }, [endTour]);

  const goToStep = useCallback((index: number) => {
    const len = activeStepsRef.current.length;
    if (index < 0 || index >= len) {
      console.warn(
        `react-native-tour-guide: goToStep(${index}) is out of bounds. Active steps: ${len}`
      );
      return;
    }
    currentStepRef.current = index;
    setCurrentStep(index);
    setTargetLayout(null);
  }, []);

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
      nextStep,
      prevStep,
      skipTour,
      endTour,
      goToStep,
      pauseTour,
      resumeTour,
      setTargetLayout,
      targetLayout,
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
