import React, { useRef, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Animated, Pressable, Dimensions } from 'react-native';
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

  // The dark overlay is drawn as a single even-odd path: a full-screen rectangle
  // with the spotlight punched out as a real hole. This replaces an SVG <Mask>,
  // which on the new architecture (Fabric) leaves the cutout partially filled
  // (a white film over the highlighted element) instead of fully transparent.
  const [overlayPathD, setOverlayPathD] = useState('');
  const animVals = useRef({ x: 0, y: 0, w: 0, h: 0, rx: 0 });

  const roundedRectSubpath = (x: number, y: number, w: number, h: number, r: number) => {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    if (rr <= 0) return `M${x},${y} H${x + w} V${y + h} H${x} Z`;
    return (
      `M${x + rr},${y} H${x + w - rr} A${rr},${rr} 0 0 1 ${x + w},${y + rr} ` +
      `V${y + h - rr} A${rr},${rr} 0 0 1 ${x + w - rr},${y + h} ` +
      `H${x + rr} A${rr},${rr} 0 0 1 ${x},${y + h - rr} ` +
      `V${y + rr} A${rr},${rr} 0 0 1 ${x + rr},${y} Z`
    );
  };

  // The overlay Modal is statusBarTranslucent / edge-to-edge, so it spans the
  // full PHYSICAL screen — but `screenWidth`/`screenHeight` come from
  // Dimensions.get('window'), which on Android excludes the status/navigation
  // bars. Sizing the dark backdrop to the window left an undimmed strip at the
  // bottom (under the nav bar). Cover the full screen instead; over-drawing past
  // the Modal bounds is harmless (clipped). iOS: window == screen, so no change.
  const physicalScreen = Dimensions.get('screen');
  const coverWidth = Math.max(screenWidth, physicalScreen.width);
  const coverHeight = Math.max(screenHeight, physicalScreen.height);

  const buildOverlayPath = (innerSubpath: string) =>
    `M0,0 H${coverWidth} V${coverHeight} H0 Z ${innerSubpath}`;

  // Keep the overlay path in sync with the animated spotlight (rect shapes).
  // Per-corner (path) shapes set the path directly in the animation effect.
  useEffect(() => {
    if (usePathRendering) return undefined;
    const update = () => {
      const v = animVals.current;
      const inner = roundedRectSubpath(v.x, v.y, v.w, v.h, v.rx);
      setOverlayPathD(buildOverlayPath(inner));
      // Keep the pulse border on the SAME state-driven path as the dark cutout.
      // Previously the pulse used a native-animated <Rect> while the dark hole
      // used this React-state path — the native rect outran the state update, so
      // the highlight appeared to "move" while the cutout was left behind. Both
      // now read from the same setState, so they can never drift apart.
      setPathD(inner);
    };
    const ix = animX.addListener(({ value }) => {
      animVals.current.x = value;
      update();
    });
    const iy = animY.addListener(({ value }) => {
      animVals.current.y = value;
      update();
    });
    const iw = animWidth.addListener(({ value }) => {
      animVals.current.w = value;
      update();
    });
    const ih = animHeight.addListener(({ value }) => {
      animVals.current.h = value;
      update();
    });
    const ir = animRx.addListener(({ value }) => {
      animVals.current.rx = value;
      update();
    });
    return () => {
      animX.removeListener(ix);
      animY.removeListener(iy);
      animWidth.removeListener(iw);
      animHeight.removeListener(ih);
      animRx.removeListener(ir);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usePathRendering, screenWidth, screenHeight, animX, animY, animWidth, animHeight, animRx]);

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
      setOverlayPathD(buildOverlayPath(shapeResult.d));
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
      animVals.current = {
        x: shapeResult.x,
        y: shapeResult.y,
        w: shapeResult.width,
        h: shapeResult.height,
        rx: shapeResult.rx,
      };
      const inner = roundedRectSubpath(
        shapeResult.x,
        shapeResult.y,
        shapeResult.width,
        shapeResult.height,
        shapeResult.rx
      );
      setOverlayPathD(buildOverlayPath(inner));
      // Same source as the dark hole — keeps the pulse border in lockstep.
      setPathD(inner);
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

  // No target (centered / no-spotlight step): render a plain dimmed backdrop so
  // the screen is still dimmed and the press handler stays available, instead of
  // an invisible modal that traps the user. The tooltip renders above this.
  if (!target || !shapeResult || !bounds) {
    return (
      <Pressable
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: overlayColor, opacity: overlayOpacity },
        ]}
        onPress={onBackdropPress}
      />
    );
  }

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
              <Svg height={coverHeight} width={coverWidth}>
                <Defs>
                  <Mask id={maskIds.inverse}>
                    <Rect x="0" y="0" width={coverWidth} height={coverHeight} fill="white" />
                    {renderCutout('black')}
                  </Mask>
                </Defs>
                <Rect
                  x="0"
                  y="0"
                  width={coverWidth}
                  height={coverHeight}
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

        {/* Main dark overlay: full screen with the spotlight punched out as a
            true hole via an even-odd path (Fabric-safe; no <Mask>). Sized to the
            physical screen so it covers the whole Modal (incl. the Android
            nav-bar area), not just the window. */}
        <Svg height={coverHeight} width={coverWidth} style={StyleSheet.absoluteFill}>
          <Path
            d={overlayPathD}
            fill={overlayColor}
            fillOpacity={overlayOpacity}
            fillRule="evenodd"
          />
        </Svg>
      </Pressable>

      {/* Pulse border overlay — driven by the SAME `pathD` state as the dark
          cutout (set together in the same render), so the pulse outline and the
          transparent hole always animate as one and never drift apart. */}
      {enablePulse ? (
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: pulseOpacity }]}
          pointerEvents="none"
        >
          <Svg height={coverHeight} width={coverWidth}>
            <Path d={pathD} fill="none" stroke={pulseColor} strokeWidth={pulseWidth} />
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
