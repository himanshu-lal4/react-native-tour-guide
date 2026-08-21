---
layout: page
title: "Bring Your Own Tooltip UI"
description: "Use the tour engine with your own design system: restyle the built-in tooltip, swap buttons with component slots, or render a fully custom tooltip."
permalink: /custom-tooltip-design-system/
---

# Bring your own tooltip UI

Your design system already has a tooltip. Your Figma file already shows what the
tour should look like. What you actually need from a tour library is everything
*underneath* the tooltip — measurement, auto-scroll, placement math, safe-area
handling, Android quirks, step sequencing, persistence — with none of its
opinions about pixels.

That is how this library is built. The default tooltip is just a reference
implementation of a public contract; replace as little or as much of it as you
want. There are three levels, and you can stop at any of them.

## Level 1 — restyle the built-in tooltip

Colors, radius, and per-element text styles, without replacing anything:

```tsx
startTour(steps, {
  tooltipStyles: {
    backgroundColor: '#12141A',
    borderRadius: 20,
    titleColor: '#FFFFFF',
    descriptionColor: '#AEB4C2',
    primaryButtonColor: '#4F46E5',
    titleStyle: { fontFamily: 'InterDisplay-SemiBold' },
  },
});
```

If you set a light `backgroundColor` and no text colors, readable dark defaults
are derived automatically — white-on-white is not a failure mode you can ship.

## Level 2 — swap individual pieces with component slots

Keep the layout, replace only the parts your design system owns. Each slot is an
ordinary component; anything you don't provide keeps the default:

```tsx
import { Button, Stepper } from '@your-org/design-system';

startTour(steps, {
  components: {
    NextButton: ({ label, onPress, disabled, isLast }) => (
      <Button
        variant={isLast ? 'success' : 'primary'}
        onPress={onPress}
        disabled={disabled}   // respects `completed` gating automatically
      >
        {label}
      </Button>
    ),
    SkipButton: ({ label, onPress }) => (
      <Button variant="ghost" onPress={onPress}>{label}</Button>
    ),
    ProgressDots: ({ currentStep, totalSteps }) => (
      <Stepper current={currentStep} total={totalSteps} />
    ),
    // PrevButton and StepCounter work the same way
  },
});
```

## Level 3 — a fully custom tooltip from your Figma file

`renderTooltip` hands your component the complete headless contract —
`TooltipProps` — and steps aside. The engine still measures the target, picks
the side with room, computes safe-area-aware coordinates, scrolls off-screen
targets into view, and sequences steps. You only draw.

```tsx
import type { TooltipProps } from '@wrack/react-native-tour-guide';
import { View, Text, Pressable, StyleSheet } from 'react-native';

function BrandTooltip({
  title, description,
  position,            // spotlight-anchored { x, y } in window coordinates
  tooltipPosition,     // resolved side: 'top' | 'bottom' | 'left' | 'right'
  targetWidth, targetHeight,
  currentStep, totalSteps, isLastStep,
  onNext, onPrev, onSkip, nextDisabled,
  screenWidth, screenHeight, insets,
}: TooltipProps) {
  // Place yourself relative to the target — here: under it, clamped to insets.
  const top =
    tooltipPosition === 'top'
      ? undefined
      : Math.min(position.y + targetHeight + 16, screenHeight - (insets?.bottom ?? 0) - 220);

  return (
    <View style={[styles.card, { top, left: 24, right: 24 }]}>
      <Text style={styles.kicker}>{currentStep + 1} / {totalSteps}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{description}</Text>
      <View style={styles.row}>
        {currentStep > 0 && <Pressable onPress={onPrev}><Text style={styles.ghost}>Back</Text></Pressable>}
        <Pressable onPress={onSkip}><Text style={styles.ghost}>Skip</Text></Pressable>
        <Pressable onPress={onNext} disabled={nextDisabled} style={styles.cta}>
          <Text style={styles.ctaText}>{isLastStep ? 'Done' : 'Next'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { position: 'absolute', backgroundColor: '#0E1116', borderRadius: 24, padding: 20 },
  kicker: { color: '#6B7280', fontSize: 12, fontVariant: ['tabular-nums'] },
  title: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginTop: 4 },
  body: { color: '#AEB4C2', fontSize: 14, lineHeight: 20, marginTop: 6 },
  row: { flexDirection: 'row', gap: 16, alignItems: 'center', justifyContent: 'flex-end', marginTop: 16 },
  ghost: { color: '#8A93A6', fontSize: 14, fontWeight: '600' },
  cta: { backgroundColor: '#4F46E5', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
  ctaText: { color: '#FFFFFF', fontWeight: '700' },
});

// Global:
startTour(steps, { renderTooltip: (props) => <BrandTooltip {...props} /> });

// Or for a single step only:
const steps = [
  { id: 'special', targetId: 'promo', title: '…', description: '…',
    renderTooltip: (props) => <BrandTooltip {...props} /> },
];
```

That's the whole integration — about 40 lines for a production tooltip.

## The contract

`TooltipProps` is a stable public API. Everything a custom tooltip needs is on
it:

| Group | Fields |
|---|---|
| Content | `title`, `description` |
| Geometry | `position` (spotlight-anchored), `targetWidth`, `targetHeight`, `screenWidth`, `screenHeight` |
| Placement | `tooltipPosition` — the side the engine chose after checking available space |
| Layout safety | `insets` — resolved safe-area + extra insets to stay within |
| Progress | `currentStep`, `totalSteps`, `isLastStep` |
| Navigation | `onNext`, `onPrev` (undefined on the first step), `onSkip` |
| Gating | `nextDisabled` — true while a `completed: false` step is unfinished |
| Visibility | `hideNextButton`, `hidePrevButton`, `hideSkipButton` — per-step flags to honour |
| Everything else | `config` — the full tour config, for your own conventions |

The engine guarantees still hold with a custom tooltip: targets are measured and
re-measured, off-screen targets are scrolled into view, steps are announced to
screen readers, and an unmeasurable target falls back to a centered tooltip
instead of trapping the user.

## Related

- [Getting started]({{ '/getting-started/' | relative_url }})
- [FAQ]({{ '/faq/' | relative_url }})
