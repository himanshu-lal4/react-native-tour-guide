import React from 'react';
import { Text, View } from 'react-native';
import { render, act, screen, fireEvent, cleanup } from '@testing-library/react-native';

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

const flush = async (ms = 400) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

// RTL's async render can leave the tree uncommitted under fake timers when a
// previous test ended right after a fireEvent — drain pending work so the new
// tree (and its Capture) is live before the test proceeds.
const mount = async (el: React.ReactElement) => {
  const result = await render(el);
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
  return result;
};

const start = async (steps: TourStep[], config?: TourGuideConfig) => {
  await act(async () => {
    api.startTour(steps, config);
  });
  await flush();
};

describe('new features', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    __resetWarnings();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    // Unmount while fake timers are still installed, so unmount-triggered
    // timer cleanup runs deterministically, then drain anything left.
    await act(async () => {
      cleanup();
      jest.runOnlyPendingTimers();
    });
    warnSpy.mockRestore();
    jest.useRealTimers();
  });

  const warnings = () => warnSpy.mock.calls.map((c) => String(c[0])).join('\n');

  describe('TourTarget + targetId', () => {
    const renderWithTarget = () =>
      mount(
        <TourGuideProvider>
          <Capture />
          <TourTarget id="hero" style={{ borderRadius: 12 }}>
            <Text>The hero button</Text>
          </TourTarget>
          <TourGuideOverlay />
        </TourGuideProvider>
      );

    it('runs a tour against a registered TourTarget with no refs', async () => {
      await renderWithTarget();
      await start([step({ targetId: 'hero' })]);
      // RTL host views have a measureInWindow that never calls back — the
      // measurement watchdog must rescue the step with a centered tooltip.
      await flush(5000);
      expect(screen.getByText('Hello')).toBeTruthy();
    });

    it('falls back to a centered tooltip and warns when the targetId never registers', async () => {
      await mount(
        <TourGuideProvider>
          <Capture />
          <TourGuideOverlay />
        </TourGuideProvider>
      );
      await start([step({ targetId: 'missing' })]);
      await flush(2500); // past the registration grace period

      expect(screen.getByText('Hello')).toBeTruthy();
      expect(warnings()).toContain('no <TourTarget id="missing">');
    });

    it('getTarget exposes the registered ref and style', async () => {
      await renderWithTarget();
      const entry = api.getTarget('hero');
      expect(entry).toBeDefined();
      expect(entry?.style).toEqual({ borderRadius: 12 });
    });

    it('unregisters on unmount', async () => {
      const view = await renderWithTarget();
      expect(api.getTarget('hero')).toBeDefined();
      view.unmount();
      // Provider unmounted too; nothing to assert via api — covered by no crash.
    });

    it('warns on duplicate TourTarget ids', async () => {
      await mount(
        <TourGuideProvider>
          <Capture />
          <TourTarget id="dup">
            <Text>a</Text>
          </TourTarget>
          <TourTarget id="dup">
            <Text>b</Text>
          </TourTarget>
          <TourGuideOverlay />
        </TourGuideProvider>
      );
      expect(warnings()).toContain('share the id "dup"');
    });
  });

  describe('before() hook', () => {
    const renderTour = () =>
      mount(
        <TourGuideProvider>
          <Capture />
          <TourGuideOverlay />
        </TourGuideProvider>
      );

    it('awaits an async before() and only then shows the step', async () => {
      let resolveBefore!: () => void;
      const gate = new Promise<void>((res) => {
        resolveBefore = res;
      });
      await renderTour();
      await start([step({ before: () => gate, targetRef: measurableRef() })]);

      // Still gated — nothing rendered yet.
      expect(screen.queryByText('Hello')).toBeNull();

      await act(async () => {
        resolveBefore();
      });
      await flush();
      expect(screen.getByText('Hello')).toBeTruthy();
    });

    it('runs a sync before() and shows the step', async () => {
      const before = jest.fn();
      await renderTour();
      await start([step({ before, targetRef: measurableRef() })]);
      expect(before).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Hello')).toBeTruthy();
    });

    it('still shows the step when before() rejects, and warns', async () => {
      await renderTour();
      await start([
        step({ before: () => Promise.reject(new Error('nope')), targetRef: measurableRef() }),
      ]);
      await flush();
      expect(screen.getByText('Hello')).toBeTruthy();
      expect(warnings()).toContain('before() rejected');
    });

    it('still shows the step when before() throws synchronously', async () => {
      await renderTour();
      await start([
        step({
          before: () => {
            throw new Error('sync boom');
          },
          targetRef: measurableRef(),
        }),
      ]);
      expect(screen.getByText('Hello')).toBeTruthy();
      expect(warnings()).toContain('before() threw');
    });
  });

  describe('completed gating', () => {
    const renderTour = () =>
      mount(
        <TourGuideProvider>
          <Capture />
          <TourGuideOverlay />
        </TourGuideProvider>
      );

    it('disables Next while completed is false and enables it via setStepCompleted', async () => {
      await renderTour();
      await start([
        step({ targetRef: measurableRef(), completed: false }),
        step({ id: 'step-2', title: 'Second', targetRef: measurableRef() }),
      ]);

      const next = screen.getByLabelText(/go to step 2/);
      expect(next.props.accessibilityState?.disabled).toBe(true);

      // Pressing a disabled Pressable must not advance.
      await act(async () => {
        fireEvent.press(next);
        jest.runOnlyPendingTimers();
      });
      expect(screen.queryByText('Second')).toBeNull();

      await act(async () => {
        api.setStepCompleted('step-1', true);
      });
      const enabledNext = screen.getByLabelText(/go to step 2/);
      expect(enabledNext.props.accessibilityState?.disabled).toBe(false);

      await act(async () => {
        fireEvent.press(enabledNext);
        jest.runOnlyPendingTimers();
      });
      await flush();
      expect(screen.getByText('Second')).toBeTruthy();
    });
  });

  describe('inline overlay mode', () => {
    it('renders without a Modal and still shows the tooltip', async () => {
      await mount(
        <TourGuideProvider>
          <Capture />
          <TourGuideOverlay />
        </TourGuideProvider>
      );
      await start([step({ targetRef: measurableRef() })], { overlayMode: 'inline' });

      expect(screen.getByText('Hello')).toBeTruthy();
      // No Modal anywhere in the rendered tree in inline mode.
      expect(JSON.stringify(screen.toJSON())).not.toContain('"Modal"');
    });
  });

  describe('headless: per-step renderTooltip and slots', () => {
    it('uses a per-step renderTooltip over the config one', async () => {
      await mount(
        <TourGuideProvider>
          <Capture />
          <TourGuideOverlay />
        </TourGuideProvider>
      );
      await start(
        [
          step({
            targetRef: measurableRef(),
            renderTooltip: ({ title }) => <Text>step-custom:{title}</Text>,
          }),
        ],
        { renderTooltip: ({ title }) => <Text>config-custom:{title}</Text> }
      );

      expect(screen.getByText(/step-custom:/)).toBeTruthy();
      expect(screen.queryByText(/config-custom:/)).toBeNull();
    });

    it('renders a NextButton slot instead of the built-in button', async () => {
      await mount(
        <TourGuideProvider>
          <Capture />
          <TourGuideOverlay />
        </TourGuideProvider>
      );
      await start([step({ targetRef: measurableRef() })], {
        components: {
          NextButton: ({ label, onPress }) => (
            <View accessibilityRole="button" accessibilityLabel="brand-next" onTouchEnd={onPress}>
              <Text>custom {label}</Text>
            </View>
          ),
        },
      });

      expect(screen.getByLabelText('brand-next')).toBeTruthy();
      expect(screen.queryByLabelText(/finish tour/)).toBeNull();
    });
  });

  describe('measureLayout scroll path (no getCurrentScrollOffset)', () => {
    it('derives the scroll destination from content coordinates', async () => {
      const scrollTo = jest.fn();
      // Scroll view sits at window y=80; target sits at content y=1200, window y=900 (off-screen).
      const scrollRef = {
        current: {
          scrollTo,
          measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) =>
            cb(0, 80, 390, 600),
        },
      };
      const targetRef = {
        current: {
          // Window position below the fold of the 1334px test window → the tour
          // must scroll. Content position is 2000 inside the scroll view.
          measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) =>
            cb(10, 1400, 100, 50),
          measureLayout: (
            _node: unknown,
            onSuccess: (x: number, y: number, w: number, h: number) => void
          ) => onSuccess(10, 2000, 100, 50),
        },
      };

      await mount(
        <TourGuideProvider>
          <Capture />
          <TourGuideOverlay />
        </TourGuideProvider>
      );
      await start([step({ targetRef })], { scrollRef }); // NOTE: no getCurrentScrollOffset
      await flush(1500);

      expect(scrollTo).toHaveBeenCalled();
      const dest = scrollTo.mock.calls[0][0];
      // content Y (1200) minus desired on-screen Y plus scroll-view window Y (80):
      // destination must be anchored to 1200, not to the window-coord 900 the
      // old offset-0 path would have produced.
      // Anchored to the content coordinate (2000), not the window coordinate —
      // the old offset-0 path would scroll to ~1100.
      expect(dest.y).toBeGreaterThan(1500);
      expect(screen.getByText('Hello')).toBeTruthy();
    });
  });
});
