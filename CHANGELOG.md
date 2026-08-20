# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Stability, compatibility and diagnostics pass, plus the declarative / headless / interactive API expansion. No breaking changes to the JS API — but note one **install-time breaking change**: peer dependency ranges were narrowed from `react: *` / `react-native: *` to `react >=18` / `react-native >=0.71` (the code has required these all along — e.g. `gap` styles — so the old ranges were dishonest, not permissive). Apps on older React/RN will now get an install error instead of a runtime break. **Ship this as a major version bump.**

### Added — orchestration & spotlight control

- **Named tours** — `defineTour(id, steps, config)` registers tours up front; `startTour('id')` starts them from anywhere (with optional config overrides merged over the stored config); `removeTour(id)` unregisters.
- **`canStartTour(idOrSteps)`** — true once every `targetId` a tour references has its `<TourTarget>` registered, so tours can be started exactly when async screens are ready.
- **`targetRegion`** — highlight a fixed window rectangle with no ref at all (maps, camera views, canvases). Skips measurement entirely.
- **Motion presets** — `motion: 'morph' | 'bounce' | 'fade' | 'none'` on the config or per step controls how the spotlight travels between steps.
- **`spotlightStyles.maskPath`** — return any SVG subpath and it becomes the spotlight hole; the escape hatch for arbitrary highlight shapes. A throwing function falls back to the automatic shape.

### Changed — performance

- **No more per-frame re-renders during spotlight transitions** — path data is written straight to the native SVG nodes via `setNativeProps` while animating (state is committed once at the end); falls back to state updates where unavailable. Invisible on a flagship, very visible on a low-end Android.

### Added — declarative & headless API

