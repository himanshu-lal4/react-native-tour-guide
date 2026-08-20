import React from 'react';
import { Text } from 'react-native';
import { render, act, screen, cleanup } from '@testing-library/react-native';

import { TourGuideProvider, useTourGuide } from '../TourGuideContext';
import TourGuideOverlay from '../TourGuideOverlay';
import { TourTarget } from '../TourTarget';
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

const start = async (steps: TourStep[] | string, config?: TourGuideConfig) => {
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

describe('advanced features', () => {
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

  describe('targetRegion (ref-free highlight)', () => {
    it('shows the step against a fixed region without any measurement', async () => {
      await renderTour();
      await start([step({ targetRegion: { x: 40, y: 100, width: 200, height: 120 } })]);

      expect(screen.getByText('Hello')).toBeTruthy();
      // The region was committed as the target layout verbatim.
      expect(api.targetLayout).toStrictEqual({ x: 40, y: 100, width: 200, height: 120 });
    });

    it('wins over targetRef and warns about the conflict', async () => {
      await renderTour();
      await start([
        step({
          targetRegion: { x: 1, y: 2, width: 30, height: 40 },
          targetRef: measurableRef(),
        }),
      ]);

      expect(api.targetLayout).toStrictEqual({ x: 1, y: 2, width: 30, height: 40 });
      expect(warnings()).toContain('targetRegion wins');
    });

    it('rejects a nonsensical region in dev validation', async () => {
      await renderTour();
      await start([step({ targetRegion: { x: 0, y: 0, width: 0, height: -5 } })]);
      expect(warnings()).toContain('invalid targetRegion');
    });
  });

  describe('defineTour / startTour(id) / canStartTour', () => {
    it('starts a registered tour by id', async () => {
      await renderTour();
      await act(async () => {
        api.defineTour('onboarding', [step({ targetRef: measurableRef() })], {
          doneButtonText: 'Onwards', // single-step tour shows the Done label
        });
      });
      await start('onboarding');

      expect(screen.getByText('Hello')).toBeTruthy();
      expect(screen.getByText('Onwards')).toBeTruthy();
    });

    it('merges a config override over the stored config', async () => {
      await renderTour();
      await act(async () => {
        api.defineTour('t', [step({ targetRef: measurableRef() })], {
          doneButtonText: 'Stored',
          skipButtonText: 'StoredSkip',
        });
      });
      await start('t', { doneButtonText: 'Overridden' });

      expect(screen.getByText('Overridden')).toBeTruthy(); // override wins
      expect(screen.getByText('StoredSkip')).toBeTruthy(); // stored survives
    });

    it('warns and does nothing for an unknown tour id', async () => {
      await renderTour();
      await start('nope');
      expect(api.isActive).toBe(false);
      expect(warnings()).toContain('no tour with that id was registered');
    });

    it('canStartTour reflects TourTarget registration', async () => {
      await mount(
        <TourGuideProvider>
          <Capture />
          <TourTarget id="present">
            <Text>x</Text>
          </TourTarget>
          <TourGuideOverlay />
        </TourGuideProvider>
      );

      expect(api.canStartTour([step({ targetId: 'present' })])).toBe(true);
      expect(api.canStartTour([step({ targetId: 'absent' })])).toBe(false);
      // Steps without targetId are always ready.
      expect(api.canStartTour([step()])).toBe(true);
      expect(api.canStartTour([step({ targetRegion: { x: 0, y: 0, width: 1, height: 1 } })])).toBe(
        true
      );
      // Unknown defined-tour id → not startable.
      expect(api.canStartTour('unknown')).toBe(false);
    });

    it('removeTour unregisters a defined tour', async () => {
      await renderTour();
      await act(async () => {
        api.defineTour('gone', [step()]);
      });
      expect(api.canStartTour('gone')).toBe(true);
      await act(async () => {
        api.removeTour('gone');
      });
      expect(api.canStartTour('gone')).toBe(false);
    });
  });

  describe('motion presets', () => {
    it.each(['morph', 'bounce', 'fade', 'none'] as const)(
      'runs a two-step tour with motion %s',
      async (motion) => {
        await renderTour();
        await start(
          [
            step({ id: 'a', title: 'First', targetRef: measurableRef(10, 20, 100, 50) }),
            step({ id: 'b', title: 'Second', targetRef: measurableRef(10, 300, 100, 50) }),
          ],
          { motion }
        );
        expect(screen.getByText('First')).toBeTruthy();

        await act(async () => api.nextStep());
        await flush(1000); // covers fade dip + morph/bounce settling

        expect(screen.getByText('Second')).toBeTruthy();
        expect(warnings()).not.toContain('motion');
      }
    );

    it('flags an invalid motion in dev validation', async () => {
      await renderTour();
      await start([step({ targetRef: measurableRef() })], {
        motion: 'teleport' as never,
      });
      expect(warnings()).toContain('"teleport" is not valid');
    });
  });

  describe('custom maskPath', () => {
    it('invokes the mask function with target and bounds and still shows the step', async () => {
      const maskPath = jest.fn(
        ({ bounds }: { bounds: { x: number; y: number; width: number; height: number } }) =>
          `M${bounds.x},${bounds.y} h${bounds.width} v${bounds.height} h-${bounds.width} Z`
      );
      await renderTour();
      await start([step({ targetRef: measurableRef(10, 20, 100, 50), spotlightPadding: 4 })], {
        spotlightStyles: { maskPath },
      });

      expect(screen.getByText('Hello')).toBeTruthy();
      expect(maskPath).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ width: 100, height: 50 }),
          bounds: expect.objectContaining({ x: 6, y: 16, width: 108, height: 58 }),
          screenWidth: expect.any(Number),
          screenHeight: expect.any(Number),
        })
      );
    });

    it('falls back to the automatic shape when maskPath throws', async () => {
      await renderTour();
      await start([step({ targetRef: measurableRef() })], {
        spotlightStyles: {
          maskPath: () => {
            throw new Error('bad path');
          },
        },
      });
      // Tour still renders — the throwing mask must not take it down.
      expect(screen.getByText('Hello')).toBeTruthy();
    });
  });
});
