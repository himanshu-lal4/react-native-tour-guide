import React, { useRef, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Animated, Pressable } from 'react-native';
import Svg, { Rect, Path, Defs, Mask } from 'react-native-svg';

import type { SpotlightTarget, SpotlightStyles } from './types';
import { computeShape } from './shapes';
import type { SpotlightBorderRadius } from './shapes';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const DEFAULT_SPOTLIGHT_STYLES: SpotlightStyles = {};

// Resolve optional dependencies once at module scope
let _resolvedBlurView: React.ComponentType<Record<string, unknown>> | null | undefined;
let _resolvedLinearGradient: React.ComponentType<Record<string, unknown>> | null | undefined;
let _resolvedMaskedView: React.ComponentType<Record<string, unknown>> | null | undefined;

const getBlurView = () => {
  if (_resolvedBlurView === undefined) {
    try {
      _resolvedBlurView = require('@react-native-community/blur').BlurView;
    } catch {
      _resolvedBlurView = null;
    }
  }
  return _resolvedBlurView;
};

const getLinearGradient = () => {
  if (_resolvedLinearGradient === undefined) {
    try {
      _resolvedLinearGradient = require('react-native-linear-gradient').default;
    } catch {
      _resolvedLinearGradient = null;
    }
  }
  return _resolvedLinearGradient;
};

const getMaskedView = () => {
  if (_resolvedMaskedView === undefined) {
    try {
      _resolvedMaskedView = require('@react-native-masked-view/masked-view').default;
    } catch {
      _resolvedMaskedView = null;
    }
  }
  return _resolvedMaskedView;
};

let maskIdCounter = 0;

export interface SpotlightOverlayProps {
  target: SpotlightTarget | null;
  padding?: number;
  borderRadius?: SpotlightBorderRadius;
  styles?: SpotlightStyles;
  screenWidth: number;
  screenHeight: number;
  animationDuration?: number;
  onBackdropPress?: () => void;
  onSpotlightPress?: () => void;
}

/**
 * Component that creates a spotlight effect with a dark overlay.
 * Supports smooth animated transitions between targets.
 * The spotlight automatically matches the target's shape via border radius.
 * Optionally supports blur and gradient effects if dependencies are installed.
 */
