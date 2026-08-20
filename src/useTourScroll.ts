import { useCallback, useMemo } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { useTourGuide } from './TourGuideContext';

export interface TourScrollBinding {
  /**
   * Spread onto the ScrollView/FlatList the tour scrolls (alongside your
   * `ref={scrollRef}`):
   *
   * ```tsx
   * const { scrollProps } = useTourScroll();
   * <ScrollView ref={scrollRef} {...scrollProps}>…</ScrollView>
   * ```
   */
  scrollProps: {
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onMomentumScrollEnd: () => void;
    scrollEventThrottle: number;
  };
  /** The individual handlers, for composing with your own. */
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd: () => void;
}

/**
 * Binds a scrollable to the tour. Wiring this up gives the tour three things:
 *
 * 1. **`followTarget`** — with `config.followTarget: true`, the spotlight and
 *    tooltip stay glued to the target while the user scrolls freely.
 * 2. **Exact auto-scroll settling** — `onMomentumScrollEnd` tells the tour the
 *    programmatic scroll finished, so the highlight lands immediately instead
 *    of waiting for position polling to detect the stop.
 * 3. **A tracked scroll offset** — `getCurrentScrollOffset` becomes redundant;
 *    the tour reads the offset it saw last.
 *
 * Already have your own onScroll? Compose: call both handlers, or spread
 * `scrollProps` and call your handler from a wrapper.
 */
export const useTourScroll = (): TourScrollBinding => {
  const { __reportScroll, __reportScrollEnd } = useTourGuide();

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      __reportScroll?.(e.nativeEvent.contentOffset.y);
    },
    [__reportScroll]
  );

  const onMomentumScrollEnd = useCallback(() => {
    __reportScrollEnd?.();
  }, [__reportScrollEnd]);

  const scrollProps = useMemo(
    () => ({ onScroll, onMomentumScrollEnd, scrollEventThrottle: 16 }),
    [onScroll, onMomentumScrollEnd]
  );

  return { scrollProps, onScroll, onMomentumScrollEnd };
};
