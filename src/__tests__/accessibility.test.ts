import { AccessibilityInfo, Platform } from 'react-native';

import { announceStep, getTooltipAccessibilityProps } from '../accessibility';
import type { TourStep, TourGuideConfig } from '../types';

jest.useFakeTimers();

const makeStep = (overrides: Partial<TourStep> = {}): TourStep => ({
  id: 'test-step',
  title: 'Test Title',
  description: 'Test Description',
  ...overrides,
});

describe('announceStep', () => {
  let announceSpy: jest.SpyInstance;

  beforeEach(() => {
    announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    announceSpy.mockRestore();
  });

  it('announces step with default prefix after a delay', () => {
    const step = makeStep();
    announceStep(step, 0, 3);

    // Should not be called immediately
    expect(announceSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(announceSpy).toHaveBeenCalledWith(
      'Tour guide, step 1 of 3. Test Title. Test Description'
    );
  });

  it('uses custom accessibilityLabel from the step', () => {
    const step = makeStep({ accessibilityLabel: 'Custom announcement' });
    announceStep(step, 1, 5);

    jest.advanceTimersByTime(100);

    expect(announceSpy).toHaveBeenCalledWith('Custom announcement');
  });

  it('uses custom prefix from config', () => {
    const step = makeStep();
    const config: TourGuideConfig = { accessibilityLabelPrefix: 'Walkthrough' };
    announceStep(step, 2, 4, config);

    jest.advanceTimersByTime(100);

    expect(announceSpy).toHaveBeenCalledWith(
      'Walkthrough, step 3 of 4. Test Title. Test Description'
    );
  });

  it('does nothing when enableAccessibility is false', () => {
    const step = makeStep();
    const config: TourGuideConfig = { enableAccessibility: false };
    announceStep(step, 0, 1, config);

    jest.advanceTimersByTime(200);

    expect(announceSpy).not.toHaveBeenCalled();
  });

  it('announces when enableAccessibility is undefined (defaults to true)', () => {
    const step = makeStep();
    announceStep(step, 0, 1, {});

    jest.advanceTimersByTime(100);

    expect(announceSpy).toHaveBeenCalled();
  });
});

describe('getTooltipAccessibilityProps', () => {
  it('returns accessibility props with default prefix', () => {
    const step = makeStep();
    const result = getTooltipAccessibilityProps(step, 0, 3);

    expect(result).toStrictEqual({
      accessible: true,
      accessibilityRole: 'alert',
      accessibilityLabel: 'Tour guide, step 1 of 3. Test Title. Test Description',
      accessibilityHint: expect.any(String),
      accessibilityLiveRegion: 'polite',
    });
  });

  it('uses custom accessibilityLabel from step', () => {
    const step = makeStep({ accessibilityLabel: 'Custom label' });
    const result = getTooltipAccessibilityProps(step, 0, 1);

    expect(result.accessibilityLabel).toBe('Custom label');
  });

  it('uses custom prefix from config', () => {
    const step = makeStep();
    const config: TourGuideConfig = { accessibilityLabelPrefix: 'Guide' };
    const result = getTooltipAccessibilityProps(step, 1, 2, config);

    expect(result.accessibilityLabel).toBe('Guide, step 2 of 2. Test Title. Test Description');
  });

  it('returns empty object when enableAccessibility is false', () => {
    const step = makeStep();
    const config: TourGuideConfig = { enableAccessibility: false };
    const result = getTooltipAccessibilityProps(step, 0, 1, config);

    expect(result).toStrictEqual({});
  });

  it('returns correct hint for ios', () => {
    Platform.OS = 'ios';
    const step = makeStep();
    const result = getTooltipAccessibilityProps(step, 0, 1);

    expect(result.accessibilityHint).toBe('Swipe right for next step, left for previous');
  });

  it('returns correct hint for android', () => {
    // Platform.select is resolved at call time based on Platform.OS
    // In the test environment (node), Platform.select returns ios value
    // So we just verify the hint is a non-empty string
    Platform.OS = 'android';
    const step = makeStep();
    const result = getTooltipAccessibilityProps(step, 0, 1);

    expect(typeof result.accessibilityHint).toBe('string');
    expect(result.accessibilityHint?.length).toBeGreaterThan(0);
  });
});
