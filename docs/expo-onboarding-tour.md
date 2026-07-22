---
layout: page
title: "Expo App Tour & Onboarding — Works in Expo Go, No Dev Build"
description: "Add an app tour, walkthrough, or onboarding flow to an Expo app that runs in Expo Go — no custom development build, no prebuild, no native modules. Only react-native-svg is required."
permalink: /expo-onboarding-tour/
---

# Expo app tour that runs in Expo Go

Most React Native tour libraries force a decision early: install a native module, run `expo prebuild`, and give up Expo Go — or hand-roll the overlay yourself.

`@wrack/react-native-tour-guide` has **zero native dependencies**. Its only required peer is `react-native-svg`, which Expo already ships and supports in Expo Go. So the tour runs in Expo Go on day one, keeps working after you move to a development build or EAS Build, and never appears in your `app.json` plugins.

## Does it work in Expo Go?

Yes. There is no native module, no config plugin, no `expo prebuild` step, and nothing to link. Install two packages and the overlay renders — same code in Expo Go, in a development build, and in a production EAS build.

It also works in a bare Expo project and in plain React Native CLI apps, and it is New Architecture (Fabric) ready: the dim layer is a single even-odd SVG path rather than an SVG `<Mask>`, so there's no faint white film over the highlighted element on Fabric.

## How do I install it in an Expo app?

```bash
npx expo install @wrack/react-native-tour-guide react-native-svg
```

Using `npx expo install` (rather than `npm install`) lets Expo pick the `react-native-svg` version matching your SDK. Nothing else to configure — no plugin entry in `app.json`, no pod install.

Optional extras, only if you want blur or gradient overlays, are lazily loaded and degrade to the standard overlay when absent:

```bash
npx expo install @react-native-community/blur react-native-linear-gradient
```

These are **not** Expo Go compatible, so leave them out unless you're already on a development build.

## How do I add an Expo Go walkthrough?

Wrap your app root — with Expo Router, that's your root layout:

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { TourGuideProvider, TourGuideOverlay } from '@wrack/react-native-tour-guide';

export default function RootLayout() {
  return (
    <TourGuideProvider>
      <Stack />
      <TourGuideOverlay />
    </TourGuideProvider>
  );
}
```

Then start a tour from any screen inside it:

```tsx
// app/index.tsx
import { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTourGuide } from '@wrack/react-native-tour-guide';

export default function Home() {
  const { startTour } = useTourGuide();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const libraryRef = useRef(null);
  const avatarRef = useRef(null);

  const start = () =>
    startTour(
      [
        {
          id: 'intro',
          title: 'Welcome',
          description: "Here's the 30-second version.",
        },
        {
          id: 'camera',
          targetRef: cameraRef,
          title: 'Capture',
          description: 'Snap a photo to add it to your log.',
          targetStyle: styles.fab,
        },
        {
          id: 'library',
          targetRef: libraryRef,
          title: 'Your library',
          description: 'Everything you capture lands here.',
          targetStyle: styles.tile,
        },
        {
          id: 'avatar',
          targetRef: avatarRef,
          title: 'Settings',
          description: 'Sync and preferences live behind your avatar.',
          targetStyle: styles.avatar,
        },
      ],
      {
        insets,
        extraInsets: { bottom: 56 }, // Expo Router tab bar
        showProgressDots: true,
        doneButtonText: 'Start',
      }
    );

  return (
    <View>
      <View ref={cameraRef} style={styles.fab} />
      <View ref={libraryRef} style={styles.tile} />
      <View ref={avatarRef} style={styles.avatar} />
      <Pressable onPress={start}>
        <Text>Take the tour</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF' },
  tile: { height: 96, borderRadius: 16, backgroundColor: '#EEE' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#CCC' },
});
```

Passing each component's style as `targetStyle` is what makes the spotlight adopt its shape — the FAB gets a circle, the tile keeps its 16px corners.

## How do I handle the notch and the Expo Router tab bar?

Safe-area insets are auto-detected when `react-native-safe-area-context` is installed (it is, in every Expo template), so tooltips already stay clear of the status bar and home indicator. Pass `insets` explicitly only to override, and use `extraInsets` for app chrome that sits *on top of* content — a tab bar, a top tab row, a custom header:

```tsx
startTour(steps, {
  insets,                                  // from useSafeAreaInsets()
  extraInsets: { top: 48, bottom: 56 },    // top tabs + bottom tab bar
});
```

## How do I show the Expo onboarding tour only once?

Use `useTourPersistence` with `@react-native-async-storage/async-storage` — an Expo Go compatible package — and a `tourId`:

```bash
npx expo install @react-native-async-storage/async-storage
```

```tsx
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTourPersistence } from '@wrack/react-native-tour-guide';

