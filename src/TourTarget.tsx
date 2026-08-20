import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useTourGuide } from './TourGuideContext';

export interface TourTargetProps {
  /** Unique id steps reference via `targetId` */
  id: string;
  children: React.ReactNode;
  /**
   * Style for the wrapper View. Border radius set here is auto-extracted for
   * spotlight shape matching, exactly like a step's `targetStyle`.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Declaratively mark a component as a tour target — the alternative to
 * threading refs into your steps array.
 *
 * Wraps its children in a View (with `collapsable={false}`, so Android's view
 * flattening can never make the target unmeasurable) and registers it with the
 * provider. Steps then reference it by id:
 *
 * @example
 * ```tsx
 * <TourTarget id="compose" style={{ borderRadius: 24 }}>
 *   <ComposeButton />
 * </TourTarget>
 *
 * startTour([{ id: 'step1', targetId: 'compose', title: '…', description: '…' }]);
 * ```
 *
 * The wrapper carries no styles of its own, so layout is unchanged unless you
 * pass `style`. If the target mounts after the tour starts (a later screen),
 * the tour waits briefly for it to register before falling back to a centered
 * tooltip.
 */
export const TourTarget: React.FC<TourTargetProps> = ({ id, children, style }) => {
  const { registerTarget, unregisterTarget, getTarget } = useTourGuide();
  const ref = useRef<React.ComponentRef<typeof View>>(null);

  // Keep the registered style current without re-registering: inline styles get
  // a new identity every render, so re-registering on style change would churn
  // the registry — instead the entry is updated in place, so shape extraction
  // always reads the latest style (e.g. a borderRadius that animates on state).
  useEffect(() => {
    const entry = getTarget(id);
    if (entry && entry.ref === ref) {
      entry.style = style;
    }
  });

  useEffect(() => {
    registerTarget(id, ref, style);
    // Pass our ref so an unmounting duplicate never clobbers a still-mounted
    // TourTarget that re-registered the same id.
    return () => unregisterTarget(id, ref);
    // `style` is intentionally not a dep: identity changes every render for
    // inline styles, and re-registering would churn the registry. The style is
    // read through the registry at measure time, so keeping the first
    // registration's reference is fine for shape extraction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, registerTarget, unregisterTarget]);

  return (
    // collapsable={false} — Android flattens layout-only Views, which would
    // leave nothing to measure and silently produce a 0x0 target.
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
};
