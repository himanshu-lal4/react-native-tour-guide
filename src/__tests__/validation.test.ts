import type { TourStep, ResolvedTourGuideConfig as TourGuideConfig } from '../types';

/**
 * These cover the mistakes that otherwise fail *silently* — the tour renders
 * nothing, or a bare centered tooltip, with no clue why.
 */
describe('validateTour', () => {
  let validateTour: typeof import('../validation').validateTour;
  let warnSpy: jest.SpyInstance;

  const messages = () => warnSpy.mock.calls.map((c) => String(c[0])).join('\n');

  beforeEach(() => {
    jest.resetModules();
    ({ validateTour } = require('../validation'));
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => warnSpy.mockRestore());

  const validStep = (over: Partial<TourStep> = {}): TourStep => ({
    id: 'step-1',
    title: 'Title',
    description: 'Description',
    ...over,
  });

  describe('valid input', () => {
    it('says nothing for a well-formed tour', () => {
      validateTour([validStep(), validStep({ id: 'step-2' })]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('says nothing for a well-formed config', () => {
      const config: TourGuideConfig = {
        tourId: 'onboarding',
        scrollRef: { current: null },
        getCurrentScrollOffset: () => 0,
        renderTooltip: () => null,
        animationDuration: 300,
        tooltipWidth: 320,
      };
      validateTour([validStep()], config);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('steps array', () => {
    it('warns when steps is not an array', () => {
      validateTour('nope' as unknown as TourStep[]);
      expect(messages()).toContain('instead of an array');
    });

    it('warns when steps is empty', () => {
      validateTour([]);
      expect(messages()).toContain('empty steps array');
    });

    it('warns on a duplicate step id', () => {
      validateTour([validStep(), validStep()]);
      expect(messages()).toContain('reuses the id "step-1"');
    });

    it('warns on a missing id', () => {
      validateTour([{ title: 'T', description: 'D' } as TourStep]);
      expect(messages()).toContain('has no "id"');
    });

    it('warns on an empty title', () => {
      validateTour([validStep({ title: '' })]);
      expect(messages()).toContain('has no "title"');
    });

    it('warns on an empty description', () => {
      validateTour([validStep({ description: '' })]);
      expect(messages()).toContain('has no "description"');
    });
  });

  describe('targetRef', () => {
    it('accepts a ref object', () => {
      validateTour([validStep({ targetRef: { current: null } })]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('warns when given a component instead of a ref', () => {
      validateTour([validStep({ targetRef: (() => null) as never })]);
      expect(messages()).toContain('not a ref object');
    });

    it('warns when given a number', () => {
      validateTour([validStep({ targetRef: 42 as never })]);
      expect(messages()).toContain('not a ref object');
    });

    it('does not warn when targetRef is omitted (centered step)', () => {
      validateTour([validStep()]);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('step options', () => {
    it('warns on an invalid tooltipPosition', () => {
      validateTour([validStep({ tooltipPosition: 'center' as never })]);
      expect(messages()).toContain('tooltipPosition "center"');
    });

    it.each(['top', 'bottom', 'left', 'right', 'auto'] as const)(
      'accepts tooltipPosition %s',
      (pos) => {
        validateTour([validStep({ tooltipPosition: pos })]);
        expect(warnSpy).not.toHaveBeenCalled();
      }
    );

    it('warns on negative spotlightPadding', () => {
      validateTour([validStep({ spotlightPadding: -4 })]);
      expect(messages()).toContain('negative spotlightPadding');
    });

    it('warns on an unreadably short autoAdvance', () => {
      validateTour([validStep({ autoAdvance: 100 })]);
      expect(messages()).toContain('too fast to read');
    });

    it('accepts autoAdvance of 0 (disabled)', () => {
      validateTour([validStep({ autoAdvance: 0 })]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('warns when a step hides every way to continue', () => {
      validateTour([validStep({ hideNextButton: true, hideSkipButton: true })]);
      expect(messages()).toContain('no way to continue');
    });

    it('does not warn when both buttons are hidden but autoAdvance is set', () => {
      validateTour([validStep({ hideNextButton: true, hideSkipButton: true, autoAdvance: 3000 })]);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('per-step scroll config', () => {
    it('warns when scrollRef is not a ref', () => {
      validateTour([validStep({ scrollToTarget: { scrollRef: 'nope' as never } })]);
      expect(messages()).toContain('scrollToTarget.scrollRef that is not a ref object');
    });

    it('warns when getCurrentScrollOffset is a value, not a getter', () => {
      validateTour([
        validStep({
          scrollToTarget: { scrollRef: { current: null }, getCurrentScrollOffset: 0 as never },
        }),
      ]);
      expect(messages()).toContain('getCurrentScrollOffset that is not a function');
    });
  });

  describe('config', () => {
    it('warns when config.scrollRef is not a ref', () => {
      validateTour([validStep()], { scrollRef: 'nope' as never });
      expect(messages()).toContain('config.scrollRef is not a ref object');
    });

    it('does not warn when scrollRef is given without getCurrentScrollOffset (auto-derived via measureLayout)', () => {
      validateTour([validStep()], { scrollRef: { current: null } });
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('warns when renderTooltip is not a function', () => {
      validateTour([validStep()], { renderTooltip: {} as never });
      expect(messages()).toContain('config.renderTooltip is not a function');
    });

    it('warns on a negative animationDuration', () => {
      validateTour([validStep()], { animationDuration: -1 });
      expect(messages()).toContain('animationDuration is negative');
    });

    it('warns on a non-positive tooltipWidth', () => {
      validateTour([validStep()], { tooltipWidth: 0 });
      expect(messages()).toContain('tooltipWidth must be greater than 0');
    });
  });

  describe('production builds', () => {
    it('validates nothing when __DEV__ is false', () => {
      const original = (globalThis as { __DEV__?: boolean }).__DEV__;
      (globalThis as { __DEV__?: boolean }).__DEV__ = false;
      validateTour([]);
      expect(warnSpy).not.toHaveBeenCalled();
      (globalThis as { __DEV__?: boolean }).__DEV__ = original;
    });
  });
});
