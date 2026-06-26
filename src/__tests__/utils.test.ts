import { computeTooltipPosition, validateRef, extractBorderRadius } from '../utils';

describe('computeTooltipPosition', () => {
  const screenWidth = 400;
  const screenHeight = 800;
  const tooltipWidth = 320;
  const tooltipHeight = 150;
  const offset = 20;

  it('returns "bottom" when there is enough space below the target', () => {
    const result = computeTooltipPosition({
      target: { x: 50, y: 100, width: 100, height: 50 },
      screenWidth,
      screenHeight,
      tooltipWidth,
      tooltipHeight,
      offset,
    });
    expect(result).toBe('bottom');
  });

  it('returns "top" when target is near the bottom and no space below', () => {
    const result = computeTooltipPosition({
      target: { x: 50, y: 650, width: 100, height: 50 },
      screenWidth,
      screenHeight,
      tooltipWidth,
      tooltipHeight,
      offset,
    });
    expect(result).toBe('top');
  });

  it('returns "right" when target is at top-left corner with no vertical space', () => {
    // Target fills most of vertical space, but there is space to the right
    const result = computeTooltipPosition({
      target: { x: 0, y: 100, width: 50, height: 600 },
      screenWidth,
      screenHeight,
      tooltipWidth,
      tooltipHeight,
      offset,
    });
    // spaceBelow = 800 - (100 + 600 + 20) = 80 < 150
    // spaceAbove = 100 - 20 = 80 < 150
    // spaceRight = 400 - (0 + 50 + 20) = 330 >= 320 * 0.6 = 192
    expect(result).toBe('right');
  });

  it('returns "left" when target is at right edge with no vertical/right space', () => {
    const result = computeTooltipPosition({
      target: { x: 350, y: 100, width: 50, height: 600 },
      screenWidth,
      screenHeight,
      tooltipWidth,
      tooltipHeight,
      offset,
    });
    // spaceBelow = 800 - (100 + 600 + 20) = 80 < 150
    // spaceAbove = 100 - 20 = 80 < 150
    // spaceRight = 400 - (350 + 50 + 20) = -20 < 192
    // spaceLeft = 350 - 20 = 330 >= 192
    expect(result).toBe('left');
  });

  it('falls back to "bottom" when spaceBelow >= spaceAbove and nothing fits', () => {
    // Tiny screen, target in upper half
    const result = computeTooltipPosition({
      target: { x: 0, y: 10, width: 10, height: 10 },
      screenWidth: 20,
      screenHeight: 50,
      tooltipWidth: 320,
      tooltipHeight: 150,
      offset: 20,
    });
    // spaceBelow = 50 - (10 + 10 + 20) = 10 < 150
    // spaceAbove = 10 - 20 = -10 < 150
    // spaceRight = 20 - (0 + 10 + 20) = -10 < 192
    // spaceLeft = 0 - 20 = -20 < 192
    // fallback: spaceBelow(10) >= spaceAbove(-10) => 'bottom'
    expect(result).toBe('bottom');
  });

  it('falls back to "top" when spaceAbove > spaceBelow and nothing fits', () => {
    const result = computeTooltipPosition({
      target: { x: 0, y: 40, width: 10, height: 10 },
      screenWidth: 20,
      screenHeight: 50,
      tooltipWidth: 320,
      tooltipHeight: 150,
      offset: 20,
    });
    // spaceBelow = 50 - (40 + 10 + 20) = -20
    // spaceAbove = 40 - 20 = 20
    // Neither fits, fallback: spaceBelow(-20) < spaceAbove(20) => 'top'
    expect(result).toBe('top');
  });

  it('uses default tooltipHeight of 150 and offset of 20 when not provided', () => {
    const result = computeTooltipPosition({
      target: { x: 50, y: 100, width: 100, height: 50 },
      screenWidth,
      screenHeight,
      tooltipWidth,
    });
    // spaceBelow = 800 - (100 + 50 + 20) = 630 >= 150 => 'bottom'
    expect(result).toBe('bottom');
  });
});

describe('validateRef', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns false WITHOUT warning when ref is undefined (intentional no-target step)', () => {
    const result = validateRef(undefined, 'step1');
    expect(result).toBe(false);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns false and warns when ref.current is null', () => {
    const ref = { current: null };
    const result = validateRef(ref, 'step2');
    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Step "step2" targetRef.current is null')
    );
  });

  it('returns true when ref.current is a valid object', () => {
    const ref = { current: { measureInWindow: jest.fn() } };
    const result = validateRef(ref, 'step3');
    expect(result).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('extractBorderRadius', () => {
  it('returns undefined for undefined style', () => {
    expect(extractBorderRadius(undefined)).toBeUndefined();
  });

  it('returns undefined for null style', () => {
    expect(extractBorderRadius(null)).toBeUndefined();
  });

  it('returns undefined when no border radius props exist', () => {
    expect(extractBorderRadius({ backgroundColor: 'red' })).toBeUndefined();
  });

  it('returns number for uniform borderRadius', () => {
    expect(extractBorderRadius({ borderRadius: 16 })).toBe(16);
  });

  it('returns number when all per-corner radii are the same', () => {
    expect(
      extractBorderRadius({
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
      })
    ).toBe(10);
  });

  it('returns object when per-corner radii differ', () => {
    expect(
      extractBorderRadius({
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
      })
    ).toStrictEqual({ topLeft: 20, topRight: 20, bottomRight: 0, bottomLeft: 0 });
  });

  it('uses borderRadius as base, per-corner overrides take precedence', () => {
    expect(
      extractBorderRadius({
        borderRadius: 12,
        borderTopLeftRadius: 24,
      })
    ).toStrictEqual({ topLeft: 24, topRight: 12, bottomRight: 12, bottomLeft: 12 });
  });

  it('defaults missing per-corner radii to borderRadius base', () => {
    expect(
      extractBorderRadius({
        borderRadius: 8,
        borderBottomLeftRadius: 0,
      })
    ).toStrictEqual({ topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 0 });
  });

  it('handles array of styles (flattened)', () => {
    const result = extractBorderRadius([{ borderRadius: 10 }, { borderTopLeftRadius: 20 }]);
    expect(result).toStrictEqual({ topLeft: 20, topRight: 10, bottomRight: 10, bottomLeft: 10 });
  });

  it('resolves a percentage radius against the target shorter side (circle stays round)', () => {
    // A circular 48x48 avatar styled with borderRadius: '50%' should resolve to 24.
    expect(extractBorderRadius({ borderRadius: '50%' }, { width: 48, height: 48 })).toBe(24);
  });

  it('resolves percentage against the shorter side for a pill', () => {
    // 200x40 pill, '50%' → 50% of min(200,40)=40 → 20 (fully rounded ends).
    expect(extractBorderRadius({ borderRadius: '50%' }, { width: 200, height: 40 })).toBe(20);
  });

  it('handles fractional percentages', () => {
    expect(extractBorderRadius({ borderRadius: '25%' }, { width: 80, height: 80 })).toBe(20);
  });

  it('falls back to base/0 for percentages when no target is provided', () => {
    expect(extractBorderRadius({ borderRadius: '50%' })).toBe(0);
  });
});
