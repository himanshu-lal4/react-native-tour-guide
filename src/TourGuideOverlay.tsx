import React, { useEffect } from 'react';
import { Dimensions, Modal, Platform, StatusBar } from 'react-native';

import { useTourGuide } from './TourGuideContext';
import SpotlightOverlay from './SpotlightOverlay';
import Tooltip from './Tooltip';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const SAFE_ZONE_OFFSET = 120; // Offset for navigation bars

/**
 * Main overlay component that displays the tour guide.
 * This should be placed at the root level of your app, after your main content.
 *
 * @example
 * ```tsx
 * import { TourGuideProvider, TourGuideOverlay } from '@wrack/react-native-tour-guide';
 *
 * export default function App() {
 *   return (
 *     <TourGuideProvider>
 *       <YourApp />
 *       <TourGuideOverlay />
 *     </TourGuideProvider>
 *   );
 * }
 * ```
 */
const TourGuideOverlay: React.FC = () => {
  const {
    isActive,
    currentStep,
    steps,
    config,
    targetLayout,
    setTargetLayout,
    nextStep,
    prevStep,
    skipTour,
  } = useTourGuide();

  const currentStepData = steps[currentStep];

  useEffect(() => {
    // When step changes, measure the target element
    if (isActive && currentStepData?.targetRef?.current) {
      const measureTarget = () => {
        currentStepData.targetRef?.current?.measureInWindow(
          (x: number, y: number, width: number, height: number) => {
            if (width > 0 && height > 0) {
              // On Android with statusBarTranslucent, add the status bar height
              const statusBarHeight =
                Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
              const adjustedY = y + statusBarHeight;

              setTargetLayout({ x, y: adjustedY, width, height });
            }
          }
        );
      };

      // Check if we need to scroll to the target first
      if (currentStepData.scrollToTarget?.scrollRef?.current) {
        const {
          scrollRef,
          offset = 0,
          animated = true,
          absolute = false,
        } = currentStepData.scrollToTarget;

        if (absolute) {
          // Absolute positioning - scroll to the specified Y position directly
          scrollRef.current?.scrollTo({
            y: Math.max(0, offset),
            animated,
          });

          // Wait for scroll animation to complete, then measure
          setTimeout(
            () => {
              measureTarget();
            },
            animated ? 400 : 100
          );

          return undefined;
        } else {
          // Relative positioning - measure target first, then scroll relative to it
          currentStepData.targetRef?.current?.measureInWindow(
            (_x: number, y: number, width: number, height: number) => {
              if (width > 0 && height > 0) {
                const statusBarHeight =
                  Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
                const adjustedY = y + statusBarHeight;

                // Get current scroll offset (defaults to 0 if not provided)
                const currentScrollOffset =
                  currentStepData.scrollToTarget?.getCurrentScrollOffset?.() ||
                  0;

                // Define safe zones (accounting for navigation bars)
                const safeZoneTop = SAFE_ZONE_OFFSET;
                const safeZoneBottom = WINDOW_HEIGHT - SAFE_ZONE_OFFSET;

                // Check if target is already visible within safe zones
                const targetTop = adjustedY;
                const targetBottom = adjustedY + height;

                const isTargetVisibleInSafeZone =
                  targetTop >= safeZoneTop && targetBottom <= safeZoneBottom;

                if (isTargetVisibleInSafeZone) {
                  // Target is already visible, no need to scroll
                  measureTarget();
                } else {
                  // Target is not visible, calculate scroll position
                  // Target position in scroll content = window position + current scroll offset
                  let scrollToY = currentScrollOffset;

                  if (targetTop < safeZoneTop) {
                    // Target is above safe zone, scroll up to bring it into view at the top
                    // New scroll position = current - (safeZoneTop - targetTop) + offset
                    scrollToY =
                      currentScrollOffset - (safeZoneTop - targetTop) + offset;
                  } else if (targetBottom > safeZoneBottom) {
                    // Target is below safe zone, scroll down to bring it into view at the bottom
                    // New scroll position = current + (targetBottom - safeZoneBottom) + offset
                    scrollToY =
                      currentScrollOffset +
                      (targetBottom - safeZoneBottom) +
                      offset;
                  }

                  // Scroll to the calculated position
                  scrollRef.current?.scrollTo({
                    y: Math.max(0, scrollToY),
                    animated,
                  });

                  // Wait for scroll animation to complete, then measure again
                  setTimeout(
                    () => {
                      measureTarget();
                    },
                    animated ? 400 : 100
                  );
                }
              }
            }
          );

          return undefined;
        }
      } else {
        // No scrolling needed, measure immediately with a small delay
        const timer = setTimeout(measureTarget, 100);
        return () => clearTimeout(timer);
      }
    } else {
      // No active tour or no target, no cleanup needed
      return undefined;
    }
  }, [isActive, currentStep, currentStepData, setTargetLayout]);

  if (!isActive || !currentStepData) {
    return null;
  }

  // Use custom tooltip renderer if provided
  if (config?.renderTooltip && targetLayout) {
    return (
      <Modal
        visible={isActive}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={skipTour}
      >
        <SpotlightOverlay
          target={targetLayout}
          shape={currentStepData.spotlightShape}
          padding={currentStepData.spotlightPadding}
          borderRadius={currentStepData.spotlightBorderRadius}
          styles={config.spotlightStyles}
        />
        {config.renderTooltip({
          title: currentStepData.title,
          description: currentStepData.description,
          position: { x: targetLayout.x, y: targetLayout.y },
          tooltipPosition: currentStepData.tooltipPosition,
          currentStep,
          totalSteps: steps.length,
          targetHeight: targetLayout.height,
          targetWidth: targetLayout.width,
          onNext: nextStep,
          onPrev: currentStep > 0 ? prevStep : undefined,
          onSkip: skipTour,
          config,
        })}
      </Modal>
    );
  }

  return (
    <Modal
      visible={isActive}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={skipTour}
    >
      {/* Spotlight Overlay */}
      <SpotlightOverlay
        target={targetLayout}
        shape={currentStepData.spotlightShape}
        padding={currentStepData.spotlightPadding}
        borderRadius={currentStepData.spotlightBorderRadius}
        styles={config?.spotlightStyles}
      />

      {/* Tooltip */}
      {targetLayout && (
        <Tooltip
          title={currentStepData.title}
          description={currentStepData.description}
          position={{ x: targetLayout.x, y: targetLayout.y }}
          tooltipPosition={currentStepData.tooltipPosition}
          currentStep={currentStep}
          totalSteps={steps.length}
          targetHeight={targetLayout.height}
          targetWidth={targetLayout.width}
          onNext={nextStep}
          onPrev={currentStep > 0 ? prevStep : undefined}
          onSkip={skipTour}
          config={config}
        />
      )}
    </Modal>
  );
};

export default TourGuideOverlay;