const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
  target,
  padding = 0,
  borderRadius: customBorderRadius,
  styles = DEFAULT_SPOTLIGHT_STYLES,
  screenWidth,
  screenHeight,
  animationDuration = 300,
  onBackdropPress,
  onSpotlightPress,
}) => {
  const {
    overlayOpacity = 0.6,
    overlayColor = 'black',
    blurAmount = 4,
    enableBlur = false,
    enableGradient = false,
    gradientColors = ['rgba(217,217,217,0)', 'rgba(19,32,14,0.64)'],
    enablePulse = false,
    pulseColor = '#FFFFFF',
    pulseWidth = 2,
    pulseDuration = 1500,
    pulseMinOpacity = 0.2,
    pulseMaxOpacity = 0.8,
  } = styles;

  // Unique mask IDs per instance to avoid SVG conflicts
  const maskIds = useRef({
    inverse: `inverse-mask-${++maskIdCounter}`,
    spotlight: `spotlight-mask-${maskIdCounter}`,
  }).current;

  // Animated values for smooth spotlight transitions
  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const animWidth = useRef(new Animated.Value(0)).current;
  const animHeight = useRef(new Animated.Value(0)).current;
  const animRx = useRef(new Animated.Value(0)).current;
  const animRy = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  // Path data for per-corner border radius shapes
  const [pathD, setPathD] = useState('');
  const usePathRendering = useMemo(() => {
    if (!target) return false;
    const result = computeShape(target, padding, customBorderRadius);
    return result.kind === 'path';
  }, [target, padding, customBorderRadius]);

  // Compute shape result synchronously
  const shapeResult = useMemo(
    () => (target ? computeShape(target, padding, customBorderRadius) : null),
    [target, padding, customBorderRadius]
  );

  // Bounding box for press overlay positioning
  const bounds = useMemo(() => {
    if (!shapeResult) return null;
    if (shapeResult.kind === 'rect') {
      return {
        x: shapeResult.x,
        y: shapeResult.y,
        width: shapeResult.width,
        height: shapeResult.height,
      };
    }
    return shapeResult.bounds;
  }, [shapeResult]);

  // Animation effect
  useEffect(() => {
    if (!shapeResult) return;

    if (shapeResult.kind === 'path') {
      // Path shapes (per-corner radius): set bounding box values immediately
      const b = shapeResult.bounds;
      animX.setValue(b.x);
      animY.setValue(b.y);
      animWidth.setValue(b.width);
      animHeight.setValue(b.height);
      setPathD(shapeResult.d);
      hasAnimated.current = true;
      return;
    }

    // Rect shapes
    if (!hasAnimated.current) {
      // First target — set immediately, no animation
      animX.setValue(shapeResult.x);
      animY.setValue(shapeResult.y);
      animWidth.setValue(shapeResult.width);
      animHeight.setValue(shapeResult.height);
      animRx.setValue(shapeResult.rx);
      animRy.setValue(shapeResult.ry);
      hasAnimated.current = true;
      return;
    }

    // Animate to new position
    Animated.parallel([
      Animated.timing(animX, {
        toValue: shapeResult.x,
        duration: animationDuration,
        useNativeDriver: false,
      }),
      Animated.timing(animY, {
        toValue: shapeResult.y,
        duration: animationDuration,
        useNativeDriver: false,
      }),
      Animated.timing(animWidth, {
        toValue: shapeResult.width,
        duration: animationDuration,
        useNativeDriver: false,
      }),
      Animated.timing(animHeight, {
        toValue: shapeResult.height,
        duration: animationDuration,
        useNativeDriver: false,
      }),
      Animated.timing(animRx, {
        toValue: shapeResult.rx,
        duration: animationDuration,
        useNativeDriver: false,
      }),
      Animated.timing(animRy, {
        toValue: shapeResult.ry,
        duration: animationDuration,
        useNativeDriver: false,
      }),
    ]).start();
  }, [shapeResult, animX, animY, animWidth, animHeight, animRx, animRy, animationDuration]);

  // Pulse animation
  useEffect(() => {
    if (!enablePulse || !target) {
      pulseOpacity.setValue(0);
      return;
    }

    const halfDuration = pulseDuration / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: pulseMaxOpacity,
          duration: halfDuration,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: pulseMinOpacity,
          duration: halfDuration,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [enablePulse, target, pulseDuration, pulseMinOpacity, pulseMaxOpacity, pulseOpacity]);

  if (!target || !shapeResult || !bounds) return null;

  // Resolve optional libraries (cached at module scope)
  const BlurView = enableBlur ? getBlurView() : null;
  const LinearGradient = enableGradient ? getLinearGradient() : null;
  const MaskedView = enableBlur && BlurView ? getMaskedView() : null;

  // --- Cutout shape rendering helpers ---
  const renderRectCutout = (fill: string, stroke?: string, sw?: number) => (
    <AnimatedRect
      x={animX}
      y={animY}
      width={animWidth}
      height={animHeight}
      rx={animRx}
      ry={animRy}
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
    />
  );

  const renderPathCutout = (fill: string, stroke?: string, sw?: number) => (
    <Path d={pathD} fill={fill} stroke={stroke} strokeWidth={sw} />
  );

  const renderCutout = (fill: string, stroke?: string, sw?: number) =>
    usePathRendering ? renderPathCutout(fill, stroke, sw) : renderRectCutout(fill, stroke, sw);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop press layer — behind everything */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onBackdropPress}>
        {/* Optional: Masked blur effect */}
        {enableBlur && BlurView && MaskedView ? (
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <Svg height={screenHeight} width={screenWidth}>
                <Defs>
                  <Mask id={maskIds.inverse}>
                    <Rect x="0" y="0" width={screenWidth} height={screenHeight} fill="white" />
                    {renderCutout('black')}
                  </Mask>
                </Defs>
                <Rect
                  x="0"
                  y="0"
                  width={screenWidth}
                  height={screenHeight}
                  fill="black"
                  mask={`url(#${maskIds.inverse})`}
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
            {enableGradient && LinearGradient ? (
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
          </MaskedView>
        ) : null}

        {/* Main dark overlay with animated spotlight cutout */}
        <Svg height={screenHeight} width={screenWidth} style={StyleSheet.absoluteFill}>
          <Defs>
            <Mask id={maskIds.spotlight}>
              <Rect x="0" y="0" width={screenWidth} height={screenHeight} fill="white" />
              {renderCutout('black')}
            </Mask>
          </Defs>
          <Rect
            x="0"
            y="0"
            width={screenWidth}
            height={screenHeight}
            fill={overlayColor}
            fillOpacity={overlayOpacity}
            mask={`url(#${maskIds.spotlight})`}
          />
        </Svg>
      </Pressable>

      {/* Pulse border overlay */}
      {enablePulse ? (
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: pulseOpacity }]}
          pointerEvents="none"
        >
          <Svg height={screenHeight} width={screenWidth}>
            {renderCutout('none', pulseColor, pulseWidth)}
          </Svg>
        </Animated.View>
      ) : null}

      {/* Spotlight press area — on top of backdrop, over the cutout */}
      {onSpotlightPress ? (
        <Pressable
          style={{
            position: 'absolute',
            left: bounds.x,
            top: bounds.y,
            width: bounds.width,
            height: bounds.height,
          }}
          onPress={onSpotlightPress}
        />
      ) : null}
    </View>
  );
};

export default SpotlightOverlay;
