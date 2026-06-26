import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import type { TourGuideConfig, TooltipProps } from './types';
import { computeTooltipPosition } from './utils';
import { getTooltipAccessibilityProps } from './accessibility';

const DEFAULT_CONFIG: TourGuideConfig = {};

const DEFAULT_TOOLTIP_WIDTH = 320;
const DEFAULT_TRIANGLE_SIZE = 12;
const DEFAULT_OFFSET = 8;

// Module-scoped so it's a stable reference used as a default prop (an inline
// object literal default re-creates each render and can cause render loops).
const ZERO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };

/**
 * Tooltip component that displays tour information.
 * Supports automatic positioning and customizable styling.
 */
const Tooltip: React.FC<TooltipProps> = ({
  title,
  description,
  position,
  tooltipPosition: tooltipPositionProp = 'bottom',
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  targetHeight = 0,
  targetWidth = 0,
  config = DEFAULT_CONFIG,
  hideNextButton = false,
  hidePrevButton = false,
  hideSkipButton = false,
  screenWidth = 0,
  screenHeight = 0,
  insets = ZERO_INSETS,
}) => {
  const {
    tooltipStyles: tooltipStylesConfig,
    showProgressDots = false,
    showStepCounter = true,
    enableBackButton = true,
    nextButtonText = 'Next',
    prevButtonText = 'Back',
    skipButtonText = 'Skip',
    doneButtonText = 'Done',
    tooltipWidth: configTooltipWidth,
    triangleSize: configTriangleSize,
    tooltipOffset: configTooltipOffset,
  } = config;

  const TOOLTIP_WIDTH = configTooltipWidth ?? DEFAULT_TOOLTIP_WIDTH;
  const TRIANGLE_SIZE = configTriangleSize ?? DEFAULT_TRIANGLE_SIZE;
  const OFFSET = configTooltipOffset ?? DEFAULT_OFFSET;

  const {
    backgroundColor = '#2C2C2E',
    borderRadius = 16,
    titleColor = '#FFFFFF',
    descriptionColor = '#FFFFFF',
    buttonTextColor = '#FFFFFF',
    primaryButtonColor = '#007AFF',
    secondaryButtonColor = '#3A3A3C',
    skipButtonColor = '#FFFFFF',
    titleStyle: customTitleStyle,
    descriptionStyle: customDescriptionStyle,
    containerStyle: customContainerStyle,
  } = tooltipStylesConfig ?? {};

  const targetCenterX = position.x + targetWidth / 2;

  // Measure the tooltip's real height so we can keep it fully on-screen. Until
  // the first layout pass we use a conservative estimate.
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const H = measuredHeight || 160;
  const onBodyLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && Math.abs(h - measuredHeight) > 1) setMeasuredHeight(h);
  };

  // Smart auto-positioning
  const tooltipPosition = useMemo(() => {
    if (tooltipPositionProp === 'auto' && screenWidth > 0 && screenHeight > 0) {
      return computeTooltipPosition({
        target: { x: position.x, y: position.y, width: targetWidth, height: targetHeight },
        screenWidth,
        screenHeight,
        tooltipWidth: TOOLTIP_WIDTH,
        tooltipHeight: 150,
        offset: OFFSET + TRIANGLE_SIZE,
      });
    }

    if (tooltipPositionProp === 'auto') return 'bottom';
    return tooltipPositionProp;
  }, [
    tooltipPositionProp,
    position.x,
    position.y,
    targetWidth,
    targetHeight,
    screenWidth,
    screenHeight,
    TOOLTIP_WIDTH,
    OFFSET,
    TRIANGLE_SIZE,
  ]);

  // Compute tooltip body position and style
  const tooltipBodyStyle = useMemo(() => {
    if (tooltipPosition === 'top' || tooltipPosition === 'bottom') {
      const pad = 16;
      const idealLeft = targetCenterX - TOOLTIP_WIDTH / 2;
      const minLeft = insets.left + pad;
      const maxLeft = screenWidth - insets.right - TOOLTIP_WIDTH - pad;
      // Guard against negative range on very narrow screens.
      const clampedLeft = Math.max(minLeft, Math.min(idealLeft, Math.max(minLeft, maxLeft)));

      return { left: clampedLeft, maxWidth: TOOLTIP_WIDTH, minWidth: 100 };
    }
    return { left: undefined as number | undefined, maxWidth: TOOLTIP_WIDTH, minWidth: 100 };
  }, [tooltipPosition, targetCenterX, TOOLTIP_WIDTH, screenWidth, insets.left, insets.right]);

  // Compute the container position. Vertical placement is always expressed as an
  // absolute `top` and clamped against the measured height so the tooltip can
  // never run off the top or bottom of the screen (the off-screen bug).
  const placement = useMemo(() => {
    const SAFE_MARGIN = 8;
    const minTop = insets.top + SAFE_MARGIN;
    const maxTop = screenHeight - insets.bottom - H - SAFE_MARGIN;
    const clampTop = (t: number) => Math.max(minTop, Math.min(t, Math.max(minTop, maxTop)));

    switch (tooltipPosition) {
      case 'top': {
        const top = clampTop(position.y - OFFSET - TRIANGLE_SIZE - H);
        return { style: { top } as const, arrowVertical: undefined };
      }
      case 'left':
      case 'right': {
        const top = clampTop(position.y + targetHeight / 2 - H / 2);
        const horizontal =
          tooltipPosition === 'left'
            ? { right: screenWidth - position.x + OFFSET + TRIANGLE_SIZE }
            : { left: position.x + targetWidth + OFFSET + TRIANGLE_SIZE };
        // Keep the arrow pointing at the target's vertical center, but clamp it
        // within the (possibly repositioned) tooltip body.
        const rawArrow = position.y + targetHeight / 2 - top - TRIANGLE_SIZE;
        const arrowVertical = Math.max(
          borderRadius,
          Math.min(rawArrow, H - borderRadius - TRIANGLE_SIZE * 2)
        );
        return { style: { ...horizontal, top }, arrowVertical };
      }
      case 'bottom':
      default: {
        const top = clampTop(position.y + targetHeight + OFFSET + TRIANGLE_SIZE);
        return { style: { top } as const, arrowVertical: undefined };
      }
    }
  }, [
    tooltipPosition,
    position.x,
    position.y,
    targetWidth,
    targetHeight,
    screenWidth,
    screenHeight,
    H,
    OFFSET,
    TRIANGLE_SIZE,
    borderRadius,
    insets.top,
    insets.bottom,
  ]);

  const getTriangleStyle = () => {
    const baseTriangle = {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      position: 'absolute' as const,
    };

    // Arrow tip should point at targetCenterX (screen coordinate).
    // The triangle is inside tooltipWrapper which starts at screen x=0,
    // so its `left` is in screen coordinates.
    // Clamp so arrow stays visually within the tooltip body.
    const tooltipLeft = tooltipBodyStyle.left ?? 0;
    const rawTriangleLeft = targetCenterX - TRIANGLE_SIZE;
    const minTriangle = tooltipLeft + borderRadius;
    const maxTriangle = tooltipLeft + TOOLTIP_WIDTH - borderRadius - TRIANGLE_SIZE * 2;
    const relativeTriangleLeft = Math.max(minTriangle, Math.min(rawTriangleLeft, maxTriangle));

    // Overlap arrow by 1px to eliminate subpixel gap
    const OVERLAP = 1;

    switch (tooltipPosition) {
      case 'top':
        return {
          ...baseTriangle,
          borderLeftWidth: TRIANGLE_SIZE,
          borderRightWidth: TRIANGLE_SIZE,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: backgroundColor,
          borderTopWidth: TRIANGLE_SIZE,
          bottom: -TRIANGLE_SIZE + OVERLAP,
          left: relativeTriangleLeft,
        };
      case 'bottom':
        return {
          ...baseTriangle,
          borderLeftWidth: TRIANGLE_SIZE,
          borderRightWidth: TRIANGLE_SIZE,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: backgroundColor,
          borderBottomWidth: TRIANGLE_SIZE,
          top: -TRIANGLE_SIZE + OVERLAP,
          left: relativeTriangleLeft,
        };
      case 'left':
        return {
          ...baseTriangle,
          borderTopWidth: TRIANGLE_SIZE,
          borderBottomWidth: TRIANGLE_SIZE,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: backgroundColor,
          borderLeftWidth: TRIANGLE_SIZE,
          right: -TRIANGLE_SIZE + OVERLAP,
          top: placement.arrowVertical ?? 20,
        };
      case 'right':
        return {
          ...baseTriangle,
          borderTopWidth: TRIANGLE_SIZE,
          borderBottomWidth: TRIANGLE_SIZE,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: backgroundColor,
          borderRightWidth: TRIANGLE_SIZE,
          left: -TRIANGLE_SIZE + OVERLAP,
          top: placement.arrowVertical ?? 20,
        };
      default:
        return {
          ...baseTriangle,
          borderLeftWidth: TRIANGLE_SIZE,
          borderRightWidth: TRIANGLE_SIZE,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: backgroundColor,
          borderBottomWidth: TRIANGLE_SIZE,
          top: -TRIANGLE_SIZE + OVERLAP,
          left: relativeTriangleLeft,
        };
    }
  };

  const showPrev = enableBackButton && !hidePrevButton && Boolean(onPrev) && currentStep > 0;
  const showSkip = !hideSkipButton;
  const showNext = !hideNextButton;

  // Accessibility
  const a11yProps = getTooltipAccessibilityProps(
    { id: '', title, description, accessibilityLabel: undefined },
    currentStep,
    totalSteps,
    config
  );

  return (
    <View style={[internalStyles.container, placement.style]}>
      <View style={internalStyles.tooltipWrapper}>
        {/* Triangle/Arrow */}
        <View style={getTriangleStyle()} />

        {/* Tooltip Body */}
        <View
          {...a11yProps}
          onLayout={onBodyLayout}
          style={[
            internalStyles.tooltipBody,
            { backgroundColor, borderRadius },
            tooltipBodyStyle,
            customContainerStyle,
          ]}
        >
          {/* Header with title and skip */}
          <View style={internalStyles.header}>
            <Text
              style={[internalStyles.titleText, { color: titleColor }, customTitleStyle]}
              numberOfLines={2}
            >
              {title}
            </Text>
            {showSkip ? (
              <Pressable
                style={[internalStyles.skipButton, { borderColor: skipButtonColor }]}
                onPress={onSkip}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${skipButtonText} tour`}
              >
                <Text style={[internalStyles.skipText, { color: skipButtonColor }]}>
                  {skipButtonText}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* Description */}
          <Text
            style={[
              internalStyles.descriptionText,
              { color: descriptionColor },
              customDescriptionStyle,
            ]}
          >
            {description}
          </Text>

          {/* Footer with progress and buttons */}
          <View style={internalStyles.footer}>
            {/* Progress dots */}
            {showProgressDots && totalSteps > 1 ? (
              <View style={internalStyles.dotsContainer}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <View
                    key={`dot-${index}`}
                    style={[
                      internalStyles.dot,
                      {
                        backgroundColor:
                          index === currentStep ? primaryButtonColor : descriptionColor,
                        opacity: index === currentStep ? 1 : 0.3,
                      },
                      index === currentStep && internalStyles.dotActive,
                    ]}
                  />
                ))}
              </View>
            ) : null}

            {/* Navigation buttons */}
            <View style={internalStyles.navigationRow}>
              {/* Step counter */}
              {showStepCounter && totalSteps > 1 ? (
                <Text style={[internalStyles.stepCounter, { color: descriptionColor }]}>
                  {currentStep + 1}/{totalSteps}
                </Text>
              ) : null}

              <View style={internalStyles.buttonsContainer}>
                {/* Back button */}
                {showPrev ? (
                  <Pressable
                    onPress={onPrev}
                    style={[internalStyles.button, { backgroundColor: secondaryButtonColor }]}
                    accessibilityRole="button"
                    accessibilityLabel={`${prevButtonText}, go to previous step`}
                  >
                    <Text style={[internalStyles.buttonText, { color: buttonTextColor }]}>
                      {prevButtonText}
                    </Text>
                  </Pressable>
                ) : null}
                {/* Next/Done button */}
                {showNext ? (
                  <Pressable
                    onPress={onNext}
                    style={[internalStyles.buttonPrimary, { backgroundColor: primaryButtonColor }]}
                    accessibilityRole="button"
                    accessibilityLabel={
                      currentStep === totalSteps - 1
                        ? `${doneButtonText}, finish tour`
                        : `${nextButtonText}, go to step ${currentStep + 2}`
                    }
                  >
                    <Text style={[internalStyles.buttonPrimaryText, { color: buttonTextColor }]}>
                      {currentStep === totalSteps - 1 ? doneButtonText : nextButtonText}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const internalStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10000,
  },
  tooltipWrapper: {
    position: 'relative',
  },
  tooltipBody: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 16,
    flex: 1,
    ...Platform.select({
      ios: { fontWeight: '600' },
      android: { fontWeight: '700' },
      default: { fontWeight: '600' },
    }),
  },
  skipButton: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    gap: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCounter: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Tooltip;
