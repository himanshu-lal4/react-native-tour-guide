import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import type {
  TourGuideContextValue,
  TourStep,
  SpotlightTarget,
  TourGuideConfig,
} from './types';

const TourGuideContext = createContext<TourGuideContextValue | undefined>(
  undefined
);

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
export const TourGuideProvider: React.FC<TourGuideProviderProps> = ({
  children,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [config, setConfig] = useState<TourGuideConfig | undefined>(undefined);
  const [targetLayout, setTargetLayout] = useState<SpotlightTarget | null>(
    null
  );

  /**
   * Start a new tour with the given steps and optional configuration
   */
  const startTour = useCallback(
    (tourSteps: TourStep[], tourConfig?: TourGuideConfig) => {
      setSteps(tourSteps);
      setConfig(tourConfig);
      setCurrentStep(0);
      setIsActive(true);
    },
    []
  );

  /**
   * End the tour and reset all state
   */
  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    setConfig(undefined);
    setTargetLayout(null);
  }, []);

  /**
   * Move to the next step, or end the tour if on the last step
   */
  const nextStep = useCallback(() => {
    const step = steps[currentStep];

    if (currentStep < steps.length - 1) {
      step?.onNext?.();
      setCurrentStep((prev) => prev + 1);
      setTargetLayout(null); // Reset layout for next step
    } else {
      // Last step - call onNext before ending tour
      step?.onNext?.();
      endTour();
    }
  }, [currentStep, steps, endTour]);

  /**
   * Move to the previous step
   */
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const step = steps[currentStep];
      step?.onPrev?.();
      setCurrentStep((prev) => prev - 1);
      setTargetLayout(null); // Reset layout for prev step
    }
  }, [currentStep, steps]);

  /**
   * Skip the entire tour
   */
  const skipTour = useCallback(() => {
    const step = steps[currentStep];
    step?.onSkip?.();
    endTour();
  }, [currentStep, steps, endTour]);

  const value: TourGuideContextValue = {
    currentStep,
    isActive,
    steps,
    config,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    endTour,
    setTargetLayout,
    targetLayout,
  };

  return (
    <TourGuideContext.Provider value={value}>
      {children}
    </TourGuideContext.Provider>
  );
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
