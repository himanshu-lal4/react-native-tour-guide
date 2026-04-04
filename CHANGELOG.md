# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-04

### Added

#### Theme Presets
- Four built-in theme presets: `darkTheme`, `lightTheme`, `minimalTheme`, `vibrantTheme`
- Each theme provides coordinated `tooltipStyles` and `spotlightStyles`
- `createTheme(overrides)` helper for creating custom themes from the dark base
- Themes are plain objects — spread into config with optional per-property overrides
- New `TourTheme` type exported for custom theme authoring

#### Dynamic Spotlight Shapes
- 9 spotlight shapes: `rectangle`, `circle`, `ellipse`, `pill`, `triangle`, `diamond`, `hexagon`, `star`, `custom`
- Rect-family shapes (rectangle, circle, ellipse, pill) animate smoothly between steps
- Path-family shapes (triangle, diamond, hexagon, star, custom) snap to position with SVG Path rendering
- `customSpotlightPath` prop on TourStep for user-defined SVG path shapes
- New `src/shapes.ts` module with exported `computeShape`, `isRectFamily`, `isPathFamily` utilities
- `ShapeBounds`, `ShapeResult`, `CustomPathGenerator` types exported for custom shape authoring
- `targetStyle` prop on TourStep: pass the same style applied to your target View and border radii are auto-extracted
- Supports per-corner border radius (`borderTopLeftRadius`, etc.) — automatically generates SVG `<Path>` with per-corner arcs
- When all corners are equal, uses `<Rect>` for smooth animation; mixed corners use `<Path>`
- Radii are automatically clamped to half the smallest dimension to prevent overflow
- Priority: explicit `spotlightBorderRadius` (number) > extracted from `targetStyle` > default (12)
- Exported `extractBorderRadius(style)` utility for custom implementations

#### React Native Web Support
- Full compatibility with `react-native-web` (>=0.19.0)
- Cross-platform element measurement using `getBoundingClientRect` on web, `measureInWindow` on native
- Platform-safe accessibility: `announceForAccessibility` guarded on web (relies on ARIA live regions instead)
- Web-appropriate accessibility hints via `Platform.select` with `default` fallback
- StatusBar height calculations skipped on web
- Blur/gradient/masked-view gracefully degrade (not available on web)
- Added `react-native-web` as optional peer dependency

#### Animated Spotlight Pulse
- Optional pulsing glow border around the spotlight cutout
- Fully configurable: `enablePulse`, `pulseColor`, `pulseWidth`, `pulseDuration`, `pulseMinOpacity`, `pulseMaxOpacity`
- Renders as a separate animated SVG layer — zero impact when disabled
- Smooth looping opacity animation using `Animated.loop`

---

## [1.0.0] - 2026-04-04

### Production Release

The library is now production-ready with a comprehensive feature set, full accessibility support, and thorough test coverage.

### Added

#### Animated Spotlight Transitions
- Smooth morphing animation between steps using React Native's built-in `Animated` API
- Configurable animation duration via `config.animationDuration`
- No additional dependencies required

#### Tour Lifecycle Events
- `onTourStart` — called when a tour begins
- `onTourEnd(completed)` — called when a tour ends (completed vs skipped)
- `onStepChange(from, to)` — called on every step transition
- `beforeStepChange(from, to)` — async gate that can block navigation (return false to prevent)

#### Tour Persistence
- New `useTourPersistence(storage)` hook for "show only once" logic
- Works with any storage backend via `TourStorage` adapter interface
- Compatible with AsyncStorage, MMKV, or custom solutions
- Methods: `startTour`, `resetTour`, `isTourCompleted`, `markCompleted`

#### Smart Auto-Positioning
- `tooltipPosition: 'auto'` per step, or `config.autoPositionTooltip` globally
- Automatically detects available screen space and picks the best position
- Exported `computeTooltipPosition` utility for custom tooltip renderers

#### Conditional Steps
- `active` flag on TourStep — set to `false` to exclude a step
- Step numbering and progress automatically adjust
- `activeSteps` array exposed on context for filtered steps

#### Pause & Resume
- `pauseTour()` — hides overlay while preserving state
- `resumeTour()` — brings it back, re-measures targets
- `isPaused` state exposed on context

#### Multiple Tours
- `config.tourId` for tour identification
- `activeTourId` exposed on context
- Enables persistence, analytics, and multi-tour management

#### Backdrop & Spotlight Press
- Per-step `backdropBehavior`: `'dismiss'` | `'next'` | `'none'` | custom function
- Global default via `config.defaultBackdropBehavior`
- `onSpotlightPress` callback per step

#### Per-Step Button Control
- `hideNextButton`, `hidePrevButton`, `hideSkipButton` per step
- `delayBefore` — delay in ms before showing a step
- `autoAdvance` — auto-advance after specified ms

#### Accessibility
- VoiceOver and TalkBack announcements on step changes
- `accessibilityRole="alert"` on tooltip with `accessibilityLiveRegion="polite"`
- All buttons have proper `accessibilityRole` and descriptive labels
- Per-step `accessibilityLabel` override
- Configurable via `config.enableAccessibility` and `config.accessibilityLabelPrefix`

#### Navigation
- `goToStep(index)` — jump to any step programmatically

#### Configurable Layout
- `config.tooltipWidth` (default: 320)
- `config.triangleSize` (default: 12)
- `config.tooltipOffset` (default: 8)
- `config.safeZoneOffset` (default: 120)

### Changed

- Context value now wrapped in `useMemo` (prevents unnecessary re-renders)
- Default object props extracted to constants (prevents potential infinite render loops)
- `any` types replaced with proper `MeasurableRef` and `ScrollableRef` types
- Orientation changes now handled automatically via `Dimensions.addEventListener`
- Ref validation with retry logic (up to 3 attempts with 100ms delays)
- Double-tap prevention during async `beforeStepChange`
- ESLint configuration upgraded with comprehensive React, TypeScript, and clean code rules
- Prettier configuration standardized

### Removed

- "Under Active Development" warning from README
- Old `@eslint/compat` and `@react-native/eslint-config` dependencies (replaced with direct plugin setup)

---

## [0.1.0] - 2025-10-23

### Added

- Initial release of React Native Tour Guide
- Core tour guide functionality with spotlight and tooltips
- SVG-based spotlight overlay with customizable shapes (circle, rectangle)
- Fully customizable tooltip component with multiple positioning options
- Automatic scrolling support for off-screen elements
- Multi-step tour support with navigation controls
- TypeScript support with comprehensive type definitions
- Optional blur and gradient effects
- Custom tooltip renderer support
- Programmatic tour control
- Step callbacks (onNext, onPrev, onSkip)
- Context-based state management

---

## [Unreleased]

### Planned

- [ ] Gesture-based navigation (swipe between steps)
- [ ] Video/GIF support in tooltips
- [ ] Analytics integration helpers
- [x] Animated spotlight border pulse (added in 1.1.0)
- [x] Dark mode / Theme presets (added in 1.1.0)
- [x] React Native Web support (added in 1.1.0)
- [ ] React Native Web support

---

[1.1.0]: https://github.com/himanshu-lal4/react-native-tour-guide/releases/tag/v1.1.0
[1.0.0]: https://github.com/himanshu-lal4/react-native-tour-guide/releases/tag/v1.0.0
[0.1.0]: https://github.com/himanshu-lal4/react-native-tour-guide/releases/tag/v0.1.0
