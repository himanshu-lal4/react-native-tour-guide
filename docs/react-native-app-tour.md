---
layout: page
title: "How to Build a React Native App Tour, Walkthrough or Coach Marks"
description: "Step-by-step guide to adding an app tour, walkthrough, onboarding flow, or coach marks in React Native with a shape-matching spotlight, auto-scroll, and themeable tooltips."
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

## See also

- [Getting started]({{ '/getting-started/' | relative_url }})
- [react-native-copilot alternative]({{ '/react-native-copilot-alternative/' | relative_url }})
- [FAQ]({{ '/faq/' | relative_url }})
