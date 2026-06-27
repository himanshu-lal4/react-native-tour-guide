# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-27

First stable release — a production-ready tour-guide toolkit for React Native with auto shape-matching spotlights, smart auto-scroll, theming, accessibility, and a declarative API.

### Fixed

- **Android overlay coverage** — the dark backdrop now covers the full screen including the navigation-bar area. The overlay Modal uses `navigationBarTranslucent` and the backdrop is sized to the physical screen, removing the undimmed strip at the bottom.
- **Reliable auto-scroll** — the spotlight is re-measured by polling until the scroll settles, so it lands on the target's final position instead of a mid-scroll one (fixes the tooltip being "left behind" / the cutout going off-screen).
- **Flicker-free scrolling** — the highlight is hidden while the tour auto-scrolls and revealed once it settles, while still animating (morphing) into place on reveal.
- **Pulse / cutout sync** — the pulse border and the dark cutout now animate in lockstep (previously the pulse moved while the cutout lagged behind).

### Added

#### Auto Shape Matching
- `targetStyle` prop on TourStep: pass the same style applied to your target View and border radii are auto-extracted
- Supports per-corner border radius (`borderTopLeftRadius`, etc.) — automatically generates an SVG `<Path>` with per-corner arcs
- Equal corners use `<Rect>` for smooth animation; mixed corners use `<Path>`
- Radii are clamped to half the smallest dimension to prevent overflow
- Priority: explicit `spotlightBorderRadius` (number) > extracted from `targetStyle` > default (12)
- Exported `extractBorderRadius(style)`, `computeShape`, `isRectFamily`, `isPathFamily` utilities and `ShapeBounds`, `ShapeResult`, `CustomPathGenerator` types

#### Theme Presets
- Four built-in theme presets: `darkTheme`, `lightTheme`, `minimalTheme`, `vibrantTheme`
- Each theme provides coordinated `tooltipStyles` and `spotlightStyles`
- `createTheme(overrides)` helper for custom themes from the dark base; `TourTheme` type exported

#### Animated Spotlight
- Smooth morphing animation between steps via React Native's built-in `Animated` API; configurable `config.animationDuration`
- Optional pulsing glow border: `enablePulse`, `pulseColor`, `pulseWidth`, `pulseDuration`, `pulseMinOpacity`, `pulseMaxOpacity` (zero impact when disabled)

#### Smart Auto-Scroll & Positioning
- `scrollRef` + `getCurrentScrollOffset` config to auto-scroll off-screen targets into view
- `tooltipPosition: 'auto'` per step (or `config.autoPositionTooltip`) picks the best side and stays within safe-area insets
- Exported `computeTooltipPosition` utility; `insets` / `extraInsets` config

#### Lifecycle, Persistence & Control
- Lifecycle events: `onTourStart`, `onTourEnd(completed)`, `onStepChange(from, to)`, async `beforeStepChange(from, to)` gate
- `useTourPersistence(storage)` hook for "show only once" via a `TourStorage` adapter (AsyncStorage, MMKV, custom)
- Conditional steps via `active` flag with auto-renumbering; `pauseTour()`/`resumeTour()`; `config.tourId` for multiple tours
- Per-step `backdropBehavior` (`'dismiss'` | `'next'` | `'none'` | function) + global default; `onSpotlightPress`
- Per-step `hideNextButton`/`hidePrevButton`/`hideSkipButton`, `delayBefore`, `autoAdvance`; `goToStep(index)`

#### Accessibility
- VoiceOver / TalkBack announcements on step changes; `accessibilityRole="alert"` tooltip with `accessibilityLiveRegion="polite"`
- Proper roles/labels on all buttons; per-step `accessibilityLabel`; configurable via `config.enableAccessibility` and `config.accessibilityLabelPrefix`

#### Configurable Layout
- `config.tooltipWidth` (320), `config.triangleSize` (12), `config.tooltipOffset` (8), `config.safeZoneOffset` (120)

### Changed

- README rewritten for discoverability (Q&A / FAQ structure, comparison, examples) and added `llms.txt`
- Context value memoized; default object props hoisted to stable constants
- Orientation changes handled via `Dimensions.addEventListener`; ref validation with retry

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
- Programmatic tour control and step callbacks (onNext, onPrev, onSkip)
- Context-based state management

---

## [Unreleased]

### Planned

- [ ] Gesture-based navigation (swipe between steps)
- [ ] Video/GIF support in tooltips
- [ ] Analytics integration helpers

---

[1.0.0]: https://github.com/himanshu-lal4/react-native-tour-guide/releases/tag/v1.0.0
[0.1.0]: https://github.com/himanshu-lal4/react-native-tour-guide/releases/tag/v0.1.0
