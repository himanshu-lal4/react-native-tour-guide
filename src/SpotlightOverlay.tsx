import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Svg, { Rect, Defs, Mask } from 'react-native-svg';

import type { SpotlightTarget, SpotlightStyles } from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SpotlightOverlayProps {
  target: SpotlightTarget | null;
  shape?: 'circle' | 'rectangle';
  padding?: number;
  borderRadius?: number;
  styles?: SpotlightStyles;
}

/**
 * Component that creates a spotlight effect with a dark overlay.
 * Optionally supports blur and gradient effects if dependencies are installed.
 *
 * @param target - The target element's position and dimensions
 * @param shape - Shape of the spotlight ('circle' or 'rectangle')
 * @param padding - Padding around the spotlight in pixels
 * @param borderRadius - Border radius for rectangle shape
 * @param styles - Custom styling options
 */
const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
  target,
  shape = 'rectangle',
  padding = 0,
  borderRadius: customBorderRadius,
  styles = {},
}) => {
  if (!target) return null;

  const {
    overlayOpacity = 0.6,
    overlayColor = 'black',
    blurAmount = 4,
    enableBlur = false,
    enableGradient = false,
    gradientColors = ['rgba(217,217,217,0)', 'rgba(19,32,14,0.64)'],
  } = styles;

  let spotlightX: number;
  let spotlightY: number;
  let spotlightWidth: number;
  let spotlightHeight: number;
  let borderRadius: number;

  if (shape === 'circle') {
    // Calculate circle dimensions - use the larger dimension to ensure the element fits
    const circleDiameter = Math.max(target.width, target.height) + padding * 2;
    const circleRadius = circleDiameter / 2;

    // Center the circle on the target element
    const targetCenterX = target.x + target.width / 2;
    const targetCenterY = target.y + target.height / 2;

    spotlightX = targetCenterX - circleRadius;
    spotlightY = targetCenterY - circleRadius;
    spotlightWidth = circleDiameter;
    spotlightHeight = circleDiameter;
    borderRadius = circleRadius;
  } else {
    // Rectangle shape - follow the exact target dimensions
    spotlightX = target.x - padding;
    spotlightY = target.y - padding;
    spotlightWidth = target.width + padding * 2;
    spotlightHeight = target.height + padding * 2;
    borderRadius = customBorderRadius ?? 12;
  }

  // Optional: Try to import blur and gradient libraries
  let BlurView: any = null;
  let LinearGradient: any = null;
  let MaskedView: any = null;

  if (enableBlur) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const blur = require('@react-native-community/blur');
      BlurView = blur.BlurView;
    } catch (e) {
      console.warn(
        'react-native-tour-guide: @react-native-community/blur not found. Blur effect disabled.'
      );
    }
  }

  if (enableGradient) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      LinearGradient = require('react-native-linear-gradient').default;
    } catch (e) {
      console.warn(
        'react-native-tour-guide: react-native-linear-gradient not found. Gradient effect disabled.'
      );
    }
  }

  if (enableBlur && BlurView) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const maskedView = require('@react-native-masked-view/masked-view');
      MaskedView = maskedView.default;
    } catch (e) {
      console.warn(
        'react-native-tour-guide: @react-native-masked-view/masked-view not found. Advanced blur masking disabled.'
      );
    }
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Optional: Masked blur effect */}
      {enableBlur && BlurView && MaskedView && (
        <MaskedView
          style={StyleSheet.absoluteFill}
          maskElement={
            <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH}>
              <Defs>
                <Mask id="inverse-mask">
                  <Rect
                    x="0"
                    y="0"
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                    fill="white"
                  />
                  <Rect
                    x={spotlightX}
                    y={spotlightY}
                    width={spotlightWidth}
                    height={spotlightHeight}
                    rx={borderRadius}
                    ry={borderRadius}
                    fill="black"
                  />
                </Mask>
              </Defs>
              <Rect
                x="0"
                y="0"
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
                fill="black"
                mask="url(#inverse-mask)"
              />
            </Svg>
          }
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={blurAmount}
            reducedTransparencyFallbackColor="white"
          />
          {enableGradient && LinearGradient && (
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
        </MaskedView>
      )}

      {/* Main dark overlay with spotlight cutout */}
      <Svg
        height={SCREEN_HEIGHT}
        width={SCREEN_WIDTH}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <Mask id="spotlight-overlay-mask">
            <Rect
              x="0"
              y="0"
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
              fill="white"
            />
            <Rect
              x={spotlightX}
              y={spotlightY}
              width={spotlightWidth}
              height={spotlightHeight}
              rx={borderRadius}
              ry={borderRadius}
              fill="black"
            />
          </Mask>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          fill={overlayColor}
          fillOpacity={overlayOpacity}
          mask="url(#spotlight-overlay-mask)"
        />
      </Svg>
    </View>
  );
};

export default SpotlightOverlay;