export default function Home() {
  const { startTour, resetTour } = useTourPersistence(AsyncStorage);

  useEffect(() => {
    startTour(steps, { tourId: 'expo-onboarding' });
  }, []);

  const replay = async () => {
    await resetTour('expo-onboarding');
    startTour(steps, { tourId: 'expo-onboarding' }, true);
  };
}
```

## Does it work on Expo web?

`react-native-web` is listed as an optional peer dependency, so the library loads in an Expo web build. Treat web as best-effort — measurement and layout are tuned for iOS and Android, so verify the tour on web before shipping it there.

## FAQ

### Do I need a custom development build or expo prebuild?

No. There are no native modules, so the tour runs in Expo Go. `expo prebuild` and a development build are only needed if you opt into the optional blur or gradient packages.

### Which Expo SDK versions are supported?

Any SDK whose `react-native-svg` is 13 or newer, which covers current SDKs. Installing with `npx expo install` picks the right version for your SDK automatically.

### Does it work with Expo Router?

Yes. Put `TourGuideProvider` and `TourGuideOverlay` in your root `_layout.tsx` so the overlay sits above every route, and call `startTour` from individual screens.

### Do I need to add anything to app.json?

No. There is no config plugin and no entitlement to declare.

### Will hot reload in Expo Go break an active tour?

A reload resets tour state, as it does with any React state. Start the tour again after reload, or use `useTourPersistence` with a `tourId` so it isn't re-shown to a user who already completed it.

## See also

- [Getting started]({{ '/getting-started/' | relative_url }})
- [React Native onboarding tutorial]({{ '/react-native-onboarding-tutorial/' | relative_url }})
- [React Native walkthrough]({{ '/react-native-walkthrough/' | relative_url }})
- [React Native coach marks]({{ '/react-native-coach-marks/' | relative_url }})
- [FAQ]({{ '/faq/' | relative_url }}) · [npm]({{ site.npm_url }}) · [GitHub]({{ site.repo_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "React Native Tour Guide",
  "alternateName": "@wrack/react-native-tour-guide",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "iOS, Android",
  "description": "Expo app tour and onboarding library that runs in Expo Go with no custom development build: zero native dependencies, react-native-svg only, shape-matching spotlight, safe-area and tab-bar insets, and show-once persistence. TypeScript, New Architecture ready.",
  "programmingLanguage": "TypeScript",
  "license": "https://opensource.org/licenses/MIT",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": { "@type": "Person", "name": "Himanshu Lal", "url": "https://github.com/himanshu-lal4" },
  "downloadUrl": "https://www.npmjs.com/package/@wrack/react-native-tour-guide",
  "codeRepository": "https://github.com/himanshu-lal4/react-native-tour-guide",
  "keywords": "expo app tour, expo go walkthrough, expo onboarding, expo router onboarding tour, expo tour guide, no dev build"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Do I need a custom development build or expo prebuild for an Expo app tour?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. @wrack/react-native-tour-guide has no native modules, so the tour runs in Expo Go. A development build is only needed if you opt into the optional blur or gradient packages." } },
    { "@type": "Question", "name": "Which Expo SDK versions are supported?",
      "acceptedAnswer": { "@type": "Answer", "text": "Any SDK whose react-native-svg is version 13 or newer, which covers current SDKs. Installing with npx expo install picks the matching version for your SDK automatically." } },
    { "@type": "Question", "name": "Does it work with Expo Router?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Put TourGuideProvider and TourGuideOverlay in the root _layout.tsx so the overlay sits above every route, then call startTour from individual screens." } },
    { "@type": "Question", "name": "Do I need to add anything to app.json?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. There is no config plugin to register and no entitlement to declare." } },
    { "@type": "Question", "name": "Will hot reload in Expo Go break an active tour?",
      "acceptedAnswer": { "@type": "Answer", "text": "A reload resets tour state, as with any React state. Start the tour again after reload, or use useTourPersistence with a tourId so a user who already completed it is not shown it again." } }
  ]
}
</script>
