---
layout: page
title: "React Native Walkthrough Library — Build a Guided Walkthrough"
description: "How to build a React Native walkthrough with a shape-matching spotlight, auto-scroll to off-screen steps, progress dots, and skippable steps. Works in Expo and React Native CLI with zero native dependencies."
permalink: /react-native-walkthrough/
---

# React Native walkthrough

A **walkthrough** takes a user through your interface one screen element at a time: dim everything, spotlight one control, explain it, advance. This page shows how to build one in React Native with `@wrack/react-native-tour-guide` — including the parts that are usually fiddly, like keeping the tooltip on screen and scrolling to steps below the fold.

## What is a React Native walkthrough library?

A walkthrough library renders an overlay above your app, measures the component you want to explain, cuts a hole in the overlay around it, and positions a tooltip next to it. You describe the walkthrough as an array of steps — each step points at a component `ref` and carries a title and description — and the library handles measurement, positioning, animation, and navigation between steps.

## How do I install it?

```bash
npm install @wrack/react-native-tour-guide react-native-svg
# yarn add @wrack/react-native-tour-guide react-native-svg
# pnpm add @wrack/react-native-tour-guide react-native-svg
# Expo: npx expo install @wrack/react-native-tour-guide react-native-svg
```

`react-native-svg` is the only required peer dependency. There are no native modules to link.

## How do I build a walkthrough?

Wrap your app once, then define steps and call `startTour`.

```tsx
import { TourGuideProvider, TourGuideOverlay } from '@wrack/react-native-tour-guide';

export default function App() {
  return (
    <TourGuideProvider>
      <RootNavigator />
      <TourGuideOverlay />
    </TourGuideProvider>
  );
}
```

```tsx
import { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTourGuide } from '@wrack/react-native-tour-guide';

function DashboardScreen() {
  const { startTour } = useTourGuide();
  const searchRef = useRef(null);
  const filterRef = useRef(null);
  const avatarRef = useRef(null);

  const runWalkthrough = () =>
    startTour(
      [
        {
          id: 'search',
          targetRef: searchRef,
          title: 'Search anything',
          description: 'Find any project, file, or teammate from here.',
          targetStyle: styles.search,
        },
        {
          id: 'filter',
          targetRef: filterRef,
          title: 'Narrow it down',
          description: 'Filter results by status, owner, or date.',
          targetStyle: styles.filter,
        },
        {
          id: 'avatar',
          targetRef: avatarRef,
          title: 'Your account',
          description: 'Settings and preferences live here.',
          targetStyle: styles.avatar,
        },
      ],
      {
        showProgressDots: true,
        skipButtonText: 'Skip walkthrough',
        doneButtonText: 'Got it',
        onTourEnd: (completed) => console.log('walkthrough finished:', completed),
      }
    );

  return (
    <View>
      <View ref={searchRef} style={styles.search} />
      <View ref={filterRef} style={styles.filter} />
      <View ref={avatarRef} style={styles.avatar} />
      <Pressable onPress={runWalkthrough}>
        <Text>Take the walkthrough</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { height: 44, borderRadius: 22, backgroundColor: '#EEE' },
  filter: { height: 36, borderRadius: 8, backgroundColor: '#EEE' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#CCC' },
});
```

Passing each component's own style as `targetStyle` is what makes the spotlight match its shape: the pill-shaped search bar gets a pill spotlight, the avatar gets a circle, the filter chip keeps its 8px corners.

## How do I walk through a long, scrollable screen?

Most real walkthroughs cross the fold. Give the tour a `scrollRef` plus a way to read the current scroll position, and off-screen steps are scrolled into view — far enough that the tooltip fits too, not just the target.

```tsx
const scrollRef = useRef(null);
const [scrollY, setScrollY] = useState(0);

startTour(steps, {
  scrollRef,
  getCurrentScrollOffset: () => scrollY,
});

<ScrollView
  ref={scrollRef}
  onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
  scrollEventThrottle={16}
>
  {/* walkthrough targets */}
</ScrollView>
```

The same config works for `FlatList` and `SectionList`. For one specific step that needs different behaviour, set `scrollToTarget` on that step with its own `offset`, `animated`, and `getCurrentScrollOffset`.

## How do I control the walkthrough programmatically?

`useTourGuide()` returns the full controller, so you can drive it from anywhere inside the provider:

```tsx
const {
  startTour, nextStep, prevStep, goToStep,
  skipTour, endTour, pauseTour, resumeTour,
  isActive, isPaused, currentStep,
} = useTourGuide();
```

`pauseTour()` hides the overlay but keeps the walkthrough's position — useful when a modal or a permissions dialog interrupts. `resumeTour()` picks up on the same step.

## How do I skip steps that don't apply?

Set `active: false` on any step and it is removed from the walkthrough, with the step counter renumbering itself:

