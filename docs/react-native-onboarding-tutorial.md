---
layout: page
title: "React Native Onboarding Tutorial — Build a User Onboarding Flow"
description: "Build a first-run user onboarding flow in React Native: spotlight key actions, show the tutorial only once, branch steps per user segment, and track completion. Expo and RN CLI, zero native dependencies."
permalink: /react-native-onboarding-tutorial/
---

# React Native onboarding tutorial

A first-run **onboarding flow** should do one thing: get a new user to their first successful action. This tutorial builds that flow in React Native — spotlighting the handful of controls that matter, showing it exactly once per user, branching for different user types, and reporting completion back to your analytics.

## What makes a good user onboarding flow?

- **Short.** Three to five steps. Every extra step loses people.
- **Action-oriented.** Point at the control that produces value, not at decoration.
- **Skippable.** Always leave a visible exit.
- **Once-only.** A tutorial that reappears is a bug in the user's eyes.
- **Segmented.** A returning user, a free user, and an invited team member need different steps.

## How do I install it?

```bash
npm install @wrack/react-native-tour-guide react-native-svg
# yarn add @wrack/react-native-tour-guide react-native-svg
# pnpm add @wrack/react-native-tour-guide react-native-svg
# Expo: npx expo install @wrack/react-native-tour-guide react-native-svg
```

For persistence, add a storage backend you already use — `@react-native-async-storage/async-storage` or `react-native-mmkv` both work.

## Step 1 — Mount the provider

`TourGuideProvider` holds the tour state; `TourGuideOverlay` draws it. Render the overlay *after* your content so it layers on top.

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

## Step 2 — Define the onboarding steps

Attach refs to the components you want to explain and describe each step. Passing each component's style as `targetStyle` makes the spotlight adopt its shape automatically.

```tsx
import { useRef } from 'react';
import { View, StyleSheet } from 'react-native';

const composeRef = useRef(null);
const inboxRef = useRef(null);
const profileRef = useRef(null);

const onboardingSteps = [
  {
    id: 'intro',
    title: 'Welcome to Fieldnote',
    description: "Three quick pointers and you're set.",
  },
  {
    id: 'compose',
    targetRef: composeRef,
    title: 'Write your first note',
    description: 'Tap here whenever an idea shows up.',
    targetStyle: styles.fab,
  },
  {
    id: 'inbox',
    targetRef: inboxRef,
    title: 'Everything lands here',
    description: 'Your notes and shared items arrive in the inbox.',
    targetStyle: styles.inboxTab,
  },
  {
    id: 'profile',
    targetRef: profileRef,
    title: 'Make it yours',
    description: 'Themes, sync, and notification settings live here.',
    targetStyle: styles.avatar,
  },
];

const styles = StyleSheet.create({
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF' },
  inboxTab: { height: 48, borderRadius: 12, backgroundColor: '#EEE' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#CCC' },
});
```

The `intro` step has no `targetRef` — steps without a target render as a centered tooltip with no spotlight, which is the natural shape for a welcome card.

## Step 3 — Show it once, on first run

`useTourPersistence` wraps `startTour` with a completed-check. Give the tour a `tourId`; if that id has already been completed, the call returns `false` and nothing is shown.

```tsx
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTourPersistence } from '@wrack/react-native-tour-guide';

function HomeScreen() {
  const { startTour, resetTour } = useTourPersistence(AsyncStorage);

  useEffect(() => {
    startTour(onboardingSteps, {
      tourId: 'first-run-onboarding',
      showProgressDots: true,
      skipButtonText: 'Skip for now',
      doneButtonText: 'Start writing',
      onTourEnd: (completed) => {
        analytics.track(completed ? 'onboarding_completed' : 'onboarding_skipped');
      },
      onStepChange: (from, to) => analytics.track('onboarding_step', { from, to }),
    });
  }, []);

  // Replay from a settings screen
  const replayTutorial = async () => {
    await resetTour('first-run-onboarding');
    startTour(onboardingSteps, { tourId: 'first-run-onboarding' }, true);
  };
}
```

The tour is marked complete only when the user reaches the end — a skipped tour can therefore be re-shown on the next launch if that's what you want, or you can mark it yourself with `markCompleted(tourId)`.

## Step 4 — Branch the flow per user segment

Set `active: false` on steps that don't apply. They're filtered out before the tour starts and the step counter renumbers itself, so there are no gaps like "step 2 of 5" followed by "step 4 of 5".

