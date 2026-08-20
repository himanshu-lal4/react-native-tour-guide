import { isLightColor } from '../utils';

describe('isLightColor', () => {
  it.each([
    ['#FFFFFF', true],
    ['#ffffff', true],
    ['#F2F2F7', true],
    ['#fff', true],
    ['#000000', false],
    ['#000', false],
    ['#2C2C2E', false],
    ['#1B1B3A', false],
    ['white', true],
    ['black', false],
    ['rgb(255, 255, 255)', true],
    ['rgb(20, 20, 30)', false],
    ['rgba(250, 250, 250, 0.9)', true],
    ['#ffffffff', true], // 8-digit hex
    ['#ffff', true], // 4-digit hex
  ])('%s → %s', (color, expected) => {
    expect(isLightColor(color)).toBe(expected);
  });

  it.each([['not-a-color'], ['hsl(0, 0%, 100%)'], ['#12'], ['']])(
    'returns null for unparseable %s',
    (color) => {
      expect(isLightColor(color)).toBeNull();
    }
  );

  it('returns null for non-strings', () => {
    expect(isLightColor(42 as unknown as string)).toBeNull();
  });

  it('yellow is light, blue is dark (perceived brightness, not average)', () => {
    expect(isLightColor('yellow')).toBe(true);
    expect(isLightColor('blue')).toBe(false);
  });
});