- **`<TourTarget id="...">`** — declaratively mark tour targets by wrapping them; steps reference them via `targetId` instead of threading refs. The wrapper sets `collapsable={false}` (so Android view flattening can't produce an unmeasurable 0×0 target) and its `style` drives spotlight shape matching. Targets that mount after the tour starts are waited for briefly before falling back to a centered tooltip.
- **Interactive steps** — `overlayMode: 'inline'` renders the overlay without a Modal, and `interactive: true` on a step leaves the spotlight hole touch-transparent so users can tap the real element being highlighted. Backdrop taps still work via press bands around the hole.
- **Progress gating** — `completed: false` on a step disables the Next button until `setStepCompleted(stepId, true)` is called; pair with `hideSkipButton` for required steps.
- **`before()` per step** — an awaited hook that runs before the step is measured: navigate, open a sheet, or fetch, and the spotlight only appears once it resolves. Errors warn (dev only) and the step still shows.
- **Component slots** — `config.components` accepts `NextButton`, `PrevButton`, `SkipButton`, `StepCounter` and `ProgressDots` replacements so one piece can be restyled without rebuilding the whole tooltip.
- **Per-step `renderTooltip`** — overrides the config-level renderer for a single step.
- **`TooltipProps` is documented as the stable headless contract**, now including `nextDisabled` and `isLastStep`.
- **Per-side `spotlightPadding`** — `{ top, right, bottom, left }` in addition to a uniform number.
- **`allowFontScaling` / `maxFontSizeMultiplier`** config for tooltip text.

### Fixed — additional hardening

- **`getCurrentScrollOffset` is now optional** — without it the auto-scroll destination is derived from the target's position inside the scroll content via `measureLayout`, eliminating the silent mis-scroll when the getter was forgotten.
- **Measurement watchdog** — if a target's measure callback never fires at all (detached nodes, exotic hosts), the step now falls back to a centered tooltip after a grace period instead of trapping the user behind the backdrop indefinitely.
- **Readable-by-default tooltips** — when a custom `tooltipStyles.backgroundColor` is light, default title/description/skip colors flip to dark automatically instead of rendering invisible white-on-white.
- **Shrink-to-fit tooltips** — the tooltip body is capped to the space inside the safe-area insets and long descriptions scroll inside it instead of running off-screen.


### Fixed

- **`FlatList` / `SectionList` auto-scroll crashed** — auto-scroll called `scrollTo()` on whatever `scrollRef` it was given, which only `ScrollView` implements. Passing a `FlatList` ref (documented as supported) threw `scrollTo is not a function`. Scrolling now detects the right method per scrollable: `scrollTo`, `scrollToOffset`, `getScrollResponder()`, `getScrollRef()`, `getNode()` and `scrollToPosition`, covering `ScrollView`, `FlatList`, `SectionList`, `Animated.ScrollView`, gesture-handler wrappers and `KeyboardAwareScrollView`. An unusable ref now warns and highlights the target in place instead of failing the step.
- **Users could get trapped behind the backdrop** — if a `targetRef` pointed at something with no measurement API (a custom component that doesn't forward its ref), the measurement callback never fired, so the overlay stayed up with no tooltip and, with the default `backdropBehavior: 'none'`, no way to dismiss it. Unmeasurable targets now fall back to a centered tooltip and explain why.
- **`measureInWindow` could throw** on a ref whose `.current` became null mid-measurement.
- **`autoAdvance` and screen-reader announcements never ran on centered steps** — both were gated on a measured target, which centered/no-target steps never have.
- **`beforeStepChange` blocked the Done button** — on the final step it was called with `to === from`, so a natural guard like `(from, to) => to > from` silently prevented the tour from ever finishing. It now receives `to === totalSteps` (one past the end).
- **`goToStep()` skipped `onStepChange`** — programmatic jumps were invisible to analytics and progress tracking. It now fires the event, ignores same-index jumps, and validates non-integer indices.
- **A stuck transition could permanently disable navigation** — a `beforeStepChange` promise that never settled left the lock engaged for every subsequent tour. `startTour()` now releases it.
- **Side tooltips ran off-screen** — `tooltipPosition: 'left' | 'right'` had no horizontal clamping, so a target near a screen edge pushed the tooltip partly or entirely out of view. Side placements are now clamped within the safe-area insets and shrink to fit.
- **The tooltip's own auto-positioning ignored safe-area insets**, so it could place itself under the status bar or behind the home indicator.
- **The Android navigation bar was covered inconsistently** — `navigationBarTranslucent` was set only when using a custom `renderTooltip`. Both paths now render through one `Modal`.
- Storage failures in `useTourPersistence` no longer surface as unhandled promise rejections, and a failed read no longer prevents the tour from showing.

### Added

- **Dev-time validation on every `startTour()`** — reports duplicate or missing step ids, empty titles/descriptions, a `targetRef` that isn't a ref object, invalid `tooltipPosition` values, negative padding, unreadably short `autoAdvance`, a `scrollRef` that isn't a ref, a missing `getCurrentScrollOffset`, and steps that hide every way to continue. Each warning names the step and the fix.
- **Integration diagnostics** — starting a tour with no `<TourGuideOverlay />` mounted, or with more than one, now warns instead of silently rendering nothing.
- **CommonJS build** alongside the ESM build, with `require`/`import` export conditions and per-format type definitions. `require()` and consumer Jest setups now work without extra configuration.

### Changed

- **Warnings are stripped from production builds** and de-duplicated in development, so they no longer reach consumers' release logs.
- **Honest peer-dependency ranges** — `react-native: >=0.71`, `react: >=18` (previously `*`, which claimed support for every version ever released). Optional peers (`react-native-safe-area-context`, blur, gradient, masked-view) are now declared properly rather than listed in `peerDependenciesMeta` with no matching entry.
- `autoPositionTooltip` is documented as defaulting to `true` (matching long-standing behaviour), and setting it to `false` now fully honours each step's explicit `tooltipPosition`.
- Example type definitions are no longer emitted into the published build.

---

## [1.0.1] - 2026-06-27

### Changed

- README: show explicit install commands for npm, yarn, pnpm, and Expo.

### Removed

- GitHub release workflow (`.github/workflows/release.yml`); releases are now published manually with `npm publish`.

---

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

## Planned

- [ ] Gesture-based navigation (swipe between steps)
- [ ] Video/GIF support in tooltips
- [ ] Analytics integration helpers

---

[1.0.1]: https://github.com/himanshu-lal4/react-native-tour-guide/releases/tag/v1.0.1
[1.0.0]: https://github.com/himanshu-lal4/react-native-tour-guide/releases/tag/v1.0.0
[0.1.0]: https://github.com/himanshu-lal4/react-native-tour-guide/releases/tag/v0.1.0
