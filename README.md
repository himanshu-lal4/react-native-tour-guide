<div align="center">
  <h1>🎯 React Native Tour Guide</h1>
  <p><strong>Create beautiful, interactive app tours and walkthroughs in minutes</strong></p>
  
  <p>
    <a href="https://www.npmjs.com/package/@wrack/react-native-tour-guide">
      <img src="https://img.shields.io/npm/v/@wrack/react-native-tour-guide.svg?style=flat-square" alt="npm version" />
    </a>
    <a href="https://www.npmjs.com/package/@wrack/react-native-tour-guide">
      <img src="https://img.shields.io/npm/dm/@wrack/react-native-tour-guide.svg?style=flat-square" alt="npm downloads" />
    </a>
    <a href="https://github.com/himanshu-lal4/react-native-tour-guide/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="license" />
    </a>
    <a href="https://github.com/himanshu-lal4/react-native-tour-guide">
      <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey.svg?style=flat-square" alt="platforms" />
    </a>
    <a href="https://expo.dev">
      <img src="https://img.shields.io/badge/Expo-compatible-blue.svg?style=flat-square" alt="expo compatible" />
    </a>
    <a href="https://github.com/reactwg/react-native-new-architecture">
      <img src="https://img.shields.io/badge/New%20Architecture-ready-green.svg?style=flat-square" alt="new architecture" />
    </a>
  </p>

  <p>
    A powerful and customizable React Native library for creating beautiful app tours, walkthroughs, and coach marks. <br />
    Packed with advanced features like SVG masking, smooth animations, fully customizable tooltips, automatic scrolling, and a declarative API.
  </p>

  <p>
    <strong>✅ Expo & React Native CLI</strong> • <strong>✅ New Architecture Ready</strong> • <strong>✅ Zero Native Dependencies</strong> • <strong>✅ React Native Web</strong>
  </p>
</div>

<br />

<div align="center">

### 🎬 See It In Action

<table>
  <tr>
    <td align="center">
      <img src="https://raw.githubusercontent.com/himanshu-lal4/react-native-tour-guide/main/IOSDemo.gif" alt="iOS Demo" width="300" />
      <br />
      <sub><b>iOS</b></sub>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/himanshu-lal4/react-native-tour-guide/main/AndroidDemo.gif" alt="Android Demo" width="300" />
      <br />
      <sub><b>Android</b></sub>
    </td>
  </tr>
</table>

</div>

<br />

---

<br />

## 🌟 Why Choose React Native Tour Guide?

<div align="center">

| Feature                    | This Library                 | Other Solutions       |
| -------------------------- | ---------------------------- | --------------------- |
| 🌐 **Web Support**         | React Native Web              | Not supported         |
| 🎯 **Setup Time**          | < 1 minute                   | 10-30 minutes         |
| 🎨 **Customization**       | Fully customizable           | Limited options       |
| 📱 **Platform Support**    | iOS & Android                | Platform specific     |
| 🚀 **Expo & CLI Support**  | Both supported               | Limited               |
| 🏗️ **New Architecture**    | Fully compatible             | Not supported         |
| 🔌 **Native Dependencies** | Zero (optional enhancements) | Multiple required     |
| 📦 **Bundle Size**         | Minimal (< 50KB)             | Heavy (> 200KB)       |
| 🎭 **Custom Components**   | Full support                 | Limited/None          |
| 🔄 **Auto Scrolling**      | Built-in                     | Manual implementation |
| 📚 **TypeScript**          | Full support                 | Partial/None          |
| 🌈 **Visual Effects**      | Optional (Blur, Gradient)    | None/Required         |
| ⚡ **Performance**         | Hardware accelerated         | CPU intensive         |
| 🎬 **Animated Transitions**| Smooth spotlight morphing     | Jump cuts / none      |
| 💾 **Tour Persistence**    | Built-in hook                | DIY boilerplate       |
| ♿ **Accessibility**       | VoiceOver & TalkBack         | None                  |
| ⏸️ **Pause/Resume**        | Built-in                     | Not supported         |
| 🧠 **Smart Positioning**   | Auto-detect best position    | Manual per step       |
| 🔀 **Conditional Steps**   | Built-in (active flag)       | Filter manually       |
| 🎨 **Theme Presets**       | 4 built-in + custom          | None                  |
| 💫 **Spotlight Pulse**     | Configurable animated pulse  | Not supported         |
| 🌐 **React Native Web**   | Full support                 | Not supported         |

