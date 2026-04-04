import type { SpotlightStyles } from '../types';

describe('Spotlight Pulse Configuration', () => {
  const resolveDefaults = (styles: SpotlightStyles = {}) => ({
    enablePulse: styles.enablePulse ?? false,
    pulseColor: styles.pulseColor ?? '#FFFFFF',
    pulseWidth: styles.pulseWidth ?? 2,
    pulseDuration: styles.pulseDuration ?? 1500,
    pulseMinOpacity: styles.pulseMinOpacity ?? 0.2,
    pulseMaxOpacity: styles.pulseMaxOpacity ?? 0.8,
  });

  it('resolves correct defaults when no pulse config provided', () => {
    const result = resolveDefaults({});
    expect(result).toStrictEqual({
      enablePulse: false,
      pulseColor: '#FFFFFF',
      pulseWidth: 2,
      pulseDuration: 1500,
      pulseMinOpacity: 0.2,
      pulseMaxOpacity: 0.8,
    });
  });

  it('resolves correct defaults when styles is undefined', () => {
    const result = resolveDefaults(undefined);
    expect(result.enablePulse).toBe(false);
    expect(result.pulseColor).toBe('#FFFFFF');
  });

  it('pulse is disabled by default', () => {
    const result = resolveDefaults({});
    expect(result.enablePulse).toBe(false);
  });

  it('respects custom pulse color', () => {
    const result = resolveDefaults({ pulseColor: '#FF0000' });
    expect(result.pulseColor).toBe('#FF0000');
  });

  it('respects custom pulse width', () => {
    const result = resolveDefaults({ pulseWidth: 4 });
    expect(result.pulseWidth).toBe(4);
  });

  it('respects custom pulse duration', () => {
    const result = resolveDefaults({ pulseDuration: 2000 });
    expect(result.pulseDuration).toBe(2000);
  });

  it('respects custom opacity range', () => {
    const result = resolveDefaults({
      pulseMinOpacity: 0.1,
      pulseMaxOpacity: 1.0,
    });
    expect(result.pulseMinOpacity).toBe(0.1);
    expect(result.pulseMaxOpacity).toBe(1.0);
  });

  it('enablePulse can be set to true', () => {
    const result = resolveDefaults({ enablePulse: true });
    expect(result.enablePulse).toBe(true);
  });

  it('preserves other spotlight styles alongside pulse config', () => {
    const styles: SpotlightStyles = {
      overlayOpacity: 0.8,
      overlayColor: '#000',
      enablePulse: true,
      pulseColor: '#00FF00',
    };
    const result = resolveDefaults(styles);
    expect(result.enablePulse).toBe(true);
    expect(result.pulseColor).toBe('#00FF00');
    // Original styles unchanged
    expect(styles.overlayOpacity).toBe(0.8);
    expect(styles.overlayColor).toBe('#000');
  });
});
