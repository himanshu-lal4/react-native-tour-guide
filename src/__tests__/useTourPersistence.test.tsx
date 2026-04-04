import React from 'react';

// eslint-disable-next-line import/order
import type { TourStorage, TourStep, TourGuideConfig, TourGuideContextValue } from '../types';

// Mock useTourGuide so we don't need to render a provider
const mockStartTour = jest.fn();
const mockTourGuide: TourGuideContextValue = {
  currentStep: 0,
  isActive: false,
  isPaused: false,
  steps: [],
  activeSteps: [],
  startTour: mockStartTour,
  nextStep: jest.fn(),
  prevStep: jest.fn(),
  skipTour: jest.fn(),
  endTour: jest.fn(),
  goToStep: jest.fn(),
  pauseTour: jest.fn(),
  resumeTour: jest.fn(),
  setTargetLayout: jest.fn(),
  targetLayout: null,
};

jest.mock('../TourGuideContext', () => ({
  useTourGuide: () => mockTourGuide,
}));

// Now import the hook - it will use our mock
import { useTourPersistence } from '../useTourPersistence';

// Helper: call the hook in a minimal React hooks context
// by mocking useCallback and useRef to behave synchronously.
// Named with "use" prefix to satisfy react-hooks/rules-of-hooks lint rule.
function useTestHook(storage: TourStorage) {
  // useRef returns a mutable ref object
  const refMap = new Map<number, { current: unknown }>();
  let refCounter = 0;
  jest.spyOn(React, 'useRef').mockImplementation((initial: unknown) => {
    const idx = refCounter++;
    if (!refMap.has(idx)) {
      refMap.set(idx, { current: initial });
    }
    const ref = refMap.get(idx);
    if (ref && initial !== undefined) {
      ref.current = initial;
    }
    return ref as React.RefObject<unknown>;
  });

  // useCallback just returns the function
  jest
    .spyOn(React, 'useCallback')
    .mockImplementation(((fn: Function) => fn) as typeof React.useCallback);

  const result = useTourPersistence(storage);

  // Restore
  (React.useRef as jest.Mock).mockRestore();
  (React.useCallback as jest.Mock).mockRestore();

  return result;
}

function createMockStorage(): TourStorage & { store: Record<string, string> } {
  const store: Record<string, string> = {};
  return {
    store,
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
  };
}

const makeSteps = (): TourStep[] => [
  { id: 's1', title: 'Step 1', description: 'Desc 1' },
  { id: 's2', title: 'Step 2', description: 'Desc 2' },
];

