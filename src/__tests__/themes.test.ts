import { darkTheme, lightTheme, minimalTheme, vibrantTheme, createTheme } from '../themes';
import type { TourTheme } from '../types';

describe('Theme Presets', () => {
  const themes: [string, TourTheme][] = [
    ['darkTheme', darkTheme],
    ['lightTheme', lightTheme],
    ['minimalTheme', minimalTheme],
    ['vibrantTheme', vibrantTheme],
  ];

  it.each(themes)('%s has correct shape', (_name, theme) => {
    expect(theme).toHaveProperty('tooltipStyles');
    expect(theme).toHaveProperty('spotlightStyles');
    expect(theme.tooltipStyles).toHaveProperty('backgroundColor');
    expect(theme.tooltipStyles).toHaveProperty('titleColor');
    expect(theme.tooltipStyles).toHaveProperty('primaryButtonColor');
    expect(theme.spotlightStyles).toHaveProperty('overlayOpacity');
    expect(theme.spotlightStyles).toHaveProperty('overlayColor');
  });

  it('darkTheme has expected values', () => {
    expect(darkTheme.tooltipStyles.backgroundColor).toBe('#2C2C2E');
    expect(darkTheme.tooltipStyles.titleColor).toBe('#FFFFFF');
    expect(darkTheme.spotlightStyles.overlayOpacity).toBe(0.6);
    expect(darkTheme.spotlightStyles.overlayColor).toBe('black');
    expect(darkTheme.tooltipStyles.primaryButtonColor).toBe('#007AFF');
  });

  it('lightTheme has expected values', () => {
    expect(lightTheme.tooltipStyles.backgroundColor).toBe('#FFFFFF');
    expect(lightTheme.tooltipStyles.titleColor).toBe('#1C1C1E');
    expect(lightTheme.spotlightStyles.overlayOpacity).toBe(0.4);
  });

  it('minimalTheme has expected values', () => {
    expect(minimalTheme.tooltipStyles.backgroundColor).toBe('#FAFAFA');
    expect(minimalTheme.tooltipStyles.primaryButtonColor).toBe('#555555');
    expect(minimalTheme.spotlightStyles.overlayOpacity).toBe(0.3);
  });

  it('vibrantTheme has expected values', () => {
    expect(vibrantTheme.tooltipStyles.backgroundColor).toBe('#1A1A2E');
    expect(vibrantTheme.tooltipStyles.primaryButtonColor).toBe('#E94560');
    expect(vibrantTheme.spotlightStyles.overlayColor).toBe('#0F0F23');
    expect(vibrantTheme.spotlightStyles.overlayOpacity).toBe(0.7);
  });
});

describe('createTheme', () => {
  it('returns dark theme when called with empty overrides', () => {
    const theme = createTheme({});
    expect(theme.tooltipStyles).toStrictEqual(darkTheme.tooltipStyles);
    expect(theme.spotlightStyles).toStrictEqual(darkTheme.spotlightStyles);
  });

  it('merges partial tooltip overrides', () => {
    const theme = createTheme({
      tooltipStyles: { borderRadius: 24 },
    });
    expect(theme.tooltipStyles.borderRadius).toBe(24);
    expect(theme.tooltipStyles.backgroundColor).toBe(darkTheme.tooltipStyles.backgroundColor);
    expect(theme.tooltipStyles.primaryButtonColor).toBe(darkTheme.tooltipStyles.primaryButtonColor);
  });

  it('merges partial spotlight overrides', () => {
    const theme = createTheme({
      spotlightStyles: { overlayOpacity: 0.9 },
    });
    expect(theme.spotlightStyles.overlayOpacity).toBe(0.9);
    expect(theme.spotlightStyles.overlayColor).toBe(darkTheme.spotlightStyles.overlayColor);
  });

  it('merges both tooltip and spotlight overrides simultaneously', () => {
    const theme = createTheme({
      tooltipStyles: { backgroundColor: '#FF0000' },
      spotlightStyles: { overlayColor: '#00FF00' },
    });
    expect(theme.tooltipStyles.backgroundColor).toBe('#FF0000');
    expect(theme.spotlightStyles.overlayColor).toBe('#00FF00');
    // Unaffected defaults preserved
    expect(theme.tooltipStyles.titleColor).toBe(darkTheme.tooltipStyles.titleColor);
  });
});
