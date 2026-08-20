import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import type { ResolvedTourGuideConfig, TooltipProps } from './types';
import { computeTooltipPosition, isLightColor } from './utils';
import { getTooltipAccessibilityProps } from './accessibility';

const DEFAULT_CONFIG: ResolvedTourGuideConfig = {};

const DEFAULT_TOOLTIP_WIDTH = 320;
// Never shrink the body below this, even in a very tight corner — a narrower
// tooltip is unreadable, and overflowing slightly is the better failure.
const MIN_TOOLTIP_WIDTH = 100;
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
  nextDisabled = false,
  isLastStep,
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
    components = {},
    allowFontScaling = true,
    maxFontSizeMultiplier,
  } = config;

  // Shared props for every Text node: respect the OS font-size setting, with an
  // optional cap so extreme sizes don't explode the layout.
  const textScaleProps = { allowFontScaling, maxFontSizeMultiplier };

  const TOOLTIP_WIDTH = configTooltipWidth ?? DEFAULT_TOOLTIP_WIDTH;
  const TRIANGLE_SIZE = configTriangleSize ?? DEFAULT_TRIANGLE_SIZE;
  const OFFSET = configTooltipOffset ?? DEFAULT_OFFSET;

  // Readable-by-default: when a consumer sets a custom tooltip background but
  // no text colors, derive dark-on-light or light-on-dark defaults from that
  // background instead of assuming white text. A pale background with the old
  // hard-coded white title rendered invisible text.
  const backgroundColor = tooltipStylesConfig?.backgroundColor ?? '#2C2C2E';
  const bgIsLight = isLightColor(backgroundColor) === true;
  const autoInk = bgIsLight ? '#1C1C1E' : '#FFFFFF';
  const autoSecondary = bgIsLight ? '#E5E5EA' : '#3A3A3C';

  const {
    borderRadius = 16,
    titleColor = autoInk,
    descriptionColor = autoInk,
    buttonTextColor = '#FFFFFF',
    primaryButtonColor = '#007AFF',
    secondaryButtonColor = autoSecondary,
    skipButtonColor = autoInk,
    titleStyle: customTitleStyle,
    descriptionStyle: customDescriptionStyle,
    containerStyle: customContainerStyle,
    arrowStyle: customArrowStyle,
  } = tooltipStylesConfig ?? {};

  // Secondary (Back) button text must read against the BUTTON's own
  // background — not the tooltip's. A consumer may set a dark
  // secondaryButtonColor on a light tooltip (or vice versa); deriving from the
  // tooltip background would render unreadable text on that button.
  // Unparseable button color → fall back to the tooltip-background derivation.
  const secondaryIsLight = isLightColor(secondaryButtonColor) ?? bgIsLight;
  const secondaryTextColor =
    tooltipStylesConfig?.buttonTextColor ?? (secondaryIsLight ? '#1C1C1E' : '#FFFFFF');

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
        // Without the insets a tooltip could be placed under the status bar or
        // behind the home indicator / navigation bar.
        insets,
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
    insets,
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

      return { left: clampedLeft, maxWidth: TOOLTIP_WIDTH, minWidth: MIN_TOOLTIP_WIDTH };
    }
    // Side placements size themselves via the container (see `placement`).
    return { left: undefined as number | undefined, minWidth: MIN_TOOLTIP_WIDTH };
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
        const PAD = 8;

        // Side placements had no horizontal clamp: a target near the screen edge
        // pushed the tooltip partly (or entirely) off-screen. Shrink the tooltip
        // to the space that actually exists, then pin it inside the insets.
        const available =
          tooltipPosition === 'left'
            ? position.x - OFFSET - TRIANGLE_SIZE - insets.left - PAD
            : screenWidth -
              insets.right -
              (position.x + targetWidth + OFFSET + TRIANGLE_SIZE) -
              PAD;
        const width = Math.max(MIN_TOOLTIP_WIDTH, Math.min(TOOLTIP_WIDTH, available));

        const horizontal =
          tooltipPosition === 'left'
            ? {
                right: Math.min(
                  screenWidth - position.x + OFFSET + TRIANGLE_SIZE,
                  screenWidth - insets.left - width - PAD
                ),
                maxWidth: width,
              }
            : {
                left: Math.max(
                  insets.left + PAD,
                  Math.min(
                    position.x + targetWidth + OFFSET + TRIANGLE_SIZE,
                    screenWidth - insets.right - width - PAD
                  )
                ),
                maxWidth: width,
              };
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
    TOOLTIP_WIDTH,
    insets.top,
    insets.bottom,
    insets.left,
    insets.right,
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
  const isLast = isLastStep ?? currentStep === totalSteps - 1;
  const nextLabel = isLast ? doneButtonText : nextButtonText;

  // Shrink-to-fit: the tooltip body may never be taller than the space inside
  // the insets — a long description on a small screen scrolls inside the body
  // instead of running off-screen.
  const maxBodyHeight = Math.max(
    140,
    screenHeight > 0 ? screenHeight - insets.top - insets.bottom - 32 : 9999
  );

  const { NextButton, PrevButton, SkipButton, StepCounter, ProgressDots } = components;

  // Slot resolution as plain nodes keeps the JSX below free of nested ternaries.
  const skipNode =
    showSkip && SkipButton ? <SkipButton label={skipButtonText} onPress={onSkip} /> : null;
  const counterNode =
    showStepCounter && totalSteps > 1 && StepCounter ? (
      <StepCounter currentStep={currentStep} totalSteps={totalSteps} />
    ) : null;
  const prevNode =
    showPrev && PrevButton ? (
      <PrevButton label={prevButtonText} onPress={onPrev ?? (() => {})} />
    ) : null;
  const nextNode =
    showNext && NextButton ? (
      <NextButton label={nextLabel} onPress={onNext} disabled={nextDisabled} isLast={isLast} />
    ) : null;

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
        <View style={[getTriangleStyle(), customArrowStyle]} />

        {/* Tooltip Body */}
        <View
          {...a11yProps}
          onLayout={onBodyLayout}
          style={[
            internalStyles.tooltipBody,
            { backgroundColor, borderRadius, maxHeight: maxBodyHeight },
            tooltipBodyStyle,
            customContainerStyle,
          ]}
        >
          {/* Header with title and skip */}
          <View style={internalStyles.header}>
            <Text
              {...textScaleProps}
              style={[internalStyles.titleText, { color: titleColor }, customTitleStyle]}
              numberOfLines={2}
            >
              {title}
            </Text>
            {skipNode}
            {showSkip && !SkipButton ? (
              <Pressable
                style={[internalStyles.skipButton, { borderColor: skipButtonColor }]}
                onPress={onSkip}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${skipButtonText} tour`}
              >
                <Text
                  {...textScaleProps}
                  style={[internalStyles.skipText, { color: skipButtonColor }]}
                >
                  {skipButtonText}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* Description — scrolls when the shrink-to-fit cap constrains the body */}
          <ScrollView
            style={internalStyles.descriptionScroll}
            contentContainerStyle={internalStyles.descriptionContent}
            showsVerticalScrollIndicator={false}
          >
            <Text
              {...textScaleProps}
              style={[
                internalStyles.descriptionText,
                { color: descriptionColor },
                customDescriptionStyle,
              ]}
            >
              {description}
            </Text>
          </ScrollView>

          {/* Footer with progress and buttons */}
          <View style={internalStyles.footer}>
            {/* Progress dots */}
            {showProgressDots && totalSteps > 1 && ProgressDots ? (
              <ProgressDots currentStep={currentStep} totalSteps={totalSteps} />
            ) : null}
            {showProgressDots && totalSteps > 1 && !ProgressDots ? (
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
              {counterNode}
              {showStepCounter && totalSteps > 1 && !StepCounter ? (
                <Text
                  {...textScaleProps}
                  style={[internalStyles.stepCounter, { color: descriptionColor }]}
                >
                  {currentStep + 1}/{totalSteps}
                </Text>
              ) : null}

              <View style={internalStyles.buttonsContainer}>
                {/* Back button */}
                {prevNode}
                {showPrev && !PrevButton ? (
                  <Pressable
                    onPress={onPrev}
                    style={[internalStyles.button, { backgroundColor: secondaryButtonColor }]}
                    accessibilityRole="button"
                    accessibilityLabel={`${prevButtonText}, go to previous step`}
                  >
                    <Text
                      {...textScaleProps}
                      style={[internalStyles.buttonText, { color: secondaryTextColor }]}
                    >
                      {prevButtonText}
                    </Text>
                  </Pressable>
                ) : null}
                {/* Next/Done button */}
                {nextNode}
                {showNext && !NextButton ? (
                  <Pressable
                    onPress={onNext}
                    disabled={nextDisabled}
                    style={[
                      internalStyles.buttonPrimary,
                      { backgroundColor: primaryButtonColor },
                      nextDisabled && internalStyles.buttonDisabled,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: nextDisabled }}
                    accessibilityLabel={
                      isLast
                        ? `${doneButtonText}, finish tour`
                        : `${nextButtonText}, go to step ${currentStep + 2}`
                    }
                  >
                    <Text
                      {...textScaleProps}
                      style={[internalStyles.buttonPrimaryText, { color: buttonTextColor }]}
                    >
                      {nextLabel}
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
  descriptionScroll: {
    flexShrink: 1,
    marginBottom: 12,
  },
  descriptionContent: {
    flexGrow: 0,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  buttonDisabled: {
    opacity: 0.4,
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