```tsx
startTour([
  { id: 'intro', title: 'Welcome', description: '…' },
  { id: 'team', targetRef: teamRef, title: 'Your team', description: '…', active: user.isTeamMember },
  { id: 'upgrade', targetRef: upgradeRef, title: 'Go Pro', description: '…', active: user.plan === 'free' },
  { id: 'compose', targetRef: composeRef, title: 'First note', description: '…', targetStyle: styles.fab },
], { tourId: `onboarding-${user.plan}` });
```

## Step 5 — Handle scrolling and screen chrome

If your onboarding crosses the fold, pass a `scrollRef` and a scroll-offset getter so off-screen targets — and their tooltips — are brought into view. If you have a tab bar or custom header sitting over the content, declare it with `extraInsets` on top of the safe-area `insets`.

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

startTour(onboardingSteps, {
  tourId: 'first-run-onboarding',
  scrollRef,
  getCurrentScrollOffset: () => scrollY,
  insets,
  extraInsets: { bottom: 56 }, // bottom tab bar
});
```

Safe-area insets are auto-detected when `react-native-safe-area-context` is installed, so passing `insets` explicitly is only needed when you want to override them.

## Step 6 — Gate a step until the user acts

`beforeStepChange` runs before each transition and can block it. Return `false` (or a promise resolving to `false`) to keep the user on the current step until they've done something.

```tsx
startTour(onboardingSteps, {
  tourId: 'first-run-onboarding',
  beforeStepChange: async (from, to) => {
    if (from === 1 && !(await hasCreatedNote())) return false;
    return true;
  },
});
```

Use this sparingly — a blocked step with no visible reason feels like a broken app.

## FAQ

### How do I show the onboarding tutorial only on the very first launch?

Use `useTourPersistence` with a `tourId`. It checks storage before starting and marks the tour completed when the user finishes it, so subsequent launches skip it automatically.

### How do I let users replay the tutorial later?

Call `resetTour(tourId)` to clear the stored flag, then call `startTour(steps, { tourId }, true)` — the third argument forces it to show even if previously completed.

### Can I track onboarding completion in analytics?

Yes. `onTourStart`, `onStepChange(from, to)`, and `onTourEnd(completed)` cover start, per-step progress, and whether the user finished or skipped.

### Can I add a welcome screen with no highlighted element?

Yes. A step without `targetRef` renders a centered tooltip and no spotlight.

### What if the target isn't rendered yet when the tour starts?

Use `delayBefore` on that step to wait a few hundred milliseconds for the layout or entry animation to settle, rather than wrapping `startTour` in your own `setTimeout`.

## See also

- [Getting started]({{ '/getting-started/' | relative_url }})
- [React Native walkthrough]({{ '/react-native-walkthrough/' | relative_url }})
- [React Native coach marks]({{ '/react-native-coach-marks/' | relative_url }})
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
  "description": "React Native onboarding library for first-run user onboarding flows: shape-matching spotlight steps, show-once persistence, conditional steps per user segment, and lifecycle callbacks for analytics. Expo and React Native CLI, zero native dependencies, TypeScript.",
  "programmingLanguage": "TypeScript",
  "license": "https://opensource.org/licenses/MIT",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": { "@type": "Person", "name": "Himanshu Lal", "url": "https://github.com/himanshu-lal4" },
  "downloadUrl": "https://www.npmjs.com/package/@wrack/react-native-tour-guide",
  "codeRepository": "https://github.com/himanshu-lal4/react-native-tour-guide",
  "keywords": "react native onboarding tutorial, user onboarding flow, react native first run experience, ftue, onboarding library"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How do I show the onboarding tutorial only on the very first launch?",
      "acceptedAnswer": { "@type": "Answer", "text": "Use the useTourPersistence hook with a tourId. It checks storage before starting and marks the tour completed when the user finishes, so later launches skip it automatically." } },
    { "@type": "Question", "name": "How do I let users replay the onboarding tutorial later?",
      "acceptedAnswer": { "@type": "Answer", "text": "Call resetTour(tourId) to clear the stored flag, then call startTour(steps, { tourId }, true) — the third argument forces the tour to show even if it was previously completed." } },
    { "@type": "Question", "name": "Can I track onboarding completion in analytics?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. onTourStart, onStepChange(from, to), and onTourEnd(completed) cover start, per-step progress, and whether the user finished or skipped." } },
    { "@type": "Question", "name": "Can I add a welcome step with no highlighted element?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. A step without targetRef renders as a centered tooltip with no spotlight." } },
    { "@type": "Question", "name": "What if the target isn't rendered yet when the tour starts?",
      "acceptedAnswer": { "@type": "Answer", "text": "Use delayBefore on that step to wait for the layout or entry animation to settle, instead of wrapping startTour in your own setTimeout." } }
  ]
}
</script>
