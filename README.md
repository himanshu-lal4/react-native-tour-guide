# React Native Tour Guide

A lightweight React Native library for building app tours, walkthroughs, and coach marks. The spotlight automatically matches your component's shape — circles stay circular, pills stay pill-shaped, no manual configuration needed.

Works with Expo and React Native CLI. Zero native dependencies. New Architecture ready.

[![npm version](https://img.shields.io/npm/v/@wrack/react-native-tour-guide.svg?style=flat-square)](https://www.npmjs.com/package/@wrack/react-native-tour-guide)
[![npm downloads](https://img.shields.io/npm/dm/@wrack/react-native-tour-guide.svg?style=flat-square)](https://www.npmjs.com/package/@wrack/react-native-tour-guide)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/himanshu-lal4/react-native-tour-guide/blob/main/LICENSE)
[![platforms](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg?style=flat-square)](https://github.com/himanshu-lal4/react-native-tour-guide)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/himanshu-lal4/react-native-tour-guide/blob/main/CONTRIBUTING.md)
[![good first issues](https://img.shields.io/github/issues/himanshu-lal4/react-native-tour-guide/good%20first%20issue?style=flat-square&label=good%20first%20issues&color=7057ff)](https://github.com/himanshu-lal4/react-native-tour-guide/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

<table>
  <tr>
    <td align="center">
      <img src="https://raw.githubusercontent.com/himanshu-lal4/react-native-tour-guide/main/IOSDemo.gif" alt="iOS tour guide demo showing spotlight walkthrough" width="300" />
      <br /><sub><b>iOS</b></sub>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/himanshu-lal4/react-native-tour-guide/main/AndroidDemo.gif" alt="Android tour guide demo showing spotlight walkthrough" width="300" />
      <br /><sub><b>Android</b></sub>
    </td>
  </tr>
</table>

---

## What does this library do?

It creates an overlay that highlights specific components in your app and shows tooltips explaining each one. You define a list of steps (which component to highlight, what to say), call `startTour()`, and the library handles everything else — measuring elements, positioning tooltips, scrolling to off-screen targets, animating between steps, and matching the spotlight shape to each component's border radius.

## How is it different from other tour libraries?

| Capability | This library | Alternatives |
|---|---|---|
| Auto shape matching | Spotlight matches target's border radius automatically | Manual shape selection |
| Auto-scroll | Scrolls to ensure target + tooltip both fit on screen | Manual or none |
| Smart tooltip positioning | Auto-detects best position, never renders off-screen | Manual per step |
| Theme presets | 4 built-in + `createTheme()` API | None |
| Per-corner border radius | Extracted automatically from `targetStyle` | Not supported |
| Pulse animation | Configurable animated spotlight border | Not supported |
| Pause/Resume | Built-in state preservation | Not supported |
| Tour persistence | Built-in "show only once" hook | DIY |
| Conditional steps | `active` flag with auto-renumbering | Filter manually |
| Bundle size | < 50KB, zero native dependencies | > 200KB |

---

## Installation

```bash
npm install @wrack/react-native-tour-guide react-native-svg
```

Or with Expo:
```bash
npx expo install @wrack/react-native-tour-guide react-native-svg
```

Also works with `yarn add` and `pnpm add`.

### Optional dependencies

These are only needed for enhanced visual effects:

```bash
# Blur effect
npm install @react-native-community/blur

# Gradient overlay
npm install react-native-linear-gradient

# Advanced blur masking
npm install @react-native-masked-view/masked-view
```

---

## Quick start

### 1. Wrap your app

```tsx
import { TourGuideProvider, TourGuideOverlay } from '@wrack/react-native-tour-guide';

export default function App() {
  return (
    <TourGuideProvider>
      <YourApp />
      <TourGuideOverlay />
    </TourGuideProvider>
  );
}
```

### 2. Start a tour

```tsx
import { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTourGuide } from '@wrack/react-native-tour-guide';

function HomeScreen() {
  const { startTour } = useTourGuide();
  const buttonRef = useRef(null);
  const avatarRef = useRef(null);

  const handleStart = () => {
    startTour([
      {
        id: 'welcome',
        targetRef: buttonRef,
        title: 'Welcome',
        description: 'Tap here to get started.',
        targetStyle: styles.button, // spotlight matches button's border radius
      },
      {
        id: 'avatar',
        targetRef: avatarRef,
        title: 'Your Profile',
        description: 'Tap to view your profile.',
        targetStyle: styles.avatar, // circular target gets circular spotlight
      },
    ]);
  };

  return (
    <View>
      <Pressable ref={buttonRef} style={styles.button} onPress={handleStart}>
        <Text>Start Tour</Text>
      </Pressable>
      <View ref={avatarRef} style={styles.avatar} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 12, padding: 16, backgroundColor: '#007AFF' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ccc' },
});
```

That's it. The spotlight around the button will have 12px rounded corners. The spotlight around the avatar will be a perfect circle.

---

## How does auto shape matching work?

Pass the same style you use on the component as `targetStyle` on the step. The library reads the `borderRadius` properties from that style and applies them to the spotlight.

- **Fully rounded** elements (where `borderRadius >= min(width, height) / 2`) stay fully rounded even when the spotlight is slightly larger
- **Per-corner radii** (`borderTopLeftRadius`, etc.) are preserved exactly — the spotlight matches the asymmetric shape
- **Partial radii** (like `borderRadius: 12` on a card) stay at exactly 12px on the spotlight

```tsx
// Chat bubble with asymmetric corners
const chatStyle = {
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  borderBottomRightRadius: 16,
  borderBottomLeftRadius: 4,
};

{ id: 'chat', targetRef: chatRef, targetStyle: chatStyle, title: '...', description: '...' }
// Spotlight will have 16px on top-left, top-right, bottom-right and 4px on bottom-left
```

You can also override the border radius manually:

```tsx
// Uniform override
{ id: 'step', targetRef: ref, spotlightBorderRadius: 20, title: '...', description: '...' }
```

Priority: `spotlightBorderRadius` > auto-extracted from `targetStyle` > default (12px).

---

## How to enable auto-scroll?

Set `scrollRef` on the tour config. The library automatically scrolls to ensure both the target and its tooltip are fully visible.

```tsx
const scrollViewRef = useRef(null);
const [scrollY, setScrollY] = useState(0);

startTour(steps, {
  scrollRef: scrollViewRef,
  getCurrentScrollOffset: () => scrollY,
});

// In your JSX:
<ScrollView
  ref={scrollViewRef}
  onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
  scrollEventThrottle={16}
>
  {/* your content */}
</ScrollView>
```

You can also set `scrollToTarget` per step for fine-grained control:

```tsx
{
  id: 'far-down',
  targetRef: ref,
  title: 'Scroll Target',
  description: '...',
  scrollToTarget: {
    scrollRef: scrollViewRef,
    offset: 50,
    animated: true,
    getCurrentScrollOffset: () => scrollY,
  },
}
```

---

## How to use themes?

Four built-in themes are included. Spread them into your config:

```tsx
import { darkTheme, lightTheme, minimalTheme, vibrantTheme } from '@wrack/react-native-tour-guide';

startTour(steps, { ...darkTheme });
```

Create a custom theme with `createTheme()`:

```tsx
import { createTheme } from '@wrack/react-native-tour-guide';

const brandTheme = createTheme({
  tooltipStyles: { primaryButtonColor: '#FF6B35', backgroundColor: '#1B1B3A' },
  spotlightStyles: { overlayOpacity: 0.7 },
});

startTour(steps, { ...brandTheme });
```

---

## How to add pulse animation?

```tsx
startTour(steps, {
  spotlightStyles: {
    enablePulse: true,
    pulseColor: '#00BFFF',
    pulseWidth: 3,
    pulseDuration: 1200,
    pulseMinOpacity: 0.3,
    pulseMaxOpacity: 0.9,
  },
});
```

---

## How to show a tour only once?

Use the `useTourPersistence` hook with any storage backend:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTourPersistence } from '@wrack/react-native-tour-guide';

function MyScreen() {
  const { startTour, resetTour } = useTourPersistence(AsyncStorage);

  useEffect(() => {
    // Automatically skips if user already completed this tour
    startTour(steps, { tourId: 'onboarding' });
  }, []);

  // Force show again
  const showAgain = async () => {
    await resetTour('onboarding');
    startTour(steps, { tourId: 'onboarding' }, true);
  };
}
```

Works with MMKV too:

```tsx
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();

const adapter = {
  getItem: (key) => storage.getString(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};

const { startTour } = useTourPersistence(adapter);
```

---

## How to use conditional steps?

Set `active: false` to hide a step. Numbering adjusts automatically.

```tsx
const isPremium = useIsPremium();

startTour([
  { id: 'welcome', targetRef: welcomeRef, title: 'Welcome', description: '...' },
  {
    id: 'upgrade',
    targetRef: upgradeRef,
    title: 'Upgrade',
    description: 'Only shown to free users.',
    active: !isPremium,
  },
  { id: 'done', targetRef: doneRef, title: 'All Set', description: '...' },
]);
```

---

## How to handle backdrop taps?

```tsx
startTour([
  {
    id: 'step1',
    targetRef: ref,
    title: 'Tap anywhere',
    description: 'Tapping the dark overlay advances to the next step.',
    backdropBehavior: 'next', // 'dismiss' | 'next' | 'none' | () => void
  },
]);

// Or set globally
startTour(steps, { defaultBackdropBehavior: 'next' });
```

---

## How to pause and resume a tour?

```tsx
const { pauseTour, resumeTour, isPaused } = useTourGuide();

// Pause when opening a modal
const handleModalOpen = () => pauseTour();

// Resume when it closes — picks up where it left off
const handleModalClose = () => resumeTour();
```

---

## How to use a custom tooltip?

```tsx
import type { TooltipProps } from '@wrack/react-native-tour-guide';

const MyTooltip = (props: TooltipProps) => (
  <View style={myStyles.tooltip}>
    <Text>{props.title}</Text>
    <Text>{props.description}</Text>
    <Pressable onPress={props.onNext}><Text>Continue</Text></Pressable>
  </View>
);

startTour(steps, {
  renderTooltip: (props) => <MyTooltip {...props} />,
});
```

---

## Programmatic control

```tsx
const {
  startTour, nextStep, prevStep, skipTour, endTour,
  goToStep, pauseTour, resumeTour,
  isActive, isPaused, currentStep, activeTourId,
} = useTourGuide();
```

---

## API reference

### TourStep

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | required | Unique step identifier |
| `targetRef` | `RefObject` | — | Ref to the component to highlight |
| `title` | `string` | required | Tooltip title |
| `description` | `string` | required | Tooltip body text |
| `tooltipPosition` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'auto'` | `'auto'` | Tooltip placement (auto-detected by default) |
| `targetStyle` | `ViewStyle` | — | Style to extract border radius from for shape matching |
| `spotlightPadding` | `number` | `0` | Extra padding around the spotlight |
| `spotlightBorderRadius` | `number` | — | Override border radius (takes priority over targetStyle) |
| `scrollToTarget` | `ScrollToTargetConfig` | — | Per-step scroll configuration |
| `active` | `boolean` | `true` | Whether this step is included |
| `backdropBehavior` | `BackdropBehavior` | `'none'` | What happens on backdrop tap |
| `autoAdvance` | `number` | `0` | Auto-advance after ms (0 = disabled) |
| `delayBefore` | `number` | `0` | Delay before showing step |
| `onNext` | `() => void` | — | Called on next |
| `onPrev` | `() => void` | — | Called on previous |
| `onSkip` | `() => void` | — | Called on skip |
| `onSpotlightPress` | `() => void` | — | Called when spotlight area is tapped |
| `hideNextButton` | `boolean` | `false` | Hide the next/done button |
| `hidePrevButton` | `boolean` | `false` | Hide the back button |
| `hideSkipButton` | `boolean` | `false` | Hide the skip button |
| `accessibilityLabel` | `string` | — | Custom screen reader label |

### TourGuideConfig

| Property | Type | Default | Description |
|---|---|---|---|
| `tooltipStyles` | `TooltipStyles` | — | Tooltip appearance |
| `spotlightStyles` | `SpotlightStyles` | — | Spotlight/overlay appearance |
| `scrollRef` | `RefObject` | — | ScrollView ref for auto-scrolling |
| `getCurrentScrollOffset` | `() => number` | — | Returns current scroll Y position |
| `showProgressDots` | `boolean` | `false` | Show dot indicators |
| `showStepCounter` | `boolean` | `true` | Show "1/5" counter |
| `enableBackButton` | `boolean` | `true` | Show back button |
| `nextButtonText` | `string` | `'Next'` | Next button label |
| `prevButtonText` | `string` | `'Back'` | Back button label |
| `skipButtonText` | `string` | `'Skip'` | Skip button label |
| `doneButtonText` | `string` | `'Done'` | Done button label |
| `animationDuration` | `number` | `300` | Transition duration (ms) |
| `tooltipWidth` | `number` | `320` | Tooltip width (px) |
| `tourId` | `string` | — | Tour identifier (for persistence) |
| `autoPositionTooltip` | `boolean` | — | Enable smart positioning |
| `defaultBackdropBehavior` | `BackdropBehavior` | `'none'` | Global backdrop behavior |
| `renderTooltip` | `(props) => ReactNode` | — | Custom tooltip renderer |
| `onTourStart` | `() => void` | — | Called when tour starts |
| `onTourEnd` | `(completed: boolean) => void` | — | Called when tour ends |
| `onStepChange` | `(from, to) => void` | — | Called on step change |
| `beforeStepChange` | `(from, to) => boolean \| Promise<boolean>` | — | Gate before step change |
| `enableAccessibility` | `boolean` | `true` | Enable screen reader announcements |

### SpotlightStyles

| Property | Type | Default | Description |
|---|---|---|---|
| `overlayOpacity` | `number` | `0.6` | Overlay darkness (0-1) |
| `overlayColor` | `string` | `'black'` | Overlay color |
| `enableBlur` | `boolean` | `false` | Blur effect (requires optional dep) |
| `blurAmount` | `number` | `4` | Blur intensity |
| `enableGradient` | `boolean` | `false` | Gradient overlay |
| `gradientColors` | `string[]` | — | Gradient color stops |
| `enablePulse` | `boolean` | `false` | Pulsing spotlight border |
| `pulseColor` | `string` | `'#FFFFFF'` | Pulse color |
| `pulseWidth` | `number` | `2` | Pulse border width (px) |
| `pulseDuration` | `number` | `1500` | Full pulse cycle (ms) |
| `pulseMinOpacity` | `number` | `0.2` | Pulse min opacity |
| `pulseMaxOpacity` | `number` | `0.8` | Pulse max opacity |

### TooltipStyles

| Property | Type | Default | Description |
|---|---|---|---|
| `backgroundColor` | `string` | `'#2C2C2E'` | Tooltip background |
| `borderRadius` | `number` | `16` | Tooltip corner radius |
| `titleColor` | `string` | `'#FFFFFF'` | Title text color |
| `descriptionColor` | `string` | `'#FFFFFF'` | Description text color |
| `buttonTextColor` | `string` | `'#FFFFFF'` | Button text color |
| `primaryButtonColor` | `string` | `'#007AFF'` | Next/Done button background |
| `secondaryButtonColor` | `string` | `'#3A3A3C'` | Back button background |
| `skipButtonColor` | `string` | `'#FFFFFF'` | Skip button color |

---

## Troubleshooting

**Tour not showing?**
- Ensure `TourGuideOverlay` is placed after your main content inside the provider
- Check that the target ref is attached to a mounted component
- Add `delayBefore: 500` if the component needs time to render

**Spotlight position wrong?**
- The component must be visible on screen when measured
- Check for transforms or absolute positioning that might affect measurement
- Use `scrollRef` on the config to ensure off-screen elements are scrolled into view

**Tooltip overlapping target?**
- Set `tooltipPosition: 'auto'` (default) for automatic placement
- The library checks available space on all sides and picks the best position

---

## Best practices

1. Keep tours short — 3-7 steps for best engagement
2. Always allow skipping — never trap users
3. Use `targetStyle` — let the spotlight match automatically instead of manual configuration
4. Set `scrollRef` globally — handles all scroll scenarios without per-step config
5. Use `tourId` with `useTourPersistence` — show tours only once
6. Use `delayBefore` instead of `setTimeout` — the library handles timing
7. Use `active` for conditional steps — numbering adjusts automatically
8. Test with VoiceOver/TalkBack — accessibility is enabled by default

---

## Frequently asked questions

### Does it work with Expo?

Yes. It works with Expo (managed and bare) and React Native CLI. The only required dependency is `react-native-svg`, which Expo supports out of the box.

### Does it support the New Architecture (Fabric)?

Yes. The dark overlay is drawn with a single even-odd SVG path (a real punched-out hole) rather than an SVG `<Mask>`, so the spotlight renders correctly on both the old architecture and Fabric, with no white film over the highlighted element.

### Does it work with `ScrollView`, `FlatList`, and `SectionList`?

Yes. Pass a `scrollRef` (and a `getCurrentScrollOffset` getter) on the config and the tour scrolls off-screen targets into view automatically, keeping both the target and its tooltip on screen.

### What are the dependencies and bundle size?

The library itself is under 50KB and has **zero native dependencies** — only `react-native-svg` as a peer. Blur and gradient effects are fully optional and load lazily only if you install them, degrading gracefully to the standard overlay otherwise.

### Is it written in TypeScript?

Yes — it ships with full TypeScript types for every step option, config field, and theme.

### How does it compare to react-native-copilot or rn-tourguide?

All three highlight UI elements with tooltips. This library additionally matches the spotlight shape to each target's border radius automatically (circles, pills, per-corner radii), auto-scrolls so the target *and* tooltip both fit on screen, and ships zero native dependencies — so it runs in Expo Go without a custom dev build.

### Can I show a tour only once per user?

Yes — use the `useTourPersistence` hook with any storage backend (AsyncStorage, MMKV, or a custom adapter). See [How to show a tour only once?](#how-to-show-a-tour-only-once).

---

## Roadmap & help wanted

Contributions are welcome — these are good places to start. Open an issue to claim one or propose your own:

- `expo-blur` support so the blur overlay renders in Expo Go (today blur requires `@react-native-community/blur`)
- A `renderOverlay` escape hatch for fully custom backdrops
- Per-step tooltip theming (different tooltip styles per step)
- More built-in themes and a theme gallery
- Additional examples (drawer/tab navigators, modals, lists)
- Docs, tests, and bug fixes of any size

Browse [good first issues](https://github.com/himanshu-lal4/react-native-tour-guide/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [open a discussion](https://github.com/himanshu-lal4/react-native-tour-guide/discussions).

---

## Contributing & community

Issues, ideas, and pull requests of every size are welcome — bug reports and docs improvements help just as much as features.

- 🐛 [Report a bug](https://github.com/himanshu-lal4/react-native-tour-guide/issues/new?template=bug_report.yml)
- 💡 [Request a feature](https://github.com/himanshu-lal4/react-native-tour-guide/issues/new?template=feature_request.yml)
- 💬 [Ask a question / share an idea](https://github.com/himanshu-lal4/react-native-tour-guide/discussions)
- 🔧 [Submit a pull request](https://github.com/himanshu-lal4/react-native-tour-guide/pulls)
- ⭐ Star the repo to help others discover it

New to the project? Read [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, the project structure, and the development workflow.

## License

MIT — see [LICENSE](LICENSE).

---

Created by [Himanshu Lal](https://github.com/himanshu-lal4)