describe('useTourPersistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTourCompleted', () => {
    it('returns true when storage has "completed" for the tour', async () => {
      const storage = createMockStorage();
      storage.store['@tour_guide:onboarding'] = 'completed';

      const hook = useTestHook(storage);
      const result = await hook.isTourCompleted('onboarding');

      expect(result).toBe(true);
      expect(storage.getItem).toHaveBeenCalledWith('@tour_guide:onboarding');
    });

    it('returns false when storage has no entry for the tour', async () => {
      const storage = createMockStorage();

      const hook = useTestHook(storage);
      const result = await hook.isTourCompleted('unknown');

      expect(result).toBe(false);
    });

    it('returns false when storage has a non-"completed" value', async () => {
      const storage = createMockStorage();
      storage.store['@tour_guide:partial'] = 'in-progress';

      const hook = useTestHook(storage);
      const result = await hook.isTourCompleted('partial');

      expect(result).toBe(false);
    });
  });

  describe('resetTour', () => {
    it('removes the tour entry from storage', async () => {
      const storage = createMockStorage();
      storage.store['@tour_guide:onboarding'] = 'completed';

      const hook = useTestHook(storage);
      await hook.resetTour('onboarding');

      expect(storage.removeItem).toHaveBeenCalledWith('@tour_guide:onboarding');
      expect(storage.store['@tour_guide:onboarding']).toBeUndefined();
    });
  });

  describe('markCompleted', () => {
    it('sets the completed flag in storage', async () => {
      const storage = createMockStorage();

      const hook = useTestHook(storage);
      await hook.markCompleted('feature-tour');

      expect(storage.setItem).toHaveBeenCalledWith('@tour_guide:feature-tour', 'completed');
      expect(storage.store['@tour_guide:feature-tour']).toBe('completed');
    });
  });

  describe('startTour', () => {
    it('starts tour when not previously completed', async () => {
      const storage = createMockStorage();

      const hook = useTestHook(storage);
      const started = await hook.startTour(makeSteps(), { tourId: 'onboarding' });

      expect(started).toBe(true);
      expect(mockStartTour).toHaveBeenCalledTimes(1);
      // The config passed to startTour should have an enhanced onTourEnd
      const passedConfig = mockStartTour.mock.calls[0][1];
      expect(passedConfig.tourId).toBe('onboarding');
    });

    it('skips tour when already completed', async () => {
      const storage = createMockStorage();
      storage.store['@tour_guide:onboarding'] = 'completed';

      const hook = useTestHook(storage);
      const started = await hook.startTour(makeSteps(), { tourId: 'onboarding' });

      expect(started).toBe(false);
      expect(mockStartTour).not.toHaveBeenCalled();
    });

    it('force-starts tour even when completed', async () => {
      const storage = createMockStorage();
      storage.store['@tour_guide:onboarding'] = 'completed';

      const hook = useTestHook(storage);
      const started = await hook.startTour(makeSteps(), { tourId: 'onboarding' }, true);

      expect(started).toBe(true);
      expect(mockStartTour).toHaveBeenCalledTimes(1);
    });

    it('warns and starts tour when tourId is not provided', async () => {
      const storage = createMockStorage();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const hook = useTestHook(storage);
      const started = await hook.startTour(makeSteps());

      expect(started).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('requires config.tourId'));
      expect(mockStartTour).toHaveBeenCalledTimes(1);
      warnSpy.mockRestore();
    });

    it('marks tour as completed when enhanced onTourEnd is called with true', async () => {
      const storage = createMockStorage();

      const hook = useTestHook(storage);
      await hook.startTour(makeSteps(), { tourId: 'feature' });

      // Get the enhanced config passed to startTour
      const passedConfig = mockStartTour.mock.calls[0][1] as TourGuideConfig;
      expect(passedConfig.onTourEnd).toBeDefined();

      // Simulate tour completion
      passedConfig.onTourEnd?.(true);

      // Wait for async setItem
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(storage.setItem).toHaveBeenCalledWith('@tour_guide:feature', 'completed');
    });

    it('does not mark completed when onTourEnd called with false (skipped)', async () => {
      const storage = createMockStorage();

      const hook = useTestHook(storage);
      await hook.startTour(makeSteps(), { tourId: 'feature' });

      const passedConfig = mockStartTour.mock.calls[0][1] as TourGuideConfig;
      passedConfig.onTourEnd?.(false);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('calls original onTourEnd callback', async () => {
      const storage = createMockStorage();
      const originalOnTourEnd = jest.fn();

      const hook = useTestHook(storage);
      await hook.startTour(makeSteps(), {
        tourId: 'test',
        onTourEnd: originalOnTourEnd,
      });

      const passedConfig = mockStartTour.mock.calls[0][1] as TourGuideConfig;
      passedConfig.onTourEnd?.(true);

      expect(originalOnTourEnd).toHaveBeenCalledWith(true);
    });
  });

  describe('spreads tourGuide properties', () => {
    it('exposes all tourGuide methods', () => {
      const storage = createMockStorage();
      const hook = useTestHook(storage);

      expect(hook.nextStep).toBe(mockTourGuide.nextStep);
      expect(hook.prevStep).toBe(mockTourGuide.prevStep);
      expect(hook.skipTour).toBe(mockTourGuide.skipTour);
      expect(hook.endTour).toBe(mockTourGuide.endTour);
      expect(hook.goToStep).toBe(mockTourGuide.goToStep);
      expect(hook.pauseTour).toBe(mockTourGuide.pauseTour);
      expect(hook.resumeTour).toBe(mockTourGuide.resumeTour);
    });

    it('overrides startTour with persistence-aware version', () => {
      const storage = createMockStorage();
      const hook = useTestHook(storage);

      // The hook's startTour should NOT be the same as the mock's
      expect(hook.startTour).not.toBe(mockTourGuide.startTour);
    });
  });
});
