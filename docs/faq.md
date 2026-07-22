---
layout: page
title: "React Native Tour Guide — FAQ"
description: "Answers to common questions about building React Native app tours, walkthroughs, and coach marks: Expo support, New Architecture, customization, dependencies, and show-once tours."
permalink: /faq/
---

# Frequently asked questions

## How do I add an onboarding tour to a React Native app?

Install `@wrack/react-native-tour-guide` and `react-native-svg`, wrap your app in `TourGuideProvider` with a `TourGuideOverlay`, then call `startTour(steps)` from the `useTourGuide()` hook. Each step references the component to highlight (via a `ref`) and the title/description to show.

## How do I highlight a specific component with a spotlight?

Attach a `ref` to the component and pass it as `targetRef` on a step. The library measures it, dims the rest of the screen, and cuts out a spotlight that matches the component's border radius automatically. Pass the component's style as `targetStyle` so the spotlight matches its shape.

## Does it work with Expo?

Yes — Expo (managed and bare, including **Expo Go**) and React Native CLI. The only required dependency is `react-native-svg`, which Expo supports out of the box, so no custom dev build is needed.

## Does it support the New Architecture (Fabric)?

Yes. The overlay is drawn with a single even-odd SVG path (a real punched-out hole) rather than an SVG `<Mask>`, so the spotlight renders correctly on both the old and new architectures — with no white film over the highlighted element.

## Can I fully customize the tooltip?

Yes. Use `tooltipStyles` to restyle the built-in tooltip, or pass `renderTooltip` to render your own component — it receives the title, description, step index, and `onNext`/`onPrev`/`onSkip` handlers.

## What are the dependencies and bundle size?

Under 50KB with **zero native dependencies** — only `react-native-svg` as a peer. Blur and gradient effects are optional and load lazily only if you install them.

## How does it compare to react-native-copilot or rn-tourguide?

All three highlight UI elements with tooltips. This library additionally matches the spotlight shape to each target's border radius automatically (circles, pills, per-corner radii), auto-scrolls so the target and tooltip both fit on screen, and ships zero native dependencies — so it runs in Expo Go without a custom dev build. See the [full comparison]({{ '/react-native-copilot-alternative/' | relative_url }}).

## Can I show a tour only once per user?

Yes — use the `useTourPersistence` hook with any storage backend (AsyncStorage, MMKV, or a custom adapter) and pass a `tourId`.

<!-- JSON-LD FAQPage: eligible for Google rich results & AI Overviews extraction. -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How do I add an onboarding tour to a React Native app?",
      "acceptedAnswer": { "@type": "Answer", "text": "Install @wrack/react-native-tour-guide and react-native-svg, wrap your app in TourGuideProvider with a TourGuideOverlay, then call startTour(steps) from the useTourGuide() hook. Each step references the component to highlight via a ref plus the title and description to show." } },
    { "@type": "Question", "name": "How do I highlight a specific component with a spotlight?",
      "acceptedAnswer": { "@type": "Answer", "text": "Attach a ref to the component and pass it as targetRef on a step. The library measures it, dims the rest of the screen, and cuts out a spotlight that matches the component's border radius automatically. Pass the component's style as targetStyle so the spotlight matches its shape." } },
    { "@type": "Question", "name": "Does it work with Expo?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes — Expo managed and bare, including Expo Go, and React Native CLI. The only required dependency is react-native-svg, which Expo ships, so no custom dev build is needed." } },
    { "@type": "Question", "name": "Does it support the New Architecture (Fabric)?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. The overlay uses a single even-odd SVG path (a real punched-out hole) rather than an SVG Mask, so the spotlight renders correctly on both architectures with no white film over the highlight." } },
    { "@type": "Question", "name": "Can I fully customize the tooltip?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Use tooltipStyles to restyle the built-in tooltip, or pass renderTooltip to render your own component — it receives the title, description, step index, and onNext, onPrev and onSkip handlers." } },
    { "@type": "Question", "name": "What are the dependencies and bundle size?",
      "acceptedAnswer": { "@type": "Answer", "text": "Under 50KB with zero native dependencies — only react-native-svg as a peer. Blur and gradient effects are optional and load lazily only if you install them." } },
    { "@type": "Question", "name": "How does it compare to react-native-copilot or rn-tourguide?",
      "acceptedAnswer": { "@type": "Answer", "text": "All three highlight UI elements with tooltips. This library additionally matches the spotlight shape to each target's border radius automatically, auto-scrolls so target and tooltip both fit on screen, and ships zero native dependencies, so it runs in Expo Go without a custom dev build." } },
    { "@type": "Question", "name": "Can I show a tour only once per user?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes — use the useTourPersistence hook with any storage backend (AsyncStorage, MMKV, or a custom adapter) and pass a tourId." } }
  ]
}
</script>