</div>

<br />

---

<br />

## 📚 Table of Contents

- [🌟 Why Choose React Native Tour Guide?](#-why-choose-react-native-tour-guide)
- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [📖 Usage Examples](#-usage-examples)
  - [Multi-Step Tour](#multi-step-tour)
  - [Spotlight Shapes](#spotlight-shapes)
  - [Theme Presets](#theme-presets)
  - [Spotlight Pulse](#spotlight-pulse)
  - [Custom Styling](#custom-styling)
  - [Blur & Gradient Effects](#with-blur-and-gradient-effects)
  - [Automatic Scrolling](#automatic-scrolling)
  - [Callbacks & Lifecycle](#callbacks--lifecycle)
  - [Tour Persistence](#tour-persistence)
  - [Smart Auto-Positioning](#smart-auto-positioning)
  - [Conditional Steps](#conditional-steps)
  - [Backdrop & Spotlight Press](#backdrop--spotlight-press)
  - [Pause & Resume](#pause--resume)
  - [Custom Tooltip](#custom-tooltip-component)
  - [Programmatic Control](#programmatic-control)
  - [React Native Web](#react-native-web)
- [🎨 API Reference](#-api-reference)
- [🎯 Best Practices](#-best-practices)
- [💡 Tips & Tricks](#-tips--tricks)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Credits](#-credits)
- [🔍 Keywords](#-keywords)
- [📞 Support & Community](#-support--community)

<br />

## ✨ Features

<table>
  <tr>
    <td>
      🎯 <strong>Precise Spotlighting</strong><br/>
      <sub>Highlight any component with pixel-perfect accuracy</sub>
    </td>
    <td>
      🌟 <strong>Flexible Shapes</strong><br/>
      <sub>Circle or rectangle spotlight with customizable padding</sub>
    </td>
    <td>
      🎨 <strong>Fully Customizable</strong><br/>
      <sub>Style everything from colors to fonts to animations</sub>
    </td>
  </tr>
  <tr>
    <td>
      📱 <strong>Smart Positioning</strong><br/>
      <sub>Automatic tooltip positioning that stays on screen</sub>
    </td>
    <td>
      🔄 <strong>Auto Scrolling</strong><br/>
      <sub>Smart scroll-to-element with safe zone detection</sub>
    </td>
    <td>
      🌈 <strong>Blur & Gradient</strong><br/>
      <sub>Beautiful backdrop effects (optional dependencies)</sub>
    </td>
  </tr>
  <tr>
    <td>
      ⚡ <strong>Smooth Animations</strong><br/>
      <sub>Hardware-accelerated SVG masking</sub>
    </td>
    <td>
      📦 <strong>Tiny Bundle</strong><br/>
      <sub>Minimal core with optional enhancements</sub>
    </td>
    <td>
      🎭 <strong>Custom Renderers</strong><br/>
      <sub>Bring your own tooltip component</sub>
    </td>
  </tr>
  <tr>
    <td>
      📚 <strong>TypeScript</strong><br/>
      <sub>Full type definitions included</sub>
    </td>
    <td>
      🔌 <strong>Zero Native Code</strong><br/>
      <sub>Pure JavaScript implementation</sub>
    </td>
    <td>
      🚀 <strong>Easy Integration</strong><br/>
      <sub>Setup in less than 1 minute</sub>
    </td>
  </tr>
  <tr>
    <td>
      📱 <strong>Expo Compatible</strong><br/>
      <sub>Works with Expo & React Native CLI</sub>
    </td>
    <td>
      🏗️ <strong>New Architecture</strong><br/>
      <sub>Fully compatible with Fabric & TurboModules</sub>
    </td>
    <td>
      🎯 <strong>Production Ready</strong><br/>
      <sub>Battle-tested in real-world apps</sub>
    </td>
  </tr>
  <tr>
    <td>
      🎬 <strong>Animated Transitions</strong><br/>
      <sub>Smooth spotlight morphing between steps</sub>
    </td>
    <td>
      💾 <strong>Tour Persistence</strong><br/>
      <sub>Built-in "show only once" with any storage</sub>
    </td>
    <td>
      ♿ <strong>Accessibility</strong><br/>
      <sub>VoiceOver & TalkBack with auto-announcements</sub>
    </td>
  </tr>
  <tr>
    <td>
      ⏸️ <strong>Pause & Resume</strong><br/>
      <sub>Coordinate with modals and other overlays</sub>
    </td>
    <td>
      🧠 <strong>Smart Positioning</strong><br/>
      <sub>Auto-detect best tooltip placement</sub>
    </td>
    <td>
      🔀 <strong>Conditional Steps</strong><br/>
      <sub>Show/hide steps dynamically with correct numbering</sub>
    </td>
  </tr>
  <tr>
    <td>
      🎨 <strong>Theme Presets</strong><br/>
      <sub>4 built-in themes + custom theme builder</sub>
    </td>
    <td>
      💫 <strong>Spotlight Pulse</strong><br/>
      <sub>Animated pulsing border around spotlight</sub>
    </td>
    <td>
      🌐 <strong>React Native Web</strong><br/>
      <sub>Full web support via react-native-web</sub>
    </td>
  </tr>
</table>

## 📦 Installation

> **🎯 Works with both Expo and React Native CLI!**
>
> **✅ New Architecture Compatible** - Fully supports React Native's new architecture (Fabric & TurboModules)

<details open>
<summary><strong>NPM</strong></summary>

```bash
npm install @wrack/react-native-tour-guide react-native-svg
```

</details>

<details>
<summary><strong>Yarn</strong></summary>

```bash
yarn add @wrack/react-native-tour-guide react-native-svg
```

</details>

<details>
<summary><strong>pnpm</strong></summary>

```bash
pnpm add @wrack/react-native-tour-guide react-native-svg
```

</details>

<details>
<summary><strong>Expo</strong></summary>

```bash
npx expo install @wrack/react-native-tour-guide react-native-svg
```

> Works seamlessly with Expo managed workflow. No additional configuration needed!

</details>

<br />

### 🎨 Optional Dependencies

> **💡 Pro Tip:** The library works perfectly without these optional dependencies. Install them only if you want enhanced visual effects like blur and gradients.

<details>
<summary><strong>For Blur Effects</strong></summary>

```bash
npm install @react-native-community/blur
```

</details>

<details>
<summary><strong>For Gradient Overlays</strong></summary>

```bash
npm install react-native-linear-gradient
```

</details>

<details>
<summary><strong>For Advanced Blur Masking</strong></summary>

```bash
npm install @react-native-masked-view/masked-view
```

</details>

<br />

## 🚀 Quick Start

Get up and running in **less than 1 minute**!

<table>
  <tr>
    <td width="33%" align="center">
      <h3>1️⃣</h3>
      <h4>Wrap Your App</h4>
      <sub>Add Provider & Overlay</sub>
    </td>
    <td width="33%" align="center">
      <h3>2️⃣</h3>
      <h4>Add Refs</h4>
      <sub>Target components to highlight</sub>
    </td>
    <td width="33%" align="center">
      <h3>3️⃣</h3>
      <h4>Start Tour</h4>
      <sub>Call startTour with your steps</sub>
    </td>
  </tr>
</table>

<br />

### Step 1: Wrap Your App

```tsx
import {
  TourGuideProvider,
  TourGuideOverlay,
} from '@wrack/react-native-tour-guide';

export default function App() {
  return (
    <TourGuideProvider>
      <YourApp />
      <TourGuideOverlay />
    </TourGuideProvider>
  );
}
```

### Step 2: Create Your First Tour

```tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTourGuide } from '@wrack/react-native-tour-guide';

function WelcomeScreen() {
  const { startTour } = useTourGuide();
  const buttonRef = useRef(null);

  useEffect(() => {
    // Start the tour after the screen loads
    const timer = setTimeout(() => {
      startTour([
        {
          id: 'welcome',
          targetRef: buttonRef,
          title: 'Welcome! 👋',
          description:
            'This button does something amazing. Tap it to get started!',
          tooltipPosition: 'bottom',
          spotlightShape: 'rectangle',
        },
      ]);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View>
      <Pressable ref={buttonRef}>
        <Text>Get Started</Text>
      </Pressable>
    </View>
  );
}
```

<br />

> 🎉 **That's it!** Your first tour is ready. Check out the [Usage Examples](#-usage-examples) below for more advanced features.

## 📖 Usage Examples

### Multi-Step Tour

```tsx
const step1Ref = useRef(null);
const step2Ref = useRef(null);
const step3Ref = useRef(null);

startTour([
  {
    id: 'step1',
    targetRef: step1Ref,
    title: 'Dashboard',
    description: 'View all your stats here.',
    tooltipPosition: 'bottom',
  },
  {
    id: 'step2',
    targetRef: step2Ref,
    title: 'Quick Actions',
    description: 'Access common tasks quickly.',
    tooltipPosition: 'top',
  },
  {
    id: 'step3',
    targetRef: step3Ref,
    title: 'Profile',
    description: 'Manage your account settings.',
    tooltipPosition: 'left',
  },
]);
```

### Theme Presets

Use built-in themes for instant, coordinated styling:

```tsx
import { darkTheme, lightTheme, vibrantTheme } from '@wrack/react-native-tour-guide';

// Use a preset directly
startTour(steps, { ...darkTheme });

// Override specific values
startTour(steps, {
  ...vibrantTheme,
  tooltipStyles: { ...vibrantTheme.tooltipStyles, borderRadius: 24 },
});
```

Create custom themes based on the dark theme:

```tsx
import { createTheme } from '@wrack/react-native-tour-guide';

const brandTheme = createTheme({
  tooltipStyles: { primaryButtonColor: '#FF6B35', backgroundColor: '#1B1B3A' },
  spotlightStyles: { overlayOpacity: 0.7 },
});

startTour(steps, { ...brandTheme });
```

Available presets: `darkTheme`, `lightTheme`, `minimalTheme`, `vibrantTheme`.

### Spotlight Pulse

Add an animated pulsing border around the spotlight:

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

Combine with themes:

```tsx
import { vibrantTheme } from '@wrack/react-native-tour-guide';

startTour(steps, {
  ...vibrantTheme,
  spotlightStyles: {
    ...vibrantTheme.spotlightStyles,
    enablePulse: true,
    pulseColor: '#E94560',
  },
});
```

### Spotlight Shapes

Choose from 9 built-in shapes to match the visual appearance of your target elements:

```tsx
startTour([
  // Pill shape — perfect for buttons with fully rounded ends
  { id: 'btn', targetRef: buttonRef, title: 'Button', description: '...', spotlightShape: 'pill' },
  // Ellipse — oval that matches target dimensions
  { id: 'avatar', targetRef: avatarRef, title: 'Avatar', description: '...', spotlightShape: 'ellipse' },
  // Circle — equalized square bounding box
  { id: 'icon', targetRef: iconRef, title: 'Icon', description: '...', spotlightShape: 'circle' },
  // Diamond, triangle, hexagon, star
  { id: 'badge', targetRef: badgeRef, title: 'Badge', description: '...', spotlightShape: 'diamond' },
]);
```

**Auto-match a component's border radius** — just pass the same style:

```tsx
const styles = StyleSheet.create({
  card: { borderRadius: 20, borderBottomLeftRadius: 0, backgroundColor: '#fff' },
});

<View ref={cardRef} style={styles.card} />

// Library auto-extracts all border radius values from targetStyle
{
  id: 'card',
  targetRef: cardRef,
  targetStyle: styles.card,  // ← spotlight automatically matches the shape
  title: 'Card',
  description: 'Spotlight matches the exact border radius!',
}
```

Or specify radii manually:

```tsx
// Uniform radius
{ id: 'btn', targetRef: btnRef, title: 'Button', description: '...', spotlightBorderRadius: 20 }

// Per-corner radius
{
  id: 'sheet',
  targetRef: sheetRef,
  title: 'Bottom Sheet',
  description: 'Only top corners are rounded.',
  spotlightBorderRadius: { topLeft: 24, topRight: 24, bottomRight: 0, bottomLeft: 0 },
}
```

> Priority: explicit `spotlightBorderRadius` > auto-extracted from `targetStyle` > default (12)

Custom SVG path shapes:

```tsx
{
  id: 'custom',
  targetRef: myRef,
  title: 'Custom Shape',
  description: 'Any shape you want!',
  spotlightShape: 'custom',
  customSpotlightPath: ({ x, y, width, height }) => {
    // Return any valid SVG path string
    const cx = x + width / 2;
    return `M${cx},${y} L${x + width},${y + height} L${x},${y + height} Z`;
  },
}
```

Available shapes: `rectangle` (default), `circle`, `ellipse`, `pill`, `triangle`, `diamond`, `hexagon`, `star`, `custom`.

> **Note:** Rect-family shapes (rectangle, circle, ellipse, pill) animate smoothly between steps. Path-family shapes (triangle, diamond, hexagon, star, custom) snap to position.

### Custom Styling

```tsx
startTour(
  [
    {
      id: 'step1',
      targetRef: myRef,
      title: 'Custom Style',
      description: 'This tour has custom colors!',
    },
  ],
  {
    tooltipStyles: {
      backgroundColor: '#1E1E1E',
      titleColor: '#FFD700',
      descriptionColor: '#FFFFFF',
      primaryButtonColor: '#FFD700',
      borderRadius: 20,
    },
    spotlightStyles: {
      overlayOpacity: 0.8,
      overlayColor: '#000000',
    },
  }
);
```

### With Blur and Gradient Effects

```tsx
startTour(steps, {
  spotlightStyles: {
    enableBlur: true,
    blurAmount: 10,
    enableGradient: true,
    gradientColors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'],
  },
});
```

### Automatic Scrolling

```tsx
const scrollViewRef = useRef(null);
const targetRef = useRef(null);
const [scrollY, setScrollY] = useState(0);

startTour([
  {
    id: 'scrollable',
    targetRef: targetRef,
    title: 'Scroll Target',
    description: 'The view will automatically scroll to show this element.',
    scrollToTarget: {
      scrollRef: scrollViewRef,
      offset: 50, // Extra padding
      animated: true,
      getCurrentScrollOffset: () => scrollY,
    },
  },
]);
```

### Callbacks & Lifecycle

```tsx
startTour(steps, {
  // Tour-level lifecycle events
  onTourStart: () => console.log('Tour started'),
  onTourEnd: (completed) => {
    console.log(completed ? 'Tour finished' : 'Tour skipped');
  },
  onStepChange: (from, to) => {
    analytics.track('tour_step', { from, to });
  },
  // Async gate — return false to block navigation
  beforeStepChange: async (from, to) => {
    if (to === 3) {
      const ready = await checkIfFeatureReady();
      return ready; // false blocks the transition
    }
    return true;
  },
});

// Per-step callbacks still work
startTour([{
  id: 'step1',
  targetRef: myRef,
  title: 'First Step',
  description: 'This is the first step.',
  onNext: () => console.log('Moving to next step'),
  onSkip: () => console.log('Tour skipped'),
}]);
```

### Tour Persistence

Built-in "show only once" support with any storage backend:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTourPersistence } from '@wrack/react-native-tour-guide';

function MyScreen() {
  // Pass any storage adapter (AsyncStorage, MMKV, etc.)
  const { startTour, resetTour, isTourCompleted } = useTourPersistence(AsyncStorage);

  useEffect(() => {
    // Automatically skips if user has already seen this tour
    startTour(steps, { tourId: 'onboarding' });
  }, []);

  // Force show again after an update
  const handleShowAgain = async () => {
    await resetTour('onboarding');
    startTour(steps, { tourId: 'onboarding' }, true);
  };
}
```

Works with MMKV too:

```tsx
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();

// MMKV adapter — just wrap the sync API
const mmkvAdapter = {
  getItem: (key) => storage.getString(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};

const { startTour } = useTourPersistence(mmkvAdapter);
```

### Smart Auto-Positioning

Let the library pick the best tooltip position automatically:

```tsx
// Per-step: set tooltipPosition to 'auto'
startTour([{
  id: 'step1',
  targetRef: myRef,
  title: 'Smart Position',
  description: 'Tooltip auto-positions based on available space.',
  tooltipPosition: 'auto',
}]);

// Or enable globally for all steps
startTour(steps, {
  autoPositionTooltip: true,
});
```

### Conditional Steps

Show or hide steps dynamically — numbering adjusts automatically:

```tsx
const isPremiumUser = useIsPremium();

startTour([
  { id: 'welcome', targetRef: welcomeRef, title: 'Welcome', description: '...' },
  {
    id: 'premium-feature',
    targetRef: premiumRef,
    title: 'Premium Feature',
    description: 'Only shown to free users.',
    active: !isPremiumUser, // hidden for premium users
  },
  { id: 'done', targetRef: doneRef, title: 'All Set', description: '...' },
]);
```

### Backdrop & Spotlight Press

Configure what happens when users tap the dark overlay or the highlighted area:

```tsx
startTour([
  {
    id: 'step1',
    targetRef: myRef,
    title: 'Tap the backdrop',
    description: 'Tapping outside advances to the next step.',
    backdropBehavior: 'next', // 'dismiss' | 'next' | 'none' | () => void
  },
  {
    id: 'step2',
    targetRef: buttonRef,
    title: 'Tap the button',
    description: 'Try tapping the highlighted button!',
    onSpotlightPress: () => {
      // User tapped the actual highlighted element
      navigation.navigate('Details');
    },
  },
]);

// Set a global default
startTour(steps, {
  defaultBackdropBehavior: 'next',
});
```

### Pause & Resume

Coordinate with modals, bottom sheets, or other overlays:

```tsx
const { pauseTour, resumeTour, isPaused } = useTourGuide();

// Pause when a modal opens
const handleModalOpen = () => pauseTour();

// Resume when it closes — tour picks up where it left off
const handleModalClose = () => resumeTour();
```

### Custom Tooltip Component

```tsx
import { TooltipProps } from '@wrack/react-native-tour-guide';

const CustomTooltip = (props: TooltipProps) => {
  return (
    <View style={styles.customTooltip}>
      <Text style={styles.title}>{props.title}</Text>
      <Text style={styles.description}>{props.description}</Text>
      <Pressable onPress={props.onNext}>
        <Text>Continue →</Text>
      </Pressable>
    </View>
  );
};

startTour(steps, {
  renderTooltip: (props) => <CustomTooltip {...props} />,
});
```

### Programmatic Control

```tsx
const {
  startTour, nextStep, prevStep, skipTour, endTour,
  goToStep, pauseTour, resumeTour,
  isActive, isPaused, currentStep, activeTourId,
} = useTourGuide();

startTour(steps);     // Start
nextStep();           // Next
prevStep();           // Previous
goToStep(2);          // Jump to step 3
pauseTour();          // Pause (hides overlay)
resumeTour();         // Resume
skipTour();           // Skip (triggers onTourEnd(false))
endTour();            // End immediately
```

### React Native Web

The library works out of the box with `react-native-web`. No additional configuration is needed.

```bash
# Install alongside react-native-web
npm install @wrack/react-native-tour-guide react-native-svg react-native-web
```

**What works on web:**
- All core tour functionality (steps, navigation, tooltips, spotlight)
- Animated spotlight transitions and pulse effects
- Theme presets and custom themes
- Tour persistence
- Accessibility (ARIA live regions replace native announcements)
- Smart auto-positioning

**Web-specific notes:**
- Blur and gradient effects require native modules and are not available on web — they gracefully degrade to the standard overlay
- Element measurement uses `getBoundingClientRect` instead of `measureInWindow`
- `StatusBar` height adjustments are automatically skipped on web

## 🎨 API Reference

### `useTourGuide()`

Hook to access tour guide functionality.

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `startTour(steps, config?)` | function | Start a tour with given steps |
| `nextStep()` | function | Move to the next step |
| `prevStep()` | function | Move to the previous step |
| `skipTour()` | function | Skip the entire tour |
| `endTour()` | function | End the tour programmatically |
| `goToStep(index)` | function | Jump to a specific step |
| `pauseTour()` | function | Pause the tour (hides overlay, keeps state) |
| `resumeTour()` | function | Resume a paused tour |
| `isActive` | boolean | Whether a tour is currently active |
| `isPaused` | boolean | Whether the tour is paused |
| `currentStep` | number | Current step index (0-based) |
| `activeSteps` | TourStep[] | Filtered steps (only active ones) |
| `activeTourId` | string? | ID of the current tour |
| `config` | TourGuideConfig? | Current tour configuration |

### `useTourPersistence(storage)`

Hook for "show only once" tour persistence.

```tsx
const { startTour, resetTour, isTourCompleted, markCompleted } = useTourPersistence(storage);
```

| Method | Description |
|--------|-------------|
| `startTour(steps, config?, force?)` | Starts tour only if not completed. Returns `Promise<boolean>`. |
| `isTourCompleted(tourId)` | Check if a tour was completed. Returns `Promise<boolean>`. |
| `resetTour(tourId)` | Reset a tour so it shows again. |
| `markCompleted(tourId)` | Manually mark a tour as completed. |

### `TourStep` Interface

```typescript
interface TourStep {
  id: string;                    // Unique identifier
  targetRef?: RefObject<any>;    // Ref to the target component
  title: string;                 // Tooltip title
  description: string;           // Tooltip description

  // Positioning & appearance
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  spotlightShape?: SpotlightShape; // 'rectangle' | 'circle' | 'ellipse' | 'pill' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'custom'
  customSpotlightPath?: (bounds: ShapeBounds) => string;
  spotlightPadding?: number;     // Default: 8
  spotlightBorderRadius?: number; // Uniform override (default: 12)
  targetStyle?: ViewStyle | ViewStyle[];  // Auto-extract per-corner border radius
  scrollToTarget?: ScrollToTargetConfig;

  // Callbacks
  onNext?: () => void;
  onPrev?: () => void;
  onSkip?: () => void;
  onSpotlightPress?: () => void; // Called when spotlight area is tapped

  // Behavior
  active?: boolean;              // Include/exclude step (default: true)
  backdropBehavior?: 'dismiss' | 'next' | 'none' | (() => void);
  delayBefore?: number;          // Delay in ms before showing step
  autoAdvance?: number;          // Auto-advance after ms (0 = disabled)

  // Button visibility
  hideNextButton?: boolean;
  hidePrevButton?: boolean;
  hideSkipButton?: boolean;

  // Accessibility
  accessibilityLabel?: string;   // Custom screen reader label
}
```

### `TourGuideConfig` Interface

```typescript
interface TourGuideConfig {
  // Styling
  tooltipStyles?: TooltipStyles;
  spotlightStyles?: SpotlightStyles;

  // Button text
  nextButtonText?: string;       // Default: 'Next'
  prevButtonText?: string;       // Default: 'Back'
  skipButtonText?: string;       // Default: 'Skip'
  doneButtonText?: string;       // Default: 'Done'

  // UI options
  showProgressDots?: boolean;    // Default: false
  showStepCounter?: boolean;     // Default: true
  enableBackButton?: boolean;    // Default: true
  renderTooltip?: (props: TooltipProps) => ReactNode;

  // Animation & layout
  animationDuration?: number;    // Default: 300ms
  tooltipWidth?: number;         // Default: 320
  triangleSize?: number;         // Default: 12
  tooltipOffset?: number;        // Default: 8
  safeZoneOffset?: number;       // Default: 120

  // Behavior
  tourId?: string;               // Unique ID (used for persistence)
  autoPositionTooltip?: boolean; // Default: false
  defaultBackdropBehavior?: BackdropBehavior;

  // Lifecycle events
  onTourStart?: () => void;
  onTourEnd?: (completed: boolean) => void;
  onStepChange?: (from: number, to: number) => void;
  beforeStepChange?: (from: number, to: number) => boolean | Promise<boolean>;

  // Accessibility
  enableAccessibility?: boolean; // Default: true
  accessibilityLabelPrefix?: string; // Default: 'Tour guide'
}
```

### `TourTheme` Interface

```typescript
interface TourTheme {
  tooltipStyles: TooltipStyles;
  spotlightStyles: SpotlightStyles;
}
```

Built-in presets: `darkTheme`, `lightTheme`, `minimalTheme`, `vibrantTheme`. Use `createTheme(overrides)` to build custom themes.

### `SpotlightStyles` Pulse Properties

```typescript
// Added to SpotlightStyles
enablePulse?: boolean;       // Default: false
pulseColor?: string;         // Default: '#FFFFFF'
pulseWidth?: number;         // Default: 2 (px)
pulseDuration?: number;      // Default: 1500 (ms, full cycle)
pulseMinOpacity?: number;    // Default: 0.2
pulseMaxOpacity?: number;    // Default: 0.8
```

### `TourStorage` Interface

Implement this to use any storage backend with `useTourPersistence`:

```typescript
interface TourStorage {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}
```

### `ScrollToTargetConfig` Interface

```typescript
interface ScrollToTargetConfig {
  scrollRef: RefObject<ScrollView>;
  offset?: number;               // Additional offset (positive = down)
  animated?: boolean;            // Default: true
  absolute?: boolean;            // Absolute vs relative scroll
  getCurrentScrollOffset?: () => number;
}
```

## 🎯 Best Practices

1. **Use `delayBefore`** instead of manual `setTimeout` — the library handles timing for you
2. **Use `useTourPersistence`** — built-in "show only once" with any storage backend
3. **Always provide Skip** — never trap users in a tour
4. **Keep it short** — 3-5 steps maximum for engagement
5. **Use `tooltipPosition: 'auto'`** — let the library pick the best position
6. **Use `tourId`** — enables persistence, analytics, and multiple tour management
7. **Test with screen readers** — accessibility is enabled by default
8. **Use `beforeStepChange`** — validate state before transitioning (e.g., wait for data to load)
9. **Use `pauseTour`** — coordinate with modals and bottom sheets
10. **Use conditional steps** — set `active: false` instead of filtering arrays manually

## 💡 Tips & Tricks

### Delayed Steps

For components that take time to render or animate, use `delayBefore`:

```tsx
startTour([
  {
    id: 'animated-element',
    targetRef: myRef,
    title: 'After Animation',
    description: 'This waits for the animation to finish.',
    delayBefore: 800, // Wait 800ms before measuring
  },
]);
```

### Auto-Advancing Tours

Create guided demos that play automatically:

```tsx
startTour([
  { id: 'step1', targetRef: ref1, title: 'Step 1', description: '...', autoAdvance: 3000 },
  { id: 'step2', targetRef: ref2, title: 'Step 2', description: '...', autoAdvance: 3000 },
  { id: 'step3', targetRef: ref3, title: 'Done!', description: '...' },
]);
```

### Handling Tab Bars

```tsx
<Tab.Screen
  name="Profile"
  component={ProfileScreen}
  options={{
    tabBarButton: (props) => (
      <Pressable
        {...props}
        ref={tabButtonRef}
        style={props.style}
        onPress={props.onPress}
      />
    ),
  }}
/>
```

## 🐛 Troubleshooting

### Tour Not Showing

1. Ensure `TourGuideOverlay` is placed after your main content
2. Check that the target ref is properly attached
3. Add a delay before starting the tour
4. Verify the component has a valid layout (not hidden or off-screen)

### Highlight Position Wrong

1. Ensure target component is fully rendered before starting tour
2. Add delay before starting tour
3. Component must be visible on screen
4. Check for any transforms or absolute positioning

### Tooltip Overlapping

- Adjust `tooltipPosition` prop
- Modify padding/offset in custom tooltip
- Use different spotlight shape

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- 🐛 [Report bugs](https://github.com/himanshu-lal4/react-native-tour-guide/issues/new?template=bug_report.md)
- 💡 [Request features](https://github.com/himanshu-lal4/react-native-tour-guide/issues/new?template=feature_request.md)
- 📖 [Improve documentation](https://github.com/himanshu-lal4/react-native-tour-guide/blob/main/CONTRIBUTING.md)
- 🔧 [Submit pull requests](https://github.com/himanshu-lal4/react-native-tour-guide/pulls)

Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a PR.

<br />

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

<br />

## 🙏 Credits

**Created with ❤️ by [Himanshu Lal](https://github.com/himanshu-lal4)**

Inspired by various React Native tour guide implementations and modern app onboarding patterns.

<br />

## 🔍 Keywords

<div align="center">

`react-native` • `react-native-tour-guide` • `tour-guide` • `walkthrough` • `onboarding` • `coach-marks` • `coachmarks` • `copilot` • `app-tour` • `user-guide` • `tutorial` • `spotlight` • `highlight` • `tooltip` • `feature-discovery` • `feature-tour` • `interactive-tour` • `guided-tour` • `app-walkthrough` • `user-onboarding` • `mobile-tour` • `react-native-walkthrough` • `react-native-onboarding` • `react-native-copilot` • `react-native-spotlight` • `react-native-coach-marks` • `react-native-tutorial` • `expo` • `expo-compatible` • `typescript` • `ios` • `android` • `cross-platform` • `new-architecture` • `fabric` • `turbomodules` • `svg-masking` • `animated` • `customizable` • `declarative` • `intro` • `hints` • `tips` • `product-tour` • `feature-hints` • `interactive-guide` • `step-by-step` • `user-education` • `app-intro` • `first-time-user-experience` • `ftue`

</div>

<br />

## 📞 Support & Community

<div align="center">

| Platform             | Link                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| 🐛 **Bug Reports**   | [GitHub Issues](https://github.com/himanshu-lal4/react-native-tour-guide/issues)               |
| 💬 **Discussions**   | [GitHub Discussions](https://github.com/himanshu-lal4/react-native-tour-guide/discussions)     |
| 📧 **Email**         | [himanshulal56@gmail.com](mailto:himanshulal56@gmail.com)                                      |
| 📖 **Documentation** | [Usage Guide](USAGE_GUIDE.md)                                                                  |
| 📦 **NPM Package**   | [@wrack/react-native-tour-guide](https://www.npmjs.com/package/@wrack/react-native-tour-guide) |

</div>

<br />

---

<div align="center">
  <sub>Built with ❤️ for the React Native community</sub>
  <br />
  <sub>⭐ Star us on GitHub — it helps!</sub>
</div>
