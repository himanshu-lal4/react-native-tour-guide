import React from 'react';
import { InteractionManager, StatusBar } from 'react-native';
import { render, act, screen, cleanup } from '@testing-library/react-native';

import { TourGuideProvider, useTourGuide } from '../TourGuideContext';
import TourGuideOverlay from '../TourGuideOverlay';
import { createTourEvents } from '../events';
import { __resetWarnings } from '../dev';
import { osValue } from '../utils';
import { shapeInnerPath, computeShape } from '../shapes';
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

describe('integrations', () => {
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

  describe('event emitter', () => {
    it('emits start, stepChange, and end(completed) over a full run', async () => {
      const seen: string[] = [];
      await renderTour();
      api.events.on('start', (p) => seen.push(`start:${p.totalSteps}`));
      api.events.on('stepChange', (p) => seen.push(`step:${p.from}->${p.to}`));
      api.events.on('end', (p) => seen.push(`end:${p.completed}`));

      await start(
        [
          step({ id: 'a', title: 'First', targetRef: measurableRef() }),
          step({ id: 'b', title: 'Second', targetRef: measurableRef() }),
        ],
        { tourId: 'demo' }
      );
      await act(async () => api.nextStep());
      await flush();
      await act(async () => api.nextStep());
      await flush();

      expect(seen).toStrictEqual(['start:2', 'step:0->1', 'end:true']);
    });

    it('emits skip and end(false) when the user skips', async () => {
      const seen: string[] = [];
      await renderTour();
      api.events.on('skip', (p) => seen.push(`skip:${p.at}`));
      api.events.on('end', (p) => seen.push(`end:${p.completed}`));

      await start([step({ targetRef: measurableRef() })]);
      await act(async () => api.skipTour());

      expect(seen).toStrictEqual(['skip:0', 'end:false']);
    });

    it('unsubscribe stops delivery, and a throwing handler is isolated', async () => {
      const events = createTourEvents();
      const good = jest.fn();
      const bad = jest.fn(() => {
        throw new Error('analytics down');
      });
      const off = events.on('start', bad);
      events.on('start', good);

      expect(() => events.emit('start', { totalSteps: 1 })).not.toThrow();
      expect(good).toHaveBeenCalledTimes(1);

      off();
      events.emit('start', { totalSteps: 2 });
      expect(bad).toHaveBeenCalledTimes(1); // no longer called
      expect(good).toHaveBeenCalledTimes(2);
    });
  });

  describe('followTarget', () => {
    it('re-measures and snaps the layout when a scroll is reported', async () => {
      // A target whose measured position changes as the "user scrolls".
      let currentY = 200;
      const movingRef = {
        current: {
          measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) =>
            cb(10, currentY, 100, 50),
        },
      };

      await renderTour();
      await start([step({ targetRef: movingRef })], { followTarget: true });
      expect(api.targetLayout?.y).toBe(200);

      currentY = 120; // content scrolled up by 80
      await act(async () => {
        api.__reportScroll?.(80);
        jest.advanceTimersByTime(50); // rAF fallback tick
      });

      // Provider state must NOT churn per scroll frame (that would re-render
      // every consumer at 60fps) — the follow position is overlay-local...
      expect(api.targetLayout?.y).toBe(200);
      // ...but the RENDERED spotlight has moved: the cutout path now starts at
      // the new y (rect inner subpath "M{x+r},{y}" with x=10, r=12 → M 22,120).
      expect(JSON.stringify(screen.toJSON())).toContain('M22,120');
      expect(screen.getByText('Hello')).toBeTruthy();
    });

    it('ignores scrolls when followTarget is off', async () => {
      let currentY = 200;
      const movingRef = {
        current: {
          measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) =>
            cb(10, currentY, 100, 50),
        },
      };
      await renderTour();
      await start([step({ targetRef: movingRef })]);

      currentY = 120;
      await act(async () => {
        api.__reportScroll?.(80);
        jest.advanceTimersByTime(50);
      });

      expect(api.targetLayout?.y).toBe(200); // unchanged
    });
  });

  describe('momentum-scroll-end settle signal', () => {
    it('commits the highlight as soon as scroll end is reported', async () => {
      const scrollTo = jest.fn();
      const scrollRef = { current: { scrollTo } };
      // Off-screen target that needs an auto-scroll (window is 1334 tall).
      const targetRef = measurableRef(10, 1400, 100, 50);

      await renderTour();
      await act(async () => {
        api.startTour([step({ targetRef })], { scrollRef, getCurrentScrollOffset: () => 0 });
      });
      // Past the initial 100ms delay + the 100ms post-scroll wait, but well
      // inside the settle polling (which would otherwise run ~1s).
      await flush(150);
      await flush(120);
      expect(scrollTo).toHaveBeenCalled();
      expect(screen.queryByText('Hello')).toBeNull(); // still hidden, polling

      await act(async () => {
        api.__reportScrollEnd?.();
      });
      await flush(50);

      expect(screen.getByText('Hello')).toBeTruthy(); // committed immediately
    });
  });

  describe('keepSpotlight', () => {
    const holeCount = (): number => {
      // The main dark path is the one with fillRule="evenodd"; each hole is an
      // additional closed subpath after the full-screen rect.
      const json = JSON.stringify(screen.toJSON()) ?? '';
      const m = json.match(/"d":"(M0,0 H[^"]+)"/);
      const d = m?.[1];
      if (!d) return -1;
      return (d.match(/M/g) ?? []).length - 1; // minus the screen rect
    };

    it('keeps the previous hole after advancing past a keepSpotlight step', async () => {
      await renderTour();
      await start(
        [
          step({
            id: 'a',
            title: 'First',
            targetRef: measurableRef(10, 20, 100, 50),
            keepSpotlight: true,
          }),
          step({ id: 'b', title: 'Second', targetRef: measurableRef(10, 300, 100, 50) }),
        ],
        // 'none': the state-committed path updates synchronously, so the test
        // can read the hole count without driving animation frames.
        { motion: 'none' }
      );
      expect(holeCount()).toBe(1);

      await act(async () => api.nextStep());
      await flush(600);

      expect(screen.getByText('Second')).toBeTruthy();
      expect(holeCount()).toBe(2); // current + kept
    });

    it('drops the kept hole when navigating back', async () => {
      await renderTour();
      await start(
        [
          step({
            id: 'a',
            title: 'First',
            targetRef: measurableRef(10, 20, 100, 50),
            keepSpotlight: true,
          }),
          step({ id: 'b', title: 'Second', targetRef: measurableRef(10, 300, 100, 50) }),
        ],
        // 'none': the state-committed path updates synchronously, so the test
        // can read the hole count without driving animation frames.
        { motion: 'none' }
      );
      await act(async () => api.nextStep());
      await flush(600);
      expect(holeCount()).toBe(2);

      await act(async () => api.prevStep());
      await flush(600);

      expect(screen.getByText('First')).toBeTruthy();
      expect(holeCount()).toBe(1); // back to just the current hole
    });
  });

  describe('per-platform values', () => {
    it('osValue picks the running OS and falls back to default', () => {
      // Jest's react-native preset reports Platform.OS === 'ios'.
      expect(osValue({ ios: 1, android: 2, default: 3 })).toBe(1);
      expect(osValue({ android: 2, default: 3 })).toBe(3);
      expect(osValue(42)).toBe(42);
      expect(osValue(undefined)).toBeUndefined();
      // Objects that are not OS-configs pass through untouched.
      expect(osValue({ top: 1 } as never)).toStrictEqual({ top: 1 });
    });

    it('startTour resolves PerPlatform config for consumers', async () => {
      await renderTour();
      await start([step({ targetRef: measurableRef() })], {
        tooltipWidth: { ios: 111, android: 222, default: 333 },
        animationDuration: { default: 50 },
      });
      expect(api.config?.tooltipWidth).toBe(111);
      expect(api.config?.animationDuration).toBe(50);
    });
  });

  describe('small integrations', () => {
    it('passes supportedOrientations to the Modal (full list by default)', async () => {
      await renderTour();
      await start([step({ targetRef: measurableRef() })]);
      const json = JSON.stringify(screen.toJSON()) ?? '';
      expect(json).toContain('"supportedOrientations"');
      expect(json).toContain('portrait-upside-down');
    });

    it('waitForInteractions defers measurement through InteractionManager', async () => {
      const spy = jest.spyOn(InteractionManager, 'runAfterInteractions');
      await renderTour();
      await start([step({ targetRef: measurableRef() })], { waitForInteractions: true });
      await flush(600);

      expect(spy).toHaveBeenCalled();
      expect(screen.getByText('Hello')).toBeTruthy();
      spy.mockRestore();
    });

    it('pushes and pops a status-bar entry while active', async () => {
      const pushed = { id: 1 };
      const pushSpy = jest
        .spyOn(StatusBar, 'pushStackEntry')

        .mockReturnValue(pushed as any);
      const popSpy = jest.spyOn(StatusBar, 'popStackEntry').mockImplementation(() => {});

      await renderTour();
      await start([step({ targetRef: measurableRef() })], { statusBarStyle: 'auto' });
      expect(pushSpy).toHaveBeenCalledWith({ barStyle: 'light-content', animated: true });

      await act(async () => api.endTour());
      expect(popSpy).toHaveBeenCalledWith(pushed);

      pushSpy.mockRestore();
      popSpy.mockRestore();
    });

    it('applies arrowStyle to the tooltip triangle', async () => {
      await renderTour();
      await start([step({ targetRef: measurableRef() })], {
        tooltipStyles: { arrowStyle: { opacity: 0.335 } },
      });
      expect(JSON.stringify(screen.toJSON())).toContain('0.335');
    });
  });

  describe('review fixes (round 2)', () => {
    it("endTour() emits 'end' so start/end always pair", async () => {
      const seen: string[] = [];
      await renderTour();
      api.events.on('start', () => seen.push('start'));
      api.events.on('end', (p) => seen.push(`end:${p.completed}`));

      await start([step({ targetRef: measurableRef() })]);
      await act(async () => api.endTour()); // programmatic close — was silent

      expect(seen).toStrictEqual(['start', 'end:false']);
    });

    it("startTour over a live tour emits the old tour's 'end' before the new 'start'", async () => {
      const seen: string[] = [];
      await renderTour();
      api.events.on('start', (p) => seen.push(`start:${p.tourId ?? '-'}`));
      api.events.on('end', (p) => seen.push(`end:${p.tourId ?? '-'}`));

      await start([step({ targetRef: measurableRef() })], { tourId: 'A' });
      await start([step({ targetRef: measurableRef() })], { tourId: 'B' });
      await act(async () => api.skipTour());

      expect(seen).toStrictEqual(['start:A', 'end:A', 'start:B', 'end:B']);
    });

    it('kept holes survive a centered (no-target) step', async () => {
      await renderTour();
      await start(
        [
          step({
            id: 'a',
            title: 'First',
            targetRef: measurableRef(10, 20, 100, 50),
            keepSpotlight: true,
          }),
          step({ id: 'b', title: 'Centered' }), // no target at all
        ],
        { motion: 'none' }
      );
      await act(async () => api.nextStep());
      await flush(600);

      expect(screen.getByText('Centered')).toBeTruthy();
      // The no-target branch must still punch the kept hole out (evenodd path
      // with the kept subpath), not paint a solid backdrop.
      // (RNSVG serializes fillRule as a numeric enum in the test tree, so we
      // assert on the path data itself: full-screen rect + a kept subpath.)
      const json = JSON.stringify(screen.toJSON()) ?? '';
      expect(json).toMatch(/"d":"M0,0 H\d+ V\d+ H0 Z M/);
    });

    it('a keepSpotlight tour cannot leak its layout into the next tour', async () => {
      await renderTour();
      // Tour A: single keepSpotlight step — nothing ever accumulates.
      await start([step({ id: 'a', targetRef: measurableRef(10, 20, 100, 50), keepSpotlight: true })], {
        motion: 'none',
      });
      await act(async () => api.endTour());

      // Tour B: step 0 centered, then advance — the reconciliation must NOT
      // resurrect tour A's rectangle as a kept hole.
      await start(
        [
          step({ id: 'b0', title: 'B-first' }),
          step({ id: 'b1', title: 'B-second', targetRef: measurableRef(10, 300, 100, 50) }),
        ],
        { motion: 'none' }
      );
      await act(async () => api.nextStep());
      await flush(600);

      expect(screen.getByText('B-second')).toBeTruthy();
      const json = JSON.stringify(screen.toJSON()) ?? '';
      const m = json.match(/"d":"(M0,0 H[^"]+)"/);
      const holes = (m?.[1]?.match(/M/g) ?? []).length - 1;
      expect(holes).toBe(1); // only B's current hole — no ghost from tour A
    });
  });

  describe('storage auto-detect', () => {
    it('falls back to memory storage with a warning when nothing is installed', async () => {
      const { detectStorage, __resetStorageCache } = require('../storage');
      __resetStorageCache();
      __resetWarnings();

      const { type, adapter } = detectStorage();
      expect(type).toBe('memory');
      expect(warnSpy.mock.calls.map((c) => String(c[0])).join('\n')).toContain(
        'neither react-native-mmkv nor'
      );

      // The memory adapter round-trips.
      adapter.setItem('k', 'v');
      expect(adapter.getItem('k')).toBe('v');
      adapter.removeItem('k');
      expect(adapter.getItem('k')).toBeNull();
    });
  });

  describe('shapeInnerPath', () => {
    it('produces a closed subpath for rect and path shapes', () => {
      const rect = computeShape({ x: 10, y: 20, width: 100, height: 50 }, 0, 8);
      const path = computeShape({ x: 0, y: 0, width: 40, height: 40 }, 0, {
        topLeft: 4,
        topRight: 20,
      });
      expect(shapeInnerPath(rect)).toMatch(/^M.*Z$/);
      expect(shapeInnerPath(path)).toContain('M');
    });
  });
});
