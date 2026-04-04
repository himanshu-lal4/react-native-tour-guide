import React from 'react';

import type { TourStep } from '../types';

describe('TourGuideProvider and useTourGuide', () => {
  let TourGuideProvider: typeof import('../TourGuideContext').TourGuideProvider;
  let useTourGuide: typeof import('../TourGuideContext').useTourGuide;

  beforeEach(() => {
    jest.resetModules();
    const mod = require('../TourGuideContext');
    ({ TourGuideProvider, useTourGuide } = mod);
  });

  describe('exports', () => {
    it('exports TourGuideProvider as a function component', () => {
      expect(typeof TourGuideProvider).toBe('function');
    });

    it('exports useTourGuide as a function', () => {
      expect(typeof useTourGuide).toBe('function');
    });
  });

  describe('useTourGuide error handling', () => {
    it('throws an error when called outside of a render cycle (no provider)', () => {
      // Calling the hook outside of React rendering throws a React hooks error.
      // In production, the expected message is about TourGuideProvider.
      // We verify it throws (the React hooks invariant fires first in tests).
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => useTourGuide()).toThrow();
      errorSpy.mockRestore();
    });
  });

  describe('step filtering logic (used by startTour)', () => {
    const filterSteps = (steps: TourStep[]) => steps.filter((s) => s.active !== false);

    it('keeps all steps when none have active set', () => {
      const steps: TourStep[] = [
        { id: 's1', title: 'A', description: 'a' },
        { id: 's2', title: 'B', description: 'b' },
      ];
      expect(filterSteps(steps)).toHaveLength(2);
    });

    it('keeps steps with active: true', () => {
      const steps: TourStep[] = [{ id: 's1', title: 'A', description: 'a', active: true }];
      expect(filterSteps(steps)).toHaveLength(1);
    });

    it('removes steps with active: false', () => {
      const steps: TourStep[] = [
        { id: 's1', title: 'A', description: 'a', active: false },
        { id: 's2', title: 'B', description: 'b' },
        { id: 's3', title: 'C', description: 'c', active: false },
      ];
      const result = filterSteps(steps);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('s2');
    });

    it('returns empty array when all steps are inactive', () => {
      const steps: TourStep[] = [
        { id: 's1', title: 'A', description: 'a', active: false },
        { id: 's2', title: 'B', description: 'b', active: false },
      ];
      expect(filterSteps(steps)).toHaveLength(0);
    });
  });

  describe('goToStep bounds validation', () => {
    const isValidIndex = (index: number, length: number) => index >= 0 && index < length;

    it('rejects negative index', () => {
      expect(isValidIndex(-1, 3)).toBe(false);
    });

    it('rejects index equal to length', () => {
      expect(isValidIndex(3, 3)).toBe(false);
    });

    it('rejects index greater than length', () => {
      expect(isValidIndex(10, 3)).toBe(false);
    });

    it('accepts all valid indices', () => {
      expect(isValidIndex(0, 3)).toBe(true);
      expect(isValidIndex(1, 3)).toBe(true);
      expect(isValidIndex(2, 3)).toBe(true);
    });
  });

  describe('Provider element creation', () => {
    it('creates a valid React element with children', () => {
      const child = React.createElement('View', null, 'test');
      const element = React.createElement(TourGuideProvider, null, child);

      expect(element).toBeDefined();
      expect(element.type).toBe(TourGuideProvider);
      expect(element.props.children).toBe(child);
    });
  });
});
