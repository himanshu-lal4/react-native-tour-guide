describe('dev warnings', () => {
  let dev: typeof import('../dev');
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    dev = require('../dev');
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('warnOnce', () => {
    it('prints the message with the package prefix', () => {
      dev.warnOnce('something is wrong');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('react-native-tour-guide: something is wrong')
      );
    });

    it('appends the fix hint when given', () => {
      dev.warnOnce('something is wrong', 'do this instead');
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('→ Fix: do this instead'));
    });

    it('prints a repeated message only once', () => {
      dev.warnOnce('repeated');
      dev.warnOnce('repeated');
      dev.warnOnce('repeated');
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('still prints distinct messages', () => {
      dev.warnOnce('first');
      dev.warnOnce('second');
      expect(warnSpy).toHaveBeenCalledTimes(2);
    });

    it('treats the same message with a different fix as distinct', () => {
      dev.warnOnce('same', 'fix a');
      dev.warnOnce('same', 'fix b');
      expect(warnSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('warn', () => {
    it('prints every time, unlike warnOnce', () => {
      dev.warn('repeated');
      dev.warn('repeated');
      expect(warnSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('production builds', () => {
    // Warnings must not reach consumers' release logs or crash-report breadcrumbs.
    const originalDev = (globalThis as { __DEV__?: boolean }).__DEV__;

    afterEach(() => {
      (globalThis as { __DEV__?: boolean }).__DEV__ = originalDev;
    });

    it('emits nothing from warnOnce when __DEV__ is false', () => {
      (globalThis as { __DEV__?: boolean }).__DEV__ = false;
      dev.warnOnce('should be silent');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('emits nothing from warn when __DEV__ is false', () => {
      (globalThis as { __DEV__?: boolean }).__DEV__ = false;
      dev.warn('should be silent');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('reports isDev() as false when __DEV__ is false', () => {
      (globalThis as { __DEV__?: boolean }).__DEV__ = false;
      expect(dev.isDev()).toBe(false);
    });
  });

  describe('__resetWarnings', () => {
    it('lets a de-duplicated message print again', () => {
      dev.warnOnce('dedup me');
      dev.__resetWarnings();
      dev.warnOnce('dedup me');
      expect(warnSpy).toHaveBeenCalledTimes(2);
    });
  });
});
