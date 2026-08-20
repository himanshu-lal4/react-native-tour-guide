import { scrollRefToY } from '../utils';

describe('scrollRefToY', () => {
  describe('supported scrollable shapes', () => {
    it('uses scrollTo for a ScrollView ref', () => {
      const scrollTo = jest.fn();
      const ref = { current: { scrollTo } };

      expect(scrollRefToY(ref, 250, true)).toBe(true);
      expect(scrollTo).toHaveBeenCalledWith({ x: 0, y: 250, animated: true });
    });

    it('uses scrollToOffset for a FlatList ref', () => {
      // FlatList has no scrollTo — assuming it did was a hard crash.
      const scrollToOffset = jest.fn();
      const ref = { current: { scrollToOffset } };

      expect(scrollRefToY(ref, 250, true)).toBe(true);
      expect(scrollToOffset).toHaveBeenCalledWith({ offset: 250, animated: true });
    });

    it('uses getScrollResponder().scrollTo for a SectionList ref', () => {
      const scrollTo = jest.fn();
      const ref = { current: { getScrollResponder: () => ({ scrollTo }) } };

      expect(scrollRefToY(ref, 120, false)).toBe(true);
      expect(scrollTo).toHaveBeenCalledWith({ x: 0, y: 120, animated: false });
    });

    it('uses getScrollRef().scrollToOffset for a VirtualizedList wrapper', () => {
      const scrollToOffset = jest.fn();
      const ref = { current: { getScrollRef: () => ({ scrollToOffset }) } };

      expect(scrollRefToY(ref, 80, true)).toBe(true);
      expect(scrollToOffset).toHaveBeenCalledWith({ offset: 80, animated: true });
    });

    it('unwraps a legacy Animated.ScrollView via getNode()', () => {
      const scrollTo = jest.fn();
      const ref = { current: { getNode: () => ({ scrollTo }) } };

      expect(scrollRefToY(ref, 40, true)).toBe(true);
      expect(scrollTo).toHaveBeenCalledWith({ x: 0, y: 40, animated: true });
    });

    it('uses scrollToPosition for a KeyboardAwareScrollView ref', () => {
      const scrollToPosition = jest.fn();
      const ref = { current: { scrollToPosition } };

      expect(scrollRefToY(ref, 300, true)).toBe(true);
      expect(scrollToPosition).toHaveBeenCalledWith(0, 300, true);
    });

    it('prefers the direct scrollTo over a wrapped inner scrollable', () => {
      const outer = jest.fn();
      const inner = jest.fn();
      const ref = { current: { scrollTo: outer, getScrollResponder: () => ({ scrollTo: inner }) } };

      scrollRefToY(ref, 10, true);
      expect(outer).toHaveBeenCalled();
      expect(inner).not.toHaveBeenCalled();
    });
  });

  describe('clamping and flags', () => {
    it('never scrolls to a negative offset', () => {
      const scrollTo = jest.fn();
      scrollRefToY({ current: { scrollTo } }, -500, true);
      expect(scrollTo).toHaveBeenCalledWith({ x: 0, y: 0, animated: true });
    });

    it('passes animated: false through', () => {
      const scrollToOffset = jest.fn();
      scrollRefToY({ current: { scrollToOffset } }, 15, false);
      expect(scrollToOffset).toHaveBeenCalledWith({ offset: 15, animated: false });
    });
  });

  describe('refs that cannot scroll', () => {
    it('returns false for a null ref', () => {
      expect(scrollRefToY(null, 100, true)).toBe(false);
    });

    it('returns false for an undefined ref', () => {
      expect(scrollRefToY(undefined, 100, true)).toBe(false);
    });

    it('returns false when ref.current is null (not yet mounted)', () => {
      expect(scrollRefToY({ current: null }, 100, true)).toBe(false);
    });

    it('returns false when the ref points at a plain View', () => {
      // A ref attached to a wrapper View instead of the ScrollView: the caller
      // must carry on without scrolling rather than crash.
      expect(scrollRefToY({ current: { measureInWindow: jest.fn() } }, 100, true)).toBe(false);
    });
  });

  describe('resilience', () => {
    it('does not throw when scrollTo itself throws, and falls through', () => {
      const scrollTo = jest.fn(() => {
        throw new Error('detached');
      });
      const inner = jest.fn();
      const ref = { current: { scrollTo, getScrollResponder: () => ({ scrollTo: inner }) } };

      expect(() => scrollRefToY(ref, 10, true)).not.toThrow();
      // Falls back to the inner scrollable rather than taking the tour down.
      expect(inner).toHaveBeenCalledWith({ x: 0, y: 10, animated: true });
    });

    it('does not throw when an unwrapping getter throws', () => {
      const ref = {
        current: {
          getScrollResponder: () => {
            throw new Error('unmounted');
          },
        },
      };
      expect(() => scrollRefToY(ref, 10, true)).not.toThrow();
      expect(scrollRefToY(ref, 10, true)).toBe(false);
    });

    it('returns false when every candidate throws', () => {
      const ref = {
        current: {
          scrollTo: () => {
            throw new Error('nope');
          },
        },
      };
      expect(scrollRefToY(ref, 10, true)).toBe(false);
    });
  });
});
