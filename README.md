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
      <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg?style=flat-square" alt="platforms" />
    </a>
  </p>

  <p>
    A powerful and customizable React Native library for creating beautiful app tours, walkthroughs, and coach marks. <br />
    Packed with advanced features like SVG masking, smooth animations, fully customizable tooltips, automatic scrolling, and a declarative API.
  </p>
</div>

<br />

---

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
| 🎯 **Setup Time**          | < 1 minute                   | 10-30 minutes         |
| 🎨 **Customization**       | Fully customizable           | Limited options       |
| 📱 **Platform Support**    | iOS & Android                | Platform specific     |
| 🔌 **Native Dependencies** | Zero (optional enhancements) | Multiple required     |
| 📦 **Bundle Size**         | Minimal (< 50KB)             | Heavy (> 200KB)       |
| 🎭 **Custom Components**   | Full support                 | Limited/None          |
| 🔄 **Auto Scrolling**      | Built-in                     | Manual implementation |
| 📚 **TypeScript**          | Full support                 | Partial/None          |
| 🌈 **Visual Effects**      | Optional (Blur, Gradient)    | None/Required         |
| ⚡ **Performance**         | Hardware accelerated         | CPU intensive         |

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
  - [Custom Styling](#custom-styling)
  - [Blur & Gradient Effects](#with-blur-and-gradient-effects)
  - [Automatic Scrolling](#automatic-scrolling)
  - [Callbacks](#with-callbacks)
  - [Custom Tooltip](#custom-tooltip-component)
  - [Programmatic Control](#programmatic-control)
- [🎨 API Reference](#-api-reference)
- [🎯 Best Practices](#-best-practices)
- [💡 Tips & Tricks](#-tips--tricks)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Credits](#-credits)
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
</table>

## 📦 Installation

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

### With Callbacks

```tsx
startTour([
  {
    id: 'step1',
    targetRef: myRef,
    title: 'First Step',
    description: 'This is the first step.',
    onNext: () => {
      console.log('Moving to next step');
      // Track analytics, update state, etc.
    },
    onPrev: () => {
      console.log('Going back');
    },
    onSkip: () => {
      console.log('Tour skipped');
      // Save that user skipped the tour
    },
  },
]);
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
const { startTour, nextStep, prevStep, skipTour, endTour, isActive } =
  useTourGuide();

// Start a tour
const handleStartTour = () => {
  startTour(steps);
};

// Control the tour programmatically
const handleManualNext = () => {
  nextStep();
};

const handleManualPrev = () => {
  prevStep();
};

const handleSkip = () => {
  skipTour();
};

const handleEnd = () => {
  endTour();
};
```

## 🎨 API Reference

### `useTourGuide()`

Hook to access tour guide functionality.

**Returns:**

- `startTour(steps, config?)` - Start a tour with given steps and optional configuration
- `nextStep()` - Move to the next step
- `prevStep()` - Move to the previous step
- `skipTour()` - Skip the entire tour
- `endTour()` - End the tour programmatically
- `isActive` - Boolean indicating if a tour is currently active
- `currentStep` - Current step index (0-based)
- `steps` - Array of tour steps
- `config` - Current tour configuration

### `TourStep` Interface

```typescript
interface TourStep {
  id: string; // Unique identifier
  targetRef?: React.RefObject<any>; // Ref to the target component
  title: string; // Tooltip title
  description: string; // Tooltip description
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  spotlightShape?: 'circle' | 'rectangle';
  spotlightPadding?: number; // Padding around spotlight (default: 8)
  spotlightBorderRadius?: number; // Border radius for rectangle (default: 12)
  scrollToTarget?: ScrollToTargetConfig;
  onNext?: () => void; // Callback when moving to next step
  onPrev?: () => void; // Callback when moving to previous step
  onSkip?: () => void; // Callback when skipping tour
}
```

### `TourGuideConfig` Interface

```typescript
interface TourGuideConfig {
  tooltipStyles?: {
    backgroundColor?: string;
    borderRadius?: number;
    titleColor?: string;
    descriptionColor?: string;
    buttonTextColor?: string;
    primaryButtonColor?: string;
    secondaryButtonColor?: string;
    skipButtonColor?: string;
    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    containerStyle?: ViewStyle;
  };
  spotlightStyles?: {
    overlayOpacity?: number; // 0-1 (default: 0.6)
    overlayColor?: string; // Default: 'black'
    blurAmount?: number; // 0-100 (default: 4)
    enableBlur?: boolean; // Default: false
    enableGradient?: boolean; // Default: false
    gradientColors?: string[];
  };
  showProgressDots?: boolean; // Default: false
  showStepCounter?: boolean; // Default: true
  enableBackButton?: boolean; // Default: true
  nextButtonText?: string; // Default: 'Next'
  prevButtonText?: string; // Default: 'Back'
  skipButtonText?: string; // Default: 'Skip'
  doneButtonText?: string; // Default: 'Done'
  renderTooltip?: (props: TooltipProps) => ReactNode;
  animationDuration?: number; // Default: 300ms
}
```

### `ScrollToTargetConfig` Interface

```typescript
interface ScrollToTargetConfig {
  scrollRef: React.RefObject<any>; // Reference to ScrollView
  offset?: number; // Additional offset (positive = down, negative = up)
  animated?: boolean; // Animate scroll (default: true)
  absolute?: boolean; // If true, offset is absolute position
  getCurrentScrollOffset?: () => number; // Function to get current scroll Y position
}
```

## 🎯 Best Practices

1. **Timing**: Start tours with a small delay (500-1000ms) to ensure layout is measured correctly
2. **Persistence**: Implement logic to show tours only once (use AsyncStorage or similar)
3. **User Control**: Always provide a "Skip" option for better UX
4. **Keep It Short**: Limit tours to 3-5 steps for better engagement
5. **Contextual**: Show tours when users first encounter a feature
6. **Test Thoroughly**: Test on different screen sizes and orientations

## 💡 Tips & Tricks

### Persistent Tours

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOUR_KEY = '@my_feature_tour_completed';

// Check if tour was already shown
const checkTourStatus = async () => {
  const hasSeenTour = await AsyncStorage.getItem(TOUR_KEY);
  if (!hasSeenTour) {
    startTour(steps);
  }
};

// Mark tour as completed
const completeTour = async () => {
  await AsyncStorage.setItem(TOUR_KEY, 'true');
};

// Use in onNext or onSkip callbacks
startTour([
  {
    // ... step config
    onNext: completeTour,
    onSkip: completeTour,
  },
]);
```

### Measuring Components

For components that take time to render or animate, add a delay:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    startTour(steps);
  }, 1000); // Wait for animations/layouts

  return () => clearTimeout(timer);
}, []);
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
