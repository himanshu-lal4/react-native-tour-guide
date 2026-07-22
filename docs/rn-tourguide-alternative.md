---
layout: page
title: "rn-tourguide Alternative — Honest Comparison"
description: "An honest comparison of rn-tourguide (xcarpentier) and @wrack/react-native-tour-guide: declarative zones vs refs, shape matching, auto-scroll, maturity, and how to migrate between them."
permalink: /rn-tourguide-alternative/
---

# An honest rn-tourguide alternative

[`rn-tourguide`](https://github.com/xcarpentier/rn-tourguide) by Xavier Carpentier is one of the best-known React Native tour libraries — a spiritual successor to `react-native-copilot`, with an SVG-masked spotlight and a declarative zone API. `@wrack/react-native-tour-guide` is a newer library covering the same problem from a different angle.

This page is written to help you pick correctly, which means being explicit about where `rn-tourguide` is the better choice.

## What does rn-tourguide do better?

**It is far more mature.** `rn-tourguide` has years of production use, a large install base, and a long tail of Stack Overflow answers, blog posts, and example repos. Edge cases have been found and fixed by thousands of apps. `@wrack/react-native-tour-guide` is new; it has tests and a documented API, but it has not been battle-tested at the same scale. If "many other teams have already hit my bug" matters to you, that is a real and rational reason to choose `rn-tourguide`.

**Its declarative zone API is genuinely nicer for some codebases.** You wrap the element in a `TourGuideZone` component with a `zone` number and its text, and the zone registers itself:

```tsx
<TourGuideZone zone={2} text="Tap here to search" borderRadius={16}>
  <SearchBar />
</TourGuideZone>
```

There are no refs to create, thread through props, or forward. Tour copy lives next to the component it describes, which survives refactors well, and it composes naturally with components rendered deep in a tree or conditionally. `useTourGuideController()` also exposes a `canStart` signal so you can wait until zones are actually mounted before starting — a clean answer to the "target isn't measured yet" class of bug.

**It can highlight positions that have no component.** `TourGuideZoneByPosition` highlights arbitrary screen coordinates. `@wrack/react-native-tour-guide` has no equivalent — every spotlight step needs a real, measurable component ref (a step without a ref renders a centered tooltip with no spotlight).

**It supports cumulative highlights.** The `circle_and_keep` / `rectangle_and_keep` shapes let a step keep the previous highlight visible while adding a new one. There is no equivalent here; each step spotlights exactly one target.

**It has an event emitter.** `eventEmitter.on('start' | 'stop' | 'stepChange')` lets unrelated modules subscribe to tour state. This library exposes lifecycle callbacks on the tour config instead, which is fine for local use but less convenient for decoupled subscribers.

## What does @wrack/react-native-tour-guide do differently?

**Shape matching is automatic and per-corner.** `rn-tourguide` asks you to pick a shape (`circle` or `rectangle`) and a `borderRadius` per zone. Here you pass the component's own style as `targetStyle`, and the spotlight extracts the radius from it — including asymmetric per-corner radii like a chat bubble. When you restyle the component, the spotlight follows automatically instead of drifting out of sync.

**Auto-scroll accounts for the tooltip, not just the target.** Give the tour a `scrollRef` and a `getCurrentScrollOffset` getter and off-screen steps are scrolled into view far enough that the target *and* its tooltip both fit. Long forms and settings screens are where hand-rolled tours usually fall apart.

**Batteries for the boring parts.** Four themes plus `createTheme()`, a `useTourPersistence` hook for show-once tours backed by any storage adapter, `pauseTour()` / `resumeTour()` for modal interruptions, `active: false` conditional steps with automatic renumbering, `insets` / `extraInsets` for tab bars and headers, and an optional pulse animation on the spotlight border. Most of these are DIY in `rn-tourguide`.

**Overlay rendering.** The dim layer is a single even-odd SVG path — a real punched-out hole rather than an SVG `<Mask>` — which avoids the faint white film over the highlight that mask-based overlays can show on the New Architecture.

## Side-by-side

| | @wrack/react-native-tour-guide | rn-tourguide |
|---|---|---|
| API style | Refs + `startTour(steps, config)` | Declarative `<TourGuideZone>` components |
| Maturity / install base | New, small | Established, large |
| Spotlight shape | Auto-extracted from `targetStyle`, per-corner radii | `circle` / `rectangle` + `borderRadius` prop |
| Cumulative "keep" highlights | ❌ | ✅ (`*_and_keep` shapes) |
| Highlight arbitrary coordinates | ❌ | ✅ (`TourGuideZoneByPosition`) |
| Auto-scroll to off-screen steps | ✅ (fits target + tooltip) | ❌ |
| Safe-area / tab-bar insets | ✅ (`insets`, `extraInsets`) | Manual (`verticalOffset`) |
| Built-in themes | ✅ 4 + `createTheme()` | ❌ (style props) |
| Show-once persistence | ✅ `useTourPersistence` | DIY |
| Pause / resume | ✅ | DIY |
| Conditional steps | ✅ `active` flag, auto-renumbering | Conditional rendering of zones |
| Custom tooltip | ✅ `renderTooltip` | ✅ `tooltipComponent` |
| Event subscription | Config callbacks | `eventEmitter` |
| Required peer dep | `react-native-svg` | `react-native-svg` |
| Language | TypeScript | TypeScript |

## Which should you pick?

- **Pick `rn-tourguide`** if you want the proven option, prefer wrapping components over managing refs, need to highlight arbitrary coordinates or keep previous highlights visible, or want an event emitter other modules can subscribe to.
- **Pick `@wrack/react-native-tour-guide`** if your targets have distinctive shapes you don't want to re-declare, your tour crosses a scroll boundary, or you'd rather not hand-build theming, show-once persistence, pause/resume, and inset handling.

Both run in Expo Go, since neither requires anything beyond `react-native-svg`.

## How do I migrate from rn-tourguide?

The mental model shifts from *wrapping components* to *listing steps*. Each `TourGuideZone` becomes an entry in the steps array; `zone={n}` ordering becomes array order.

```bash
npm install @wrack/react-native-tour-guide react-native-svg
# Expo: npx expo install @wrack/react-native-tour-guide react-native-svg
```

```tsx
import { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TourGuideProvider,
  TourGuideOverlay,
  useTourGuide,
} from '@wrack/react-native-tour-guide';

export default function App() {
  return (
    <TourGuideProvider>
      <Screen />
      <TourGuideOverlay />
    </TourGuideProvider>
  );
}

function Screen() {
  const { startTour } = useTourGuide();
  const searchRef = useRef(null);
  const avatarRef = useRef(null);

  const start = () =>
    startTour(
      [
        {
          id: 'search',
          targetRef: searchRef,
          title: 'Search',
          description: 'Tap here to search.',
          targetStyle: styles.search, // replaces borderRadius / shape props
        },
        {
          id: 'avatar',
          targetRef: avatarRef,
          title: 'Profile',
          description: 'Your account lives here.',
          targetStyle: styles.avatar, // circular style → circular spotlight
        },
      ],
      {
        nextButtonText: 'Next',
        prevButtonText: 'Back',
        skipButtonText: 'Skip',
        doneButtonText: 'Done',
        onTourEnd: (completed) => console.log('tour ended', completed),
      }
    );

  return (
    <View>
      <View ref={searchRef} style={styles.search} />
      <View ref={avatarRef} style={styles.avatar} />
    </View>
  );
}

const styles = StyleSheet.create({
  search: { height: 44, borderRadius: 22, backgroundColor: '#EEE' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#CCC' },
});
```

Rough mapping:

| rn-tourguide | here |
|---|---|
| `<TourGuideZone zone={n} text="…">` | an entry in the `startTour` steps array |
| `shape` / `borderRadius` props | `targetStyle` (auto), or `spotlightBorderRadius` |
| `start()` / `stop()` | `startTour(steps, config)` / `endTour()` |
| `eventEmitter.on('stepChange')` | `onStepChange(from, to)` in the config |
| `labels={{ skip, previous, next, finish }}` | `skipButtonText`, `prevButtonText`, `nextButtonText`, `doneButtonText` |
| `tooltipComponent` | `renderTooltip` |
| `backdropColor` | `spotlightStyles.overlayColor` / `overlayOpacity` |

One migration gotcha: `targetRef` must land on a component that can be measured. Host components like `View` and `Pressable` work directly; your own function components need `forwardRef` so the ref reaches the underlying view.

## FAQ

### Is rn-tourguide still a good choice?

Yes. It is a mature, widely used library with a declarative API many teams prefer. This page exists to describe a different set of trade-offs, not to argue that `rn-tourguide` is outdated.

### What can rn-tourguide do that this library cannot?

Highlight arbitrary screen coordinates with no component behind them (`TourGuideZoneByPosition`), keep previous highlights visible across steps (`*_and_keep` shapes), and expose tour events through an event emitter.

### Do I need to rewrite my components to migrate?

Usually not — you remove the `TourGuideZone` wrappers and attach refs instead. Custom components that will be tour targets need `forwardRef`.

### Do both libraries work in Expo Go?

Yes. Neither requires native modules beyond `react-native-svg`, which Expo ships, so no custom development build is needed.

### How does this compare with react-native-copilot?

`react-native-copilot` is the older ancestor of both approaches; see the [react-native-copilot comparison]({{ '/react-native-copilot-alternative/' | relative_url }}).

## See also

- [Getting started]({{ '/getting-started/' | relative_url }})
- [react-native-copilot alternative]({{ '/react-native-copilot-alternative/' | relative_url }})
- [React Native walkthrough]({{ '/react-native-walkthrough/' | relative_url }})
- [FAQ]({{ '/faq/' | relative_url }}) · [npm]({{ site.npm_url }}) · [GitHub]({{ site.repo_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "React Native Tour Guide",
  "alternateName": "@wrack/react-native-tour-guide",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "iOS, Android",
  "description": "An alternative to rn-tourguide for React Native app tours: automatic per-corner spotlight shape matching, auto-scroll that fits target and tooltip, built-in themes, show-once persistence, and pause/resume. Expo and React Native CLI, zero native dependencies, TypeScript.",
  "programmingLanguage": "TypeScript",
  "license": "https://opensource.org/licenses/MIT",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": { "@type": "Person", "name": "Himanshu Lal", "url": "https://github.com/himanshu-lal4" },
  "downloadUrl": "https://www.npmjs.com/package/@wrack/react-native-tour-guide",
  "codeRepository": "https://github.com/himanshu-lal4/react-native-tour-guide",
  "keywords": "rn-tourguide alternative, rn-tourguide vs react-native-tour-guide, react native tour library comparison, xcarpentier rn-tourguide"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Is rn-tourguide still a good choice?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. rn-tourguide is a mature, widely used library with a declarative zone API many teams prefer. The comparison describes a different set of trade-offs rather than arguing rn-tourguide is outdated." } },
    { "@type": "Question", "name": "What can rn-tourguide do that @wrack/react-native-tour-guide cannot?",
      "acceptedAnswer": { "@type": "Answer", "text": "Highlight arbitrary screen coordinates with no component behind them via TourGuideZoneByPosition, keep previous highlights visible across steps with its circle_and_keep and rectangle_and_keep shapes, and expose tour events through an event emitter." } },
    { "@type": "Question", "name": "Do I need to rewrite my components to migrate from rn-tourguide?",
      "acceptedAnswer": { "@type": "Answer", "text": "Usually not. You remove the TourGuideZone wrappers and attach refs instead, then list the steps in a startTour call. Custom function components used as tour targets need forwardRef so the ref reaches the underlying view." } },
    { "@type": "Question", "name": "Do both rn-tourguide and react-native-tour-guide work in Expo Go?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. Neither requires native modules beyond react-native-svg, which Expo ships, so no custom development build is needed." } }
  ]
}
</script>
