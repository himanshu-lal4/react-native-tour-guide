---
layout: page
title: "React Native Coach Marks & Feature Discovery"
description: "Add coach marks and feature discovery hints to a React Native app: spotlight a single control, pulse the highlight, show it once per user, and dismiss on backdrop tap. Expo compatible, zero native dependencies."
permalink: /react-native-coach-marks/
---

# React Native coach marks

**Coach marks** are short, contextual hints layered over a live screen — one control spotlighted, one sentence of explanation, dismissed in a tap. They're the standard pattern for **feature discovery**: pointing out a new or under-used feature at the moment it becomes relevant, instead of front-loading everything into a first-launch tour.

`@wrack/react-native-tour-guide` treats a coach mark as a one-step tour, so the same API that powers a full walkthrough also covers a single hint.

## What are coach marks in a mobile app?

A coach mark dims the screen, cuts a spotlight around one element, and shows a tooltip beside it. Unlike an onboarding tour, coach marks are:

- **Short** — usually one step, occasionally two.
- **Contextual** — triggered by where the user already is, not by app launch.
- **Once-only** — shown a single time per user, then never again.
- **Interruption-light** — dismissed by tapping anywhere.

## How do I install it?

```bash
npm install @wrack/react-native-tour-guide react-native-svg
# yarn add @wrack/react-native-tour-guide react-native-svg
# pnpm add @wrack/react-native-tour-guide react-native-svg
# Expo: npx expo install @wrack/react-native-tour-guide react-native-svg
```

## How do I show a single coach mark?

Wrap your app in the provider once:

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

Then fire a one-step tour when the feature becomes relevant:

```tsx
import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTourGuide } from '@wrack/react-native-tour-guide';

function EditorScreen({ hasUnsavedDraft }) {
  const { startTour } = useTourGuide();
  const aiButtonRef = useRef(null);

  useEffect(() => {
    if (!hasUnsavedDraft) return;

    startTour(
      [
        {
          id: 'ai-rewrite',
          targetRef: aiButtonRef,
          title: 'New: AI rewrite',
          description: 'Tap the sparkle to rewrite your draft in a different tone.',
          targetStyle: styles.aiButton,
          backdropBehavior: 'dismiss',
          hidePrevButton: true,
          hideSkipButton: true,
        },
      ],
      {
        showStepCounter: false,
        enableBackButton: false,
        doneButtonText: 'Got it',
        spotlightStyles: { enablePulse: true, pulseColor: '#FFD166', overlayOpacity: 0.55 },
      }
    );
  }, [hasUnsavedDraft, startTour]);

  return <View ref={aiButtonRef} style={styles.aiButton} />;
}

const styles = StyleSheet.create({
  aiButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111' },
});
```

Three details make this read as a coach mark rather than a tour: `showStepCounter: false` and `enableBackButton: false` strip the tour chrome, `backdropBehavior: 'dismiss'` lets a tap anywhere close it, and the pulse draws the eye to the highlight.

## How do I make the spotlight match the control?

Pass the control's own style as `targetStyle`. The border radius is read from it, so a 44×44 view with `borderRadius: 22` gets a perfect circle, a pill button stays a pill, and per-corner radii (`borderTopLeftRadius` and friends) are preserved exactly.

If you need to override it, `spotlightBorderRadius` takes priority over the extracted value, and `spotlightPadding` widens the cutout:

```tsx
{
  id: 'tab',
  targetRef: tabRef,
  title: 'Reports moved here',
  description: 'Your weekly reports now live on this tab.',
  spotlightBorderRadius: 20,
  spotlightPadding: 12,
}
```

## How do I show a coach mark only once per user?

Use `useTourPersistence` with any storage adapter and give the hint a `tourId`. If it's already been completed, the call is a no-op.

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTourPersistence } from '@wrack/react-native-tour-guide';

