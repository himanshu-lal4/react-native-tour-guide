import { useCallback, useRef } from 'react';

import type { TourStorage, TourStep, TourGuideConfig } from './types';
import { useTourGuide } from './TourGuideContext';

const STORAGE_PREFIX = '@tour_guide:';

/**
 * Hook that adds "show only once" persistence to tours.
 * Wraps `startTour` to check if a tour has been completed before,
 * and automatically marks tours as completed when they finish.
 *
 * @param storage - Storage adapter (AsyncStorage, MMKV wrapper, etc.)
 *
 * @example
 * ```tsx
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import { useTourPersistence } from '@wrack/react-native-tour-guide';
 *
 * const { startTour, resetTour, isTourCompleted } = useTourPersistence(AsyncStorage);
 *
 * // Only shows the tour if user hasn't seen it before
 * startTour(steps, { tourId: 'onboarding' });
 *
 * // Force show again
 * await resetTour('onboarding');
 * startTour(steps, { tourId: 'onboarding' });
 * ```
 */
export const useTourPersistence = (storage: TourStorage) => {
  const tourGuide = useTourGuide();
  const storageRef = useRef(storage);
  storageRef.current = storage;

  // Stable ref to the underlying startTour to avoid re-creating our wrapper on every render
  const startTourRef = useRef(tourGuide.startTour);
  startTourRef.current = tourGuide.startTour;

  /**
   * Check if a tour has been completed
   */
  const isTourCompleted = useCallback(async (tourId: string): Promise<boolean> => {
    const value = await storageRef.current.getItem(`${STORAGE_PREFIX}${tourId}`);
    return value === 'completed';
  }, []);

  /**
   * Mark a tour as completed
   */
  const markCompleted = useCallback(async (tourId: string) => {
    await storageRef.current.setItem(`${STORAGE_PREFIX}${tourId}`, 'completed');
  }, []);

  /**
   * Reset a tour so it shows again
   */
  const resetTour = useCallback(async (tourId: string) => {
    await storageRef.current.removeItem(`${STORAGE_PREFIX}${tourId}`);
  }, []);

  /**
   * Start a tour only if it hasn't been completed.
   * Automatically marks the tour as completed when finished.
   * Requires `config.tourId` to be set.
   *
   * @param force - If true, show the tour even if previously completed
   * @returns true if the tour was started, false if it was skipped
   */
  const startTour = useCallback(
    async (steps: TourStep[], config?: TourGuideConfig, force = false): Promise<boolean> => {
      const tourId = config?.tourId;
      if (!tourId) {
        console.warn(
          'react-native-tour-guide: useTourPersistence requires config.tourId to be set.'
        );
        startTourRef.current(steps, config);
        return true;
      }

      // Check if already completed
      if (!force) {
        const completed = await isTourCompleted(tourId);
        if (completed) return false;
      }

      // Wrap onTourEnd to mark as completed
      const originalOnTourEnd = config?.onTourEnd;
      const enhancedConfig: TourGuideConfig = {
        ...config,
        onTourEnd: (completed: boolean) => {
          if (completed) {
            markCompleted(tourId);
          }
          originalOnTourEnd?.(completed);
        },
      };

      startTourRef.current(steps, enhancedConfig);
      return true;
    },
    [isTourCompleted, markCompleted]
  );

  return {
    ...tourGuide,
    startTour,
    isTourCompleted,
    resetTour,
    markCompleted,
  };
};
