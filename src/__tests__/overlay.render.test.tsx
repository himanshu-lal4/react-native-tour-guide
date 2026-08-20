import { AccessibilityInfo, Text } from 'react-native';
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

/** Provider + one overlay, the documented setup. */
const renderTour = (overlays = 1) =>
  render(
    <TourGuideProvider>
      <Capture />
      {Array.from({ length: overlays }).map((_, i) => (
        <TourGuideOverlay key={i} />
      ))}
    </TourGuideProvider>
  );

/** Provider with no overlay — the most common integration mistake. */
const renderWithoutOverlay = () =>
  render(
    <TourGuideProvider>
      <Capture />
    </TourGuideProvider>
  );

/** A ref that measures like a mounted View. */
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

const start = async (steps: TourStep[], config?: TourGuideConfig) => {
  await act(async () => {
    api.startTour(steps, config);
  });
  await act(async () => {
    jest.advanceTimersByTime(400);
  });
};

const flush = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

describe('TourGuideOverlay rendering', () => {
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

  describe('happy path', () => {
    it('shows the tooltip for a measurable target', async () => {
      await renderTour();
      await start([step({ targetRef: measurableRef() })]);

      expect(screen.getByText('Hello')).toBeTruthy();
      expect(screen.getByText('World')).toBeTruthy();
    });

    it('shows a step counter across multiple steps and advances', async () => {
      await renderTour();
      await start([
        step({ id: 'a', title: 'First', targetRef: measurableRef() }),
        step({ id: 'b', title: 'Second', targetRef: measurableRef() }),
      ]);

      expect(screen.getByText('1/2')).toBeTruthy();

      await act(async () => api.nextStep());
      await flush(400);

      expect(screen.getByText('Second')).toBeTruthy();
      expect(screen.getByText('2/2')).toBeTruthy();
    });

    it('uses a custom renderTooltip when provided', async () => {
      await renderTour();
      await start([step({ targetRef: measurableRef() })], {
        renderTooltip: ({ title }) => <Text>custom:{title}</Text>,
      });

      expect(screen.getByText(/custom:/)).toBeTruthy();
    });
  });

  describe('targets that cannot be measured', () => {
    // Regression: these used to leave the user behind an opaque backdrop with no
    // tooltip and — with the default backdropBehavior of 'none' — no way out.
    it('falls back to a centered tooltip when the ref exposes no measure API', async () => {
      await renderTour();
      await start([step({ id: 'unmeasurable', targetRef: { current: { notAView: true } } })]);

      expect(screen.getByText('Hello')).toBeTruthy();
      expect(warnings()).toContain('cannot be measured');
    });

    it('falls back to a centered tooltip when the target measures 0x0', async () => {
      const zeroRef = {
        current: {
          measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) =>
            cb(0, 0, 0, 0),
        },
      };
      await renderTour();
      await start([step({ id: 'zero', targetRef: zeroRef })]);
      await flush(1000);

      expect(screen.getByText('Hello')).toBeTruthy();
      expect(warnings()).toContain('measured as 0x0');
    });

    it('falls back to a centered tooltip when targetRef.current is null', async () => {
      await renderTour();
      await start([step({ id: 'null-ref', targetRef: { current: null } })]);

      expect(screen.getByText('Hello')).toBeTruthy();
    });

    it('supports a ref that only implements measure()', async () => {
      const measureOnlyRef = {
        current: {
          measure: (
            cb: (x: number, y: number, w: number, h: number, px: number, py: number) => void
          ) => cb(0, 0, 100, 50, 30, 60),
        },
      };
      await renderTour();
      await start([step({ id: 'measure-only', targetRef: measureOnlyRef })]);

      expect(screen.getByText('Hello')).toBeTruthy();
      expect(warnings()).not.toContain('cannot be measured');
    });

    it('shows a centered tooltip for a step with no targetRef at all', async () => {
      await renderTour();
      await start([step({ id: 'centered' })]);

      expect(screen.getByText('Hello')).toBeTruthy();
    });
  });

  describe('centered steps keep their behaviour', () => {
    // Both of these were gated on targetLayout, which is null for centered
    // steps — so they silently never ran.
    it('auto-advances a centered step', async () => {
      const onStepChange = jest.fn();
      await renderTour();
      await start(
        [step({ id: 'a', title: 'First', autoAdvance: 1000 }), step({ id: 'b', title: 'Second' })],
        { onStepChange }
      );

      await flush(1500);
      // The next step schedules its own measurement timer from an effect that
      // runs after the first timer loop, so let that one run too.
      await flush(400);

      expect(onStepChange).toHaveBeenCalledWith(0, 1);
      expect(screen.getByText('Second')).toBeTruthy();
    });

    it('announces a centered step to screen readers', async () => {
      const announce = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});

      await renderTour();
      await start([step({ id: 'centered-a11y' })]);
      await flush(300);

      expect(announce).toHaveBeenCalledWith(expect.stringContaining('Hello'));
      announce.mockRestore();
    });
  });

  describe('auto-scroll across scrollable types', () => {
    const farTarget = measurableRef(10, 5000, 100, 50);

    it('scrolls a FlatList via scrollToOffset', async () => {
      const scrollToOffset = jest.fn();
      await renderTour();
      await start([step({ id: 'far', targetRef: farTarget })], {
        scrollRef: { current: { scrollToOffset } },
        getCurrentScrollOffset: () => 0,
      });
      await flush(1000);

      expect(scrollToOffset).toHaveBeenCalled();
      expect(screen.getByText('Hello')).toBeTruthy();
    });

    it('scrolls a ScrollView via scrollTo', async () => {
      const scrollTo = jest.fn();
      await renderTour();
      await start([step({ id: 'far', targetRef: farTarget })], {
        scrollRef: { current: { scrollTo } },
        getCurrentScrollOffset: () => 0,
      });
      await flush(1000);

      expect(scrollTo).toHaveBeenCalled();
      expect(screen.getByText('Hello')).toBeTruthy();
    });

    it('still shows the step when the scrollRef cannot scroll', async () => {
      await renderTour();
      await start([step({ id: 'far', targetRef: farTarget })], {
        // A ref attached to a wrapper View rather than the list.
        scrollRef: { current: { measureInWindow: jest.fn() } },
        getCurrentScrollOffset: () => 0,
      });
      await flush(1000);

      expect(screen.getByText('Hello')).toBeTruthy();
      expect(warnings()).toContain('no usable scroll method');
    });
  });

  describe('integration diagnostics', () => {
    it('warns when a tour starts with no overlay mounted', async () => {
      await renderWithoutOverlay();
      await act(async () => {
        api.startTour([step()]);
      });
      await flush(1500);

      expect(warnings()).toContain('no <TourGuideOverlay /> is mounted');
    });

    it('warns when more than one overlay is mounted', async () => {
      await renderTour(2);
      expect(warnings()).toContain('are mounted at once');
    });

    it('does not warn about the overlay in the documented setup', async () => {
      await renderTour();
      await start([step({ targetRef: measurableRef() })]);
      await flush(1500);

      expect(warnings()).not.toContain('no <TourGuideOverlay /> is mounted');
      expect(warnings()).not.toContain('are mounted at once');
    });
  });
});
