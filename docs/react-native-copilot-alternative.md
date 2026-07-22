---
layout: page
title: "A react-native-copilot Alternative — Comparison"
description: "Comparing React Native tour libraries: react-native-copilot, rn-tourguide, react-native-spotlight-tour, and react-native-tour-guide. Shape-matching spotlight, auto-scroll, Expo Go support, and zero native dependencies."
permalink: /react-native-copilot-alternative/
---

# A react-native-copilot alternative

`react-native-copilot` and `rn-tourguide` are the long-standing options for React Native app tours. `@wrack/react-native-tour-guide` is a newer, lightweight alternative focused on the things those make you do by hand.

## Comparison

| Capability | react-native-tour-guide | react-native-copilot | rn-tourguide | react-native-spotlight-tour |
|---|---|---|---|---|
| Auto shape-matching spotlight (per-corner) | ✅ | ❌ | ❌ | Circle/rect only |
| Auto-scroll to off-screen targets | ✅ | Partial | ❌ | ❌ |
| Smart tooltip positioning + safe-area | ✅ | Manual | Partial | Partial |
| Runs in Expo Go (no dev build) | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Native dependencies | **Zero** (svg peer) | Some | react-native-svg | Some |
| Fabric-safe overlay (no white film) | ✅ | ⚠️ | ⚠️ | ✅ |
| Built-in themes + createTheme() | ✅ (4) | ❌ | Partial | Partial |
| "Show once" persistence hook | ✅ | DIY | DIY | DIY |
| TypeScript | ✅ | ✅ | ✅ | ✅ |
| Bundle size | < 50KB | Larger | Medium | Medium |

## When to pick which

- **react-native-copilot** — you want the most-referenced, battle-tested default and are fine tuning positions and shapes yourself.
- **rn-tourguide** — you like the copilot API and want nicer SVG visuals.
- **react-native-spotlight-tour** — you want a minimal, well-documented spotlight and rectangles/circles are enough.
- **react-native-tour-guide** — you want the spotlight to match your real component shapes, need auto-scroll on long screens, and want it to *just work* in Expo Go with zero native deps.

## Migrating the mental model

Both are provider + step based. Where copilot wraps components in `walkthroughable`/`copilotStep` HOCs, this library uses plain `ref`s and a `startTour(steps)` call:

```tsx
const { startTour } = useTourGuide();
startTour([
  { id: 'a', targetRef: aRef, title: 'Step 1', description: '...', targetStyle: styles.a },
  { id: 'b', targetRef: bRef, title: 'Step 2', description: '...', targetStyle: styles.b },
]);
```

## FAQ

### What's the best react-native-copilot alternative for React Native tours?

`react-native-copilot` is the most-referenced, battle-tested default. `@wrack/react-native-tour-guide` is a lighter alternative that adds an automatic shape-matching spotlight, auto-scroll to off-screen targets, four built-in themes, and a show-once persistence hook — and runs in Expo Go with zero native dependencies beyond `react-native-svg`. Pick copilot for maximum maturity; pick this if you want those extras without hand-rolling them.

### How is it different from react-native-copilot?

Where copilot wraps components in `walkthroughable` / `copilotStep` HOCs and leaves shape, positioning, and scrolling largely to you, this library uses plain `ref`s and a `startTour(steps)` call, matches the spotlight to each target's border radius automatically (including per-corner radii), and auto-scrolls so the target and its tooltip both fit on screen. It also ships under 50KB with zero native dependencies.

### Do I have to rewrite my copilotStep components to migrate?

Not substantially. Both are provider + step based, so the structure carries over: you replace the `walkthroughable` / `copilotStep` HOCs with plain `ref`s listed in a `startTour(steps)` call. Custom function components used as tour targets need `forwardRef` so the ref reaches the underlying view.

### Does it run in Expo Go?

Yes. Its only required dependency is `react-native-svg`, which Expo ships, so there are no native modules to link and no custom development build is needed — it runs in Expo Go and in bare React Native CLI projects alike.

## See also

- [Getting started]({{ '/getting-started/' | relative_url }})
- [How to build a React Native app tour]({{ '/react-native-app-tour/' | relative_url }})
- [rn-tourguide alternative — honest comparison]({{ '/rn-tourguide-alternative/' | relative_url }})
- [React Native walkthrough]({{ '/react-native-walkthrough/' | relative_url }})
- [FAQ]({{ '/faq/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "React Native Tour Guide",
  "alternateName": "@wrack/react-native-tour-guide",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "iOS, Android",
  "description": "A lightweight alternative to react-native-copilot for React Native app tours: an automatic per-corner shape-matching spotlight, auto-scroll that fits the target and tooltip, four built-in themes plus createTheme(), show-once persistence, and a ref-based startTour API instead of walkthroughable and copilotStep HOCs. Runs in Expo Go with zero native dependencies beyond react-native-svg, under 50KB, TypeScript.",
  "programmingLanguage": "TypeScript",
  "license": "https://opensource.org/licenses/MIT",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": { "@type": "Person", "name": "Himanshu Lal", "url": "https://github.com/himanshu-lal4" },
  "downloadUrl": "https://www.npmjs.com/package/@wrack/react-native-tour-guide",
  "codeRepository": "https://github.com/himanshu-lal4/react-native-tour-guide",
  "keywords": "react-native-copilot alternative, react native copilot replacement, react native tour library comparison, copilotStep alternative"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What's the best react-native-copilot alternative for React Native tours?",
      "acceptedAnswer": { "@type": "Answer", "text": "react-native-copilot is the most-referenced, battle-tested default. @wrack/react-native-tour-guide is a lighter alternative that adds an automatic shape-matching spotlight, auto-scroll to off-screen targets, four built-in themes, and a show-once persistence hook, and runs in Expo Go with zero native dependencies beyond react-native-svg. Pick copilot for maximum maturity; pick this if you want those extras without hand-rolling them." } },
    { "@type": "Question", "name": "How is it different from react-native-copilot?",
      "acceptedAnswer": { "@type": "Answer", "text": "Where copilot wraps components in walkthroughable and copilotStep HOCs and leaves shape, positioning, and scrolling largely to you, this library uses plain refs and a startTour(steps) call, matches the spotlight to each target's border radius automatically including per-corner radii, and auto-scrolls so the target and its tooltip both fit on screen. It also ships under 50KB with zero native dependencies." } },
    { "@type": "Question", "name": "Do I have to rewrite my copilotStep components to migrate?",
      "acceptedAnswer": { "@type": "Answer", "text": "Not substantially. Both are provider + step based, so the structure carries over: you replace the walkthroughable and copilotStep HOCs with plain refs listed in a startTour(steps) call. Custom function components used as tour targets need forwardRef so the ref reaches the underlying view." } },
    { "@type": "Question", "name": "Does it run in Expo Go?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Its only required dependency is react-native-svg, which Expo ships, so there are no native modules to link and no custom development build is needed — it runs in Expo Go and in bare React Native CLI projects alike." } }
  ]
}
</script>
