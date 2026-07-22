---
layout: page
title: "How to Build a React Native App Tour"
description: "Step-by-step guide to building a React Native app tour with a shape-matching spotlight, auto-scroll to off-screen steps, show-once persistence, and themeable tooltips. Works in Expo Go with zero native dependencies."
permalink: /react-native-app-tour/
---

# How to build a React Native app tour

An **app tour** (also called a walkthrough, product tour, onboarding flow, or coach marks) highlights parts of your UI one at a time with a tooltip explaining each. This guide shows how to build one in React Native, including the parts that are usually hard: matching the spotlight to your component's shape and scrolling to off-screen targets.

## The hard parts (and how this library handles them)

Building a tour by hand means measuring each element, dimming everything else, positioning a tooltip that never runs off-screen, and scrolling to targets below the fold. `@wrack/react-native-tour-guide` does all of that for you.

### Highlight a component with a spotlight

Attach a `ref`, pass it as `targetRef`, and pass the component's style as `targetStyle`:

```tsx
{ id: 'card', targetRef: cardRef, title: 'Your card', description: 'Details here.', targetStyle: styles.card }
```

The spotlight reads `borderRadius` from `targetStyle` and matches it — including **per-corner radii** (e.g. a chat bubble) and **circles** (an avatar).

### Scroll to off-screen steps

Give the tour a `scrollRef` and a scroll-offset getter; it scrolls the target *and* its tooltip into view:

```tsx
startTour(steps, {
  scrollRef: scrollViewRef,
  getCurrentScrollOffset: () => scrollY,
});
```

### Show the tour only once

```tsx
import { useTourPersistence } from '@wrack/react-native-tour-guide';
const { startTour } = useTourPersistence(AsyncStorage);
startTour(steps, { tourId: 'onboarding' }); // skips automatically if already completed
```

Works with AsyncStorage, MMKV, or any custom storage adapter.

### Theme it to your brand

```tsx
import { createTheme } from '@wrack/react-native-tour-guide';
const brand = createTheme({ tooltipStyles: { primaryButtonColor: '#FF6B35', backgroundColor: '#1B1B3A' } });
startTour(steps, { ...brand });
```

## Common use cases

- **First-time user onboarding** — greet new users and point out key actions.
- **Feature discovery** — spotlight a newly shipped feature after an update.
- **Coach marks** — quick contextual hints over specific buttons or tabs.
- **Guided setup** — walk users through a multi-step configuration screen.

## FAQ

### How do I build an app tour in React Native?

Install `@wrack/react-native-tour-guide` and `react-native-svg`, wrap your app once in `TourGuideProvider` with a `TourGuideOverlay`, then call `startTour(steps)` from the `useTourGuide()` hook. Each step points at a component `ref` and carries a title and description; the library measures the target, dims the rest of the screen, and positions the tooltip.

### How do I highlight a specific component with a spotlight?

Attach a `ref` to the component, pass it as `targetRef` on the step, and pass the component's own style as `targetStyle`. The spotlight reads the border radius from that style and matches it automatically — including per-corner radii like a chat bubble and circles like an avatar — so it stays in sync when you restyle the component.

### Can I show the tour only once per user?

Yes. Use the `useTourPersistence` hook with a storage adapter (AsyncStorage, MMKV, or a custom one) and pass a `tourId`. Once a user completes that tour, `startTour` skips it automatically on later launches.

### Does it run in Expo Go, or do I need a dev build?

It runs in Expo Go. The only required peer dependency is `react-native-svg`, which Expo ships, so there are no native modules to link and no custom development build is needed. It also works in bare React Native CLI projects.

### Can I theme the tooltips?

Yes. Use one of the four built-in themes, build your own with `createTheme()`, or pass `renderTooltip` to render a fully custom component — it receives the title, description, step index, and `onNext` / `onPrev` / `onSkip` handlers.

## See also

- [Getting started]({{ '/getting-started/' | relative_url }})
- [React Native walkthrough — build a guided walkthrough]({{ '/react-native-walkthrough/' | relative_url }})
- [React Native coach marks]({{ '/react-native-coach-marks/' | relative_url }})
- [React Native onboarding tutorial]({{ '/react-native-onboarding-tutorial/' | relative_url }})
- [react-native-copilot alternative]({{ '/react-native-copilot-alternative/' | relative_url }})
- [FAQ]({{ '/faq/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "React Native Tour Guide",
  "alternateName": "@wrack/react-native-tour-guide",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "iOS, Android",
  "description": "Build a React Native app tour with an automatic shape-matching spotlight, auto-scroll to off-screen steps, show-once persistence, four built-in themes plus createTheme(), and fully custom tooltips. Runs in Expo and React Native CLI with zero native dependencies beyond react-native-svg, TypeScript.",
  "programmingLanguage": "TypeScript",
  "license": "https://opensource.org/licenses/MIT",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": { "@type": "Person", "name": "Himanshu Lal", "url": "https://github.com/himanshu-lal4" },
  "downloadUrl": "https://www.npmjs.com/package/@wrack/react-native-tour-guide",
  "codeRepository": "https://github.com/himanshu-lal4/react-native-tour-guide",
  "keywords": "react native app tour, how to build app tour react native, react native product tour, react native spotlight tour, app tour tutorial"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How do I build an app tour in React Native?",
      "acceptedAnswer": { "@type": "Answer", "text": "Install @wrack/react-native-tour-guide and react-native-svg, wrap your app once in TourGuideProvider with a TourGuideOverlay, then call startTour(steps) from the useTourGuide() hook. Each step points at a component ref and carries a title and description; the library measures the target, dims the rest of the screen, and positions the tooltip." } },
    { "@type": "Question", "name": "How do I highlight a specific component with a spotlight?",
      "acceptedAnswer": { "@type": "Answer", "text": "Attach a ref to the component, pass it as targetRef on the step, and pass the component's own style as targetStyle. The spotlight reads the border radius from that style and matches it automatically — including per-corner radii like a chat bubble and circles like an avatar — so it stays in sync when you restyle the component." } },
    { "@type": "Question", "name": "Can I show the tour only once per user?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Use the useTourPersistence hook with a storage adapter (AsyncStorage, MMKV, or a custom one) and pass a tourId. Once a user completes that tour, startTour skips it automatically on later launches." } },
    { "@type": "Question", "name": "Does it run in Expo Go, or do I need a dev build?",
      "acceptedAnswer": { "@type": "Answer", "text": "It runs in Expo Go. The only required peer dependency is react-native-svg, which Expo ships, so there are no native modules to link and no custom development build is needed. It also works in bare React Native CLI projects." } },
    { "@type": "Question", "name": "Can I theme the tooltips?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Use one of the four built-in themes, build your own with createTheme(), or pass renderTooltip to render a fully custom component — it receives the title, description, step index, and onNext, onPrev and onSkip handlers." } }
  ]
}
</script>
