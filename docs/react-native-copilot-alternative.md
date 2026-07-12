---
layout: page
title: "A react-native-copilot Alternative (and rn-tourguide) — Comparison"
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

## See also

- [Getting started]({{ '/getting-started/' | relative_url }})
- [How to build a React Native app tour]({{ '/react-native-app-tour/' | relative_url }})
