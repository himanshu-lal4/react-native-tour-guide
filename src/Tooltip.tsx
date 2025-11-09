import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

import type { TooltipProps } from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOOLTIP_WIDTH = 320;
const TRIANGLE_SIZE = 12;
const OFFSET = 8; // Distance from target to triangle

/**
 * Tooltip component that displays tour information.
 * Supports automatic positioning and customizable styling.
 *
 * @param props - Tooltip properties including title, description, and callbacks
 */
const Tooltip: React.FC<TooltipProps> = ({
  title,
  description,
  position,
  tooltipPosition = 'bottom',
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  targetHeight = 0,
  targetWidth = 0,
  config = {},
}) => {
  const {
    tooltipStyles = {},
    showProgressDots = false,
    showStepCounter = true,
    enableBackButton = true,
    nextButtonText = 'Next',
    prevButtonText = 'Back',
    skipButtonText = 'Skip',
    doneButtonText = 'Done',
  } = config;

  const {
    backgroundColor = '#2C2C2E',
    borderRadius = 16,
    titleColor = '#FFFFFF',
    descriptionColor = '#FFFFFF',
    buttonTextColor = '#FFFFFF',
    primaryButtonColor = '#007AFF',
    secondaryButtonColor = '#3A3A3C',
    skipButtonColor = '#FFFFFF',
    titleStyle = {},
    descriptionStyle = {},
    containerStyle = {},
  } = tooltipStyles;

  // Calculate target center
  const targetCenterX = position.x + targetWidth / 2;
  const targetCenterY = position.y + targetHeight / 2;

  const getTooltipPosition = () => {
    switch (tooltipPosition) {
      case 'top':
        return {
          bottom: SCREEN_HEIGHT - position.y + OFFSET + TRIANGLE_SIZE,
        };
      case 'bottom':
        return {
          top: position.y + targetHeight + OFFSET + TRIANGLE_SIZE,
        };
      case 'left':
        return {
          right: SCREEN_WIDTH - position.x + OFFSET + TRIANGLE_SIZE,
          top: targetCenterY - 40,
        };
      case 'right':
        return {
          left: position.x + targetWidth + OFFSET + TRIANGLE_SIZE,
          top: targetCenterY - 40,
        };
      default:
        return {
          top: position.y + targetHeight + OFFSET + TRIANGLE_SIZE,
        };
    }
  };

  const getTriangleStyle = () => {
    const baseTriangle = {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      position: 'absolute' as const,
    };

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
          bottom: -TRIANGLE_SIZE,
          left: targetCenterX - TRIANGLE_SIZE,
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
          top: -TRIANGLE_SIZE,
          left: targetCenterX - TRIANGLE_SIZE,
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
          right: -TRIANGLE_SIZE,
          top: 20,
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
          left: -TRIANGLE_SIZE,
          top: 20,
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
          top: -TRIANGLE_SIZE,
          left: targetCenterX - TRIANGLE_SIZE,
        };
    }
  };

  const getTooltipBodyStyle = () => {
    if (tooltipPosition === 'top' || tooltipPosition === 'bottom') {
      const padding = 16;
      const idealLeft = targetCenterX - TOOLTIP_WIDTH / 2;
      const minLeft = padding;
      const maxLeft = SCREEN_WIDTH - TOOLTIP_WIDTH - padding;
      const clampedLeft = Math.max(minLeft, Math.min(idealLeft, maxLeft));

      return {
        left: clampedLeft,
        maxWidth: TOOLTIP_WIDTH,
        minWidth: 100,
      };
    }
    return {
      maxWidth: TOOLTIP_WIDTH,
      minWidth: 100,
    };
  };

  return (
    <View style={[styles.container, getTooltipPosition()]}>
      <View style={styles.tooltipWrapper}>
        {/* Triangle/Arrow */}
        <View style={getTriangleStyle()} />

        {/* Tooltip Body */}
        <View
          style={[
            styles.tooltipBody,
            {
              backgroundColor,
              borderRadius,
            },
            getTooltipBodyStyle(),
            containerStyle,
          ]}
        >
          {/* Header with title and skip */}
          <View style={styles.header}>
            <Text
              style={[styles.titleText, { color: titleColor }, titleStyle]}
              numberOfLines={2}
            >
              {title}
            </Text>
            <Pressable
              style={[
                styles.skipButton,
                {
                  borderColor: skipButtonColor,
                },
              ]}
              onPress={onSkip}
              hitSlop={8}
            >
              <Text style={[styles.skipText, { color: skipButtonColor }]}>
                {skipButtonText}
              </Text>
            </Pressable>
          </View>

          {/* Description */}
          <Text
            style={[
              styles.descriptionText,
              { color: descriptionColor },
              descriptionStyle,
            ]}
          >
            {description}
          </Text>

          {/* Footer with progress and buttons */}
          <View style={styles.footer}>
            {/* Progress dots */}
            {showProgressDots && totalSteps > 1 && (
              <View style={styles.dotsContainer}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          index === currentStep
                            ? primaryButtonColor
                            : descriptionColor,
                        opacity: index === currentStep ? 1 : 0.3,
                      },
                      index === currentStep && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Navigation buttons */}
            <View style={styles.navigationRow}>
              {/* Step counter */}
              {showStepCounter && totalSteps > 1 && (
                <Text style={[styles.stepCounter, { color: descriptionColor }]}>
                  {currentStep + 1}/{totalSteps}
                </Text>
              )}

              <View style={styles.buttonsContainer}>
                {/* Back button */}
                {enableBackButton && onPrev && currentStep > 0 && (
                  <Pressable
                    onPress={onPrev}
                    style={[
                      styles.button,
                      { backgroundColor: secondaryButtonColor },
                    ]}
                  >
                    <Text
                      style={[styles.buttonText, { color: buttonTextColor }]}
                    >
                      {prevButtonText}
                    </Text>
                  </Pressable>
                )}
                {/* Next/Done button */}
                <Pressable
                  onPress={onNext}
                  style={[
                    styles.buttonPrimary,
                    { backgroundColor: primaryButtonColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonPrimaryText,
                      { color: buttonTextColor },
                    ]}
                  >
                    {currentStep === totalSteps - 1
                      ? doneButtonText
                      : nextButtonText}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
      ios: {
        fontWeight: '600',
      },
      android: {
        fontWeight: '700',
      },
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
