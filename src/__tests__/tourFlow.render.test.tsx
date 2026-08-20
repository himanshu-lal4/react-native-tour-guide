import { render, act, screen } from '@testing-library/react-native';

import { TourGuideProvider, useTourGuide } from '../TourGuideContext';
import TourGuideOverlay from '../TourGuideOverlay';
import { __resetWarnings } from '../dev';
import type { TourGuideConfig, TourGuideContextValue, TourStep } from '../types';

let api: TourGuideContextValue;
const Capture = () => {
  api = useTourGuide();
  return null;
};

const renderTour = () =>
  render(
    <TourGuideProvider>
      <Capture />
      <TourGuideOverlay />
    </TourGuideProvider>
  );

const measurableRef = () => ({
  current: {
    measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) =>
      cb(10, 20, 100, 50),
  },
});

const makeSteps = (n: number): TourStep[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `s${i + 1}`,
    title: `Title ${i + 1}`,
    description: `Description ${i + 1}`,
    targetRef: measurableRef(),
  }));

const flush = async (ms = 400) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

const start = async (steps: TourStep[], config?: TourGuideConfig) => {
  await act(async () => {
    api.startTour(steps, config);
  });
  await flush();
};

describe('tour flow', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    __resetWarnings();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    jest.useRealTimers();
  });

  const warnings = () => warnSpy.mock.calls.map((c) => String(c[0])).join('\n');

  describe('goToStep', () => {
    it('fires onStepChange when jumping', async () => {
      const onStepChange = jest.fn();
      await renderTour();
      await start(makeSteps(3), { onStepChange });

      await act(async () => api.goToStep(2));
      await flush();

      expect(onStepChange).toHaveBeenCalledWith(0, 2);
      expect(screen.getByText('Title 3')).toBeTruthy();
    });

    it('ignores an out-of-bounds index and warns', async () => {
      const onStepChange = jest.fn();
      await renderTour();
      await start(makeSteps(2), { onStepChange });

      await act(async () => api.goToStep(5));
      await flush();

      expect(onStepChange).not.toHaveBeenCalled();
      expect(warnings()).toContain('out of bounds');
      expect(screen.getByText('Title 1')).toBeTruthy();
    });

    it('ignores a jump to the current step', async () => {
      const onStepChange = jest.fn();
      await renderTour();
      await start(makeSteps(3), { onStepChange });

      await act(async () => api.goToStep(0));
      expect(onStepChange).not.toHaveBeenCalled();
    });
  });

  describe('beforeStepChange', () => {
    it('receives the from/to indices and can allow the change', async () => {
      const beforeStepChange = jest.fn(() => true);
      await renderTour();
      await start(makeSteps(3), { beforeStepChange });

      await act(async () => api.nextStep());
      await flush();

      expect(beforeStepChange).toHaveBeenCalledWith(0, 1);
      expect(screen.getByText('Title 2')).toBeTruthy();
    });

    it('blocks the change when it returns false', async () => {
      await renderTour();
      await start(makeSteps(3), { beforeStepChange: () => false });

      await act(async () => api.nextStep());
      await flush();

      expect(screen.getByText('Title 1')).toBeTruthy();
    });

    it('blocks the change when its promise resolves false', async () => {
      await renderTour();
      await start(makeSteps(3), { beforeStepChange: () => Promise.resolve(false) });

      await act(async () => api.nextStep());
      await flush();

      expect(screen.getByText('Title 1')).toBeTruthy();
    });

    it('allows the change when its promise resolves true', async () => {
      await renderTour();
      await start(makeSteps(3), { beforeStepChange: () => Promise.resolve(true) });

      await act(async () => api.nextStep());
      await flush();

      expect(screen.getByText('Title 2')).toBeTruthy();
    });

    it('reports `to` as one past the end on the final step', async () => {
      // Regression: `to` used to equal `from` when finishing, so a guard like
      // `(from, to) => to > from` silently blocked the Done button forever.
      const beforeStepChange = jest.fn((from: number, to: number) => to > from);
      const onTourEnd = jest.fn();
      await renderTour();
      await start(makeSteps(2), { beforeStepChange, onTourEnd });

      await act(async () => api.nextStep());
      await flush();
      await act(async () => api.nextStep());
      await flush();

      expect(beforeStepChange).toHaveBeenLastCalledWith(1, 2);
      expect(onTourEnd).toHaveBeenCalledWith(true);
    });

    it('releases the transition lock for a new tour when a promise never settles', async () => {
      // A pending guard used to leave next/prev permanently dead, including for
      // every subsequent tour.
      const onStepChange = jest.fn();
      await renderTour();
      await start(makeSteps(3), { beforeStepChange: () => new Promise<boolean>(() => {}) });

      await act(async () => api.nextStep());
      await flush();
      expect(screen.getByText('Title 1')).toBeTruthy();

      // Starting a fresh tour must recover.
      await start(makeSteps(3), { onStepChange });
      await act(async () => api.nextStep());
      await flush();

      expect(onStepChange).toHaveBeenCalledWith(0, 1);
      expect(screen.getByText('Title 2')).toBeTruthy();
    });
  });

  describe('lifecycle callbacks', () => {
    it('calls onTourStart when the tour starts', async () => {
      const onTourStart = jest.fn();
      await renderTour();
      await start(makeSteps(2), { onTourStart });
      expect(onTourStart).toHaveBeenCalledTimes(1);
    });

    it('calls onTourEnd(true) after the last step', async () => {
      const onTourEnd = jest.fn();
      await renderTour();
      await start(makeSteps(1), { onTourEnd });

      await act(async () => api.nextStep());
      expect(onTourEnd).toHaveBeenCalledWith(true);
    });

    it('calls onTourEnd(false) and the step onSkip when skipped', async () => {
      const onTourEnd = jest.fn();
      const onSkip = jest.fn();
      const steps = makeSteps(2).map((s, i) => (i === 0 ? { ...s, onSkip } : s));

      await renderTour();
      await start(steps, { onTourEnd });
      await act(async () => api.skipTour());

      expect(onSkip).toHaveBeenCalledTimes(1);
      expect(onTourEnd).toHaveBeenCalledWith(false);
      expect(screen.queryByText('Title 1')).toBeNull();
    });

    it('hides the overlay while paused and restores it on resume', async () => {
      await renderTour();
      await start(makeSteps(2));
      expect(screen.getByText('Title 1')).toBeTruthy();

      await act(async () => api.pauseTour());
      expect(screen.queryByText('Title 1')).toBeNull();

      await act(async () => api.resumeTour());
      await flush();
      expect(screen.getByText('Title 1')).toBeTruthy();
    });
  });

  describe('startTour guards', () => {
    it('does not start when every step is inactive', async () => {
      const onTourStart = jest.fn();
      await renderTour();
      await start([{ id: 'a', title: 'Title 1', description: 'd', active: false }], {
        onTourStart,
      });

      expect(onTourStart).not.toHaveBeenCalled();
      expect(warnings()).toContain('No active steps');
    });

    it('skips inactive steps and renumbers the remaining ones', async () => {
      const steps = makeSteps(3).map((s, i) => (i === 1 ? { ...s, active: false } : s));

      await renderTour();
      await start(steps);

      expect(screen.getByText('1/2')).toBeTruthy();
      await act(async () => api.nextStep());
      await flush();
      expect(screen.getByText('Title 3')).toBeTruthy();
      expect(screen.getByText('2/2')).toBeTruthy();
    });

    it('warns when starting a tour while one is already running', async () => {
      await renderTour();
      await start(makeSteps(2));
      await start(makeSteps(2));

      expect(warnings()).toContain('while a tour was already running');
    });
  });
});