function ReportsTab() {
  const { startTour, resetTour } = useTourPersistence(AsyncStorage);

  useEffect(() => {
    startTour(coachMarkSteps, { tourId: 'reports-moved-v2', showStepCounter: false });
  }, []);

  // Force it to show again (e.g. from a debug menu)
  const replay = async () => {
    await resetTour('reports-moved-v2');
    startTour(coachMarkSteps, { tourId: 'reports-moved-v2' }, true);
  };
}
```

`useTourPersistence` accepts anything with `getItem` / `setItem` / `removeItem`, so MMKV or a custom adapter works the same way. Version the `tourId` (`…-v2`) when the hint's content changes and you want it re-shown.

## How do I chain a few feature-discovery hints?

Coach marks are usually solo, but two or three related hints work as a short tour. Use `active` to include only the ones that apply to this user, and `delayBefore` when a target animates in:

```tsx
startTour([
  { id: 'filters', targetRef: filtersRef, title: 'Filters', description: '…', targetStyle: styles.chip },
  { id: 'saved', targetRef: savedRef, title: 'Saved views', description: '…', targetStyle: styles.chip, active: hasSavedViews },
  { id: 'export', targetRef: exportRef, title: 'Export', description: '…', targetStyle: styles.chip, delayBefore: 300 },
], { showProgressDots: true });
```

Steps with `active: false` are dropped and the counter renumbers automatically.

## FAQ

### What's the difference between coach marks and an onboarding tour?

An onboarding tour runs once at first launch and covers the whole screen's key actions. Coach marks are shown later and individually, triggered by context — a new feature shipping, a screen the user just reached for the first time, or an action they haven't discovered. Both use the same step API here; see the [onboarding tutorial]({{ '/react-native-onboarding-tutorial/' | relative_url }}).

### Can the user dismiss a coach mark by tapping outside it?

Yes. Set `backdropBehavior: 'dismiss'` on the step (or `defaultBackdropBehavior: 'dismiss'` on the config). Other options are `'next'`, `'none'`, or your own function.

### Can I animate the highlight to draw attention?

Yes — `spotlightStyles.enablePulse` animates a border around the spotlight, with `pulseColor`, `pulseWidth`, `pulseDuration`, `pulseMinOpacity`, and `pulseMaxOpacity` to tune it.

### Do coach marks work over a tab bar or a custom header?

Yes. Pass `extraInsets` for chrome that overlaps content (for example `{ bottom: 56 }` for a tab bar) so tooltips stay clear of it, alongside `insets` for the safe area.

### Does it need native code?

No. `react-native-svg` is the only required peer dependency, so coach marks work in Expo Go and in bare React Native without linking anything.

## See also

- [Getting started]({{ '/getting-started/' | relative_url }})
- [React Native walkthrough]({{ '/react-native-walkthrough/' | relative_url }})
- [React Native onboarding tutorial]({{ '/react-native-onboarding-tutorial/' | relative_url }})
- [Expo onboarding tour]({{ '/expo-onboarding-tour/' | relative_url }})
- [FAQ]({{ '/faq/' | relative_url }}) · [npm]({{ site.npm_url }}) · [GitHub]({{ site.repo_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "React Native Tour Guide",
  "alternateName": "@wrack/react-native-tour-guide",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "iOS, Android",
  "description": "React Native coach marks and feature discovery library: spotlight a single control with a shape-matching cutout, pulse animation, backdrop-tap dismissal, and show-once persistence. Expo and React Native CLI, zero native dependencies, TypeScript.",
  "programmingLanguage": "TypeScript",
  "license": "https://opensource.org/licenses/MIT",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": { "@type": "Person", "name": "Himanshu Lal", "url": "https://github.com/himanshu-lal4" },
  "downloadUrl": "https://www.npmjs.com/package/@wrack/react-native-tour-guide",
  "codeRepository": "https://github.com/himanshu-lal4/react-native-tour-guide",
  "keywords": "react native coach marks, coachmarks, feature discovery, react native spotlight hint, contextual tooltip"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What's the difference between coach marks and an onboarding tour?",
      "acceptedAnswer": { "@type": "Answer", "text": "An onboarding tour runs once at first launch and covers a screen's key actions. Coach marks are shown later and individually, triggered by context such as a new feature shipping or an action the user hasn't discovered. Both use the same step-based API." } },
    { "@type": "Question", "name": "Can the user dismiss a coach mark by tapping outside it?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Set backdropBehavior: 'dismiss' on the step, or defaultBackdropBehavior: 'dismiss' on the config. Other options are 'next', 'none', or a custom function." } },
    { "@type": "Question", "name": "Can I animate the highlight to draw attention?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. spotlightStyles.enablePulse animates a border around the spotlight, tunable via pulseColor, pulseWidth, pulseDuration, pulseMinOpacity, and pulseMaxOpacity." } },
    { "@type": "Question", "name": "Do coach marks work over a tab bar or custom header?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Pass extraInsets for chrome that overlaps content, such as { bottom: 56 } for a tab bar, alongside insets for the safe area, so tooltips stay clear of it." } },
    { "@type": "Question", "name": "Do React Native coach marks need native code?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. react-native-svg is the only required peer dependency, so coach marks work in Expo Go and in bare React Native with nothing to link." } }
  ]
}
</script>
