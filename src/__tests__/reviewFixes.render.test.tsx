import React from 'react';
import { render, act, screen, cleanup } from '@testing-library/react-native';

import { TourGuideProvider, useTourGuide } from '../TourGuideContext';
import TourGuideOverlay from '../TourGuideOverlay';
import { __resetWarnings } from '../dev';
import type { TourGuideConfig, TourGuideContextValue, TourStep } from '../types';

let api: TourGuideContextValue;
const Capture = () => {
  api = useTourGuide();
  return null;
};

const measurableRef = (x = 10, y = 20, w = 100, h = 50) => ({
  current: {
    measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(x, y, w, h),
  },
});

const step = (over: Partial<TourStep> = {}): TourStep => ({
  id: 'step-1',
  title: 'Hello',
  description: 'World',
  ...over,
});

const mount = async (el: React.ReactElement) => {
  const result = await render(el);
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
  return result;
};

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

const renderTour = () =>
  mount(
    <TourGuideProvider>
      <Capture />
      <TourGuideOverlay />
    </TourGuideProvider>
  );

describe('review fixes', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    __resetWarnings();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    await act(async () => {
      cleanup();
      jest.runOnlyPendingTimers();
    });
    warnSpy.mockRestore();
    jest.useRealTimers();
  });

  const warnings = () => warnSpy.mock.calls.map((c) => String(c[0])).join('\n');

  describe('throwing beforeStepChange (transition-lock deadlock)', () => {
    it('does not wedge navigation when the guard throws synchronously', async () => {
      let shouldThrow = true;
      await renderTour();
      await start(
        [
          step({ id: 'a', title: 'First', targetRef: measurableRef() }),
          step({ id: 'b', title: 'Second', targetRef: measurableRef() }),
        ],
        {
          beforeStepChange: () => {
            if (shouldThrow) throw new Error('boom');
            return true;
          },
        }
      );

      await act(async () => api.nextStep()); // throws inside → blocked, lock released
      await flush();
      expect(screen.getByText('First')).toBeTruthy();
      expect(warnings()).toContain('beforeStepChange');

      shouldThrow = false;
      await act(async () => api.nextStep()); // must still work
      await flush();
      expect(screen.getByText('Second')).toBeTruthy();
    });
  });

  describe('goToStep honours beforeStepChange', () => {
    it('blocks a jump the guard rejects and allows one it accepts', async () => {
      await renderTour();
      await start(
        [
          step({ id: 'a', title: 'First', targetRef: measurableRef() }),
          step({ id: 'b', title: 'Second', targetRef: measurableRef() }),
          step({ id: 'c', title: 'Third', targetRef: measurableRef() }),
        ],
        { beforeStepChange: (_from, to) => to !== 2 } // never allow jumping to index 2
      );

      await act(async () => api.goToStep(2));
      await flush();
      expect(screen.getByText('First')).toBeTruthy(); // blocked

      await act(async () => api.goToStep(1));
      await flush();
      expect(screen.getByText('Second')).toBeTruthy(); // allowed
    });
  });

  describe('before() runs once per step visit', () => {
    it('does not re-fire when setStepCompleted rebuilds the step', async () => {
      const before = jest.fn();
      await renderTour();
      await start([
        step({ before, completed: false, targetRef: measurableRef() }),
        step({ id: 'step-2', title: 'Second', targetRef: measurableRef() }),
      ]);
      expect(before).toHaveBeenCalledTimes(1);

      await act(async () => {
        api.setStepCompleted('step-1', true);
      });
      await flush(600); // effect re-runs for the rebuilt step object

      expect(before).toHaveBeenCalledTimes(1); // still once
    });

    it('runs again for the same step id in a NEW tour', async () => {
      const before = jest.fn();
      const steps = [step({ before, targetRef: measurableRef() })];
      await renderTour();
      await start(steps, {});
      expect(before).toHaveBeenCalledTimes(1);

      await act(async () => api.endTour());
      await start(steps, {});
      expect(before).toHaveBeenCalledTimes(2);
    });
  });

  describe('completed gate stops automatic advancement', () => {
    it('autoAdvance does not fire while completed is false, then resumes', async () => {
      await renderTour();
      await start([
        step({ completed: false, autoAdvance: 1000, targetRef: measurableRef() }),
        step({ id: 'step-2', title: 'Second', targetRef: measurableRef() }),
      ]);

      await flush(3000); // way past the timer
      expect(screen.getByText('Hello')).toBeTruthy(); // still gated

      await act(async () => {
        api.setStepCompleted('step-1', true);
      });
      await flush(1600); // effect re-armed the timer (1000ms) after the rebuild
      // The next step's measurement timer is scheduled by an effect that runs
      // after the first timer loop — give it its own window.
      await flush(400);

      expect(screen.getByText('Second')).toBeTruthy();
    });
  });

  describe('unregisterTarget identity check', () => {
    it('an unmounting duplicate cannot clobber the surviving registration', async () => {
      await renderTour();
      const refA = { current: null };
      const refB = { current: null };

      act(() => {
        api.registerTarget('dup', refA);
        api.registerTarget('dup', refB); // later one wins
        api.unregisterTarget('dup', refA); // loser unmounts
      });
      expect(api.getTarget('dup')?.ref).toBe(refB); // winner survives

      act(() => {
        api.unregisterTarget('dup', refB);
      });
      expect(api.getTarget('dup')).toBeUndefined();
    });
  });
});