```tsx
startTour([
  { id: 'welcome', targetRef: welcomeRef, title: 'Welcome', description: '…' },
  { id: 'upgrade', targetRef: upgradeRef, title: 'Upgrade', description: '…', active: !isPremium },
  { id: 'done', targetRef: doneRef, title: 'All set', description: '…' },
]);
```

## How do I style the walkthrough?

Use one of the four built-in themes, or build your own with `createTheme()`:

```tsx
import { createTheme, vibrantTheme } from '@wrack/react-native-tour-guide';

startTour(steps, { ...vibrantTheme });

const brand = createTheme({
  tooltipStyles: { primaryButtonColor: '#FF6B35', backgroundColor: '#1B1B3A' },
  spotlightStyles: { overlayOpacity: 0.7, enablePulse: true, pulseColor: '#FF6B35' },
});
startTour(steps, { ...brand });
```

For total control, pass `renderTooltip` and render your own component — it receives `title`, `description`, `currentStep`, `totalSteps`, and `onNext` / `onPrev` / `onSkip`.

## FAQ

### What's the difference between a walkthrough, a tour, and coach marks?

They overlap heavily. A **walkthrough** or **tour** is a sequence of steps shown in order, usually on first launch. **Coach marks** are typically one or two contextual hints shown at the moment a feature becomes relevant. The same step-based API covers all three — see [coach marks]({{ '/react-native-coach-marks/' | relative_url }}) and [app tours]({{ '/react-native-app-tour/' | relative_url }}).

### Can a walkthrough step have no highlighted element?

Yes. Omit `targetRef` and the step renders as a centered tooltip with no spotlight — handy for an intro or outro card.

### How long should a walkthrough be?

Three to seven steps. Longer sequences see steep drop-off, and every step should always be skippable.

### Does it work with React Navigation?

Yes, as long as `TourGuideProvider` wraps the navigator and `TourGuideOverlay` is rendered inside it. A single walkthrough measures targets on the currently mounted screen; for cross-screen flows, start a separate tour per screen and use `tourId` to tell them apart.

### Does it need a custom dev build?

No. The only required peer dependency is `react-native-svg`, so it runs in Expo Go. See [Expo onboarding tours]({{ '/expo-onboarding-tour/' | relative_url }}).

## See also

- [Getting started]({{ '/getting-started/' | relative_url }})
- [React Native coach marks]({{ '/react-native-coach-marks/' | relative_url }})
- [React Native onboarding tutorial]({{ '/react-native-onboarding-tutorial/' | relative_url }})
- [rn-tourguide alternative]({{ '/rn-tourguide-alternative/' | relative_url }})
- [FAQ]({{ '/faq/' | relative_url }}) · [npm]({{ site.npm_url }}) · [GitHub]({{ site.repo_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "React Native Tour Guide",
  "alternateName": "@wrack/react-native-tour-guide",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "iOS, Android",
  "description": "React Native walkthrough library with an auto shape-matching spotlight, auto-scroll to off-screen steps, progress dots, themeable tooltips, and skippable steps. Expo and React Native CLI, zero native dependencies, TypeScript.",
  "programmingLanguage": "TypeScript",
  "license": "https://opensource.org/licenses/MIT",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": { "@type": "Person", "name": "Himanshu Lal", "url": "https://github.com/himanshu-lal4" },
  "downloadUrl": "https://www.npmjs.com/package/@wrack/react-native-tour-guide",
  "codeRepository": "https://github.com/himanshu-lal4/react-native-tour-guide",
  "keywords": "react native walkthrough, react native walkthrough library, guided walkthrough, react native tour, walkthrough tutorial"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What's the difference between a walkthrough, a tour, and coach marks?",
      "acceptedAnswer": { "@type": "Answer", "text": "They overlap heavily. A walkthrough or tour is a sequence of steps shown in order, usually on first launch. Coach marks are typically one or two contextual hints shown when a feature becomes relevant. The same step-based API covers all three." } },
    { "@type": "Question", "name": "Can a walkthrough step have no highlighted element?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Omit targetRef and the step renders as a centered tooltip with no spotlight, which is useful for an intro or outro card." } },
    { "@type": "Question", "name": "How long should a React Native walkthrough be?",
      "acceptedAnswer": { "@type": "Answer", "text": "Three to seven steps. Longer sequences see steep drop-off, and every step should always be skippable." } },
    { "@type": "Question", "name": "Does it work with React Navigation?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes, as long as TourGuideProvider wraps the navigator and TourGuideOverlay is rendered inside it. A single walkthrough measures targets on the currently mounted screen; for cross-screen flows, start a separate tour per screen and use tourId to tell them apart." } },
    { "@type": "Question", "name": "Does a React Native walkthrough need a custom dev build?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. The only required peer dependency is react-native-svg, so it runs in Expo Go without a custom development build." } }
  ]
}
</script>
