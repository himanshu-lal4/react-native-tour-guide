/**
 * DemoShowcase — the screen used to record the README demo.
 *
 * Deliberately reads as an APP-TOUR DEMO, not as some other product: every
 * component is a neutral, self-describing UI piece (no fake money, names or
 * activity feeds), and each tour step demonstrates one library capability:
 *
 *  1. avatar        — declarative <TourTarget> + circular shape matching
 *  2. hero card     — exact corner-radius matching (morph transition)
 *  3. "Tap me" pill — interactive step: touches pass through the spotlight
 *  4. ticket        — per-corner radii + a fully CUSTOM tooltip (your Figma UI)
 *  5. grid card     — motion: 'bounce' spring transition
 *  6. last list row — auto-scroll + settle, followTarget invitation
 *  7. tab bar       — motion: 'fade' + edge-aware tooltip flip
 *
 * Seven steps at 2s ≈ a 15s take → a ~10s README GIF after speed-up.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  TourGuideOverlay,
  TourGuideProvider,
  TourTarget,
  createTheme,
  useTourGuide,
  useTourScroll,
} from '@wrack/react-native-tour-guide';
import type { TooltipProps, TourGuideConfig, TourStep } from '@wrack/react-native-tour-guide';

const AUTO_PLAY = true;
const PACE = 2000;

// ─── Design tokens: neutral demo chrome, indigo accent ───────────────────────
const C = {
  bg: '#F4F5F9',
  surface: '#FFFFFF',
  ink: '#0E1116',
  inkSoft: '#6B7280',
  hairline: '#E8EAF0',
  brand: '#4F46E5',
  brandDeep: '#3730A3',
  amber: '#F59E0B',
};

const theme = createTheme({
  tooltipStyles: {
    backgroundColor: '#12141A',
    borderRadius: 20,
    primaryButtonColor: C.brand,
    titleColor: '#FFFFFF',
    descriptionColor: '#AEB4C2',
    secondaryButtonColor: '#252932',
    skipButtonColor: '#6B7280',
  },
  spotlightStyles: {
    overlayColor: '#050710',
    overlayOpacity: 0.72,
  },
});

// A fully custom tooltip for ONE step — the headless contract in ~30 lines.
// Deliberately styled nothing like the built-in tooltip so the difference reads.
function MiniTooltip({ title, description, position, targetHeight, onNext, onSkip }: TooltipProps) {
  return (
    <View
      style={[mini.card, { top: position.y + (targetHeight ?? 0) + 14, left: 20, right: 20 }]}
    >
      <View style={mini.badge}>
        <Text style={mini.badgeText}>YOUR UI ✦</Text>
      </View>
      <View style={mini.accent} />
      <View style={mini.body}>
        <Text style={mini.title}>{title}</Text>
        <Text style={mini.text}>{description}</Text>
      </View>
      <Pressable onPress={onSkip} hitSlop={8}>
        <Text style={mini.skip}>✕</Text>
      </Pressable>
      <Pressable onPress={onNext} style={mini.next}>
        <Text style={mini.nextText}>→</Text>
      </Pressable>
    </View>
  );
}

const mini = StyleSheet.create({
  card: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#0B1020',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#1F2937', letterSpacing: 0.6 },
  accent: { width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: '#F59E0B' },
  body: { flex: 1 },
  title: { fontSize: 13, fontWeight: '800', color: '#0E1116', letterSpacing: 0.2 },
  text: { fontSize: 12.5, color: '#6B7280', marginTop: 2, lineHeight: 17 },
  skip: { color: '#9CA3AF', fontSize: 14, paddingHorizontal: 2 },
  next: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0E1116',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

const TABS = ['Home', 'Explore', 'Alerts', 'Profile'];
const LIST = Array.from({ length: 10 }, (_, i) => `List item ${i + 1}`);

// ─── Screen ───────────────────────────────────────────────────────────────────
function Demo() {
  const { startTour, isActive, setStepCompleted, nextStep, currentStep, activeSteps } =
    useTourGuide();
  const insets = useSafeAreaInsets();

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollY = useRef(0);
  // One hook wires followTarget, the exact scroll-settle signal, AND offset
  // tracking — spread onto the ScrollView below.
  const { scrollProps } = useTourScroll();

  const tapRef = useRef(null);
  const ticketRef = useRef(null);
  const gridRef = useRef(null);
  const lastRowRef = useRef(null);
  const tabRef = useRef(null);

  const [tab, setTab] = useState(0);
  const [tapped, setTapped] = useState(false);

  const auto = AUTO_PLAY ? PACE : undefined;
  const onTapStep = activeSteps[currentStep]?.id === 'tap';

  const steps: TourStep[] = [
    {
      id: 'avatar',
      targetId: 'avatar', // declarative — <TourTarget id="avatar"> below, no refs
      title: 'Any shape, zero config',
      description:
        'The spotlight reads each target’s real border radius — this circle stays a perfect circle.',
      tooltipPosition: 'bottom',
      autoAdvance: auto,
    },
    {
      id: 'hero',
      targetId: 'hero',
      title: 'Edge-to-edge precision',
      description:
        'Corners matched exactly, cutout hugging the card — and the spotlight MORPHS between steps.',
      autoAdvance: auto,
    },
    {
      id: 'tap',
      targetRef: tapRef,
      title: 'Interactive steps',
      description: 'This button is really tappable through the spotlight — go on, tap it.',
      targetStyle: { borderRadius: 999 },
      interactive: true,
      autoAdvance: auto,
    },
    {
      id: 'ticket',
      targetRef: ticketRef,
      title: 'Your Figma design, our engine',
      description:
        'This tooltip is 100% custom UI — the library still measures, places and sequences. (Corners matched one by one.)',
      targetStyle: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 28,
        borderBottomLeftRadius: 8,
      },
      renderTooltip: (props) => <MiniTooltip {...props} />,
      autoAdvance: auto,
    },
    {
      id: 'grid',
      targetRef: gridRef,
      title: 'Pick your motion',
      description: 'That arrival was motion: “bounce”. Every step can choose morph, bounce or fade.',
      targetStyle: { borderRadius: 20 },
      motion: 'bounce',
      autoAdvance: auto,
    },
    {
      id: 'last-row',
      targetRef: lastRowRef,
      title: 'Off-screen? No problem',
      description:
        'This row was below the fold — the tour scrolled to it and waited for the scroll to settle. Scroll yourself: the highlight follows.',
      targetStyle: { borderRadius: 14 },
      autoAdvance: auto ? auto + 800 : undefined,
    },
    {
      id: 'tabs',
      targetRef: tabRef,
      title: 'Edge-aware, always',
      description:
        'Faded in with motion: “fade” — and at the screen edge the tooltip flips above the target on its own.',
      targetStyle: { borderRadius: 18 },
      motion: 'fade',
      autoAdvance: auto,
    },
  ];

  const config: TourGuideConfig = {
    ...theme,
    tourId: 'app-tour-demo',
    overlayMode: 'inline', // no Modal → interactive steps can pass touches through
    followTarget: true,
    statusBarStyle: 'light-content',
    showProgressDots: true,
    showStepCounter: false,
    nextButtonText: 'Next',
    doneButtonText: 'Got it',
    skipButtonText: 'Skip',
    animationDuration: 420,
    scrollRef,
    getCurrentScrollOffset: () => scrollY.current,
    insets: { top: insets.top, bottom: insets.bottom, left: insets.left, right: insets.right },
    extraInsets: { bottom: 72 },
    spotlightStyles: {
      ...theme.spotlightStyles,
      enablePulse: true,
      pulseColor: '#FFFFFF',
      pulseWidth: 2,
      pulseDuration: 1400,
    },
  };

  const begin = useCallback(() => {
    setTapped(false);
    startTour(steps, config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTour]);

  useEffect(() => {
    if (!AUTO_PLAY) return undefined;
    const t = setTimeout(begin, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView
          ref={scrollRef}
          onScroll={(e) => {
            scrollY.current = e.nativeEvent.contentOffset.y;
            scrollProps.onScroll(e); // feeds followTarget + the settle signal
          }}
          onMomentumScrollEnd={scrollProps.onMomentumScrollEnd}
          scrollEventThrottle={scrollProps.scrollEventThrottle}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          {/* Header — the screen says what it is */}
          <View style={s.header}>
            <View>
              <Text style={s.kicker}>react-native-tour-guide</Text>
              <Text style={s.title}>App Tour</Text>
            </View>
            <TourTarget id="avatar" style={s.avatar}>
              <Text style={s.avatarText}>✦</Text>
            </TourTarget>
          </View>

          {/* Hero card */}
          <TourTarget id="hero" style={{ borderRadius: 24 }}>
            <View style={s.hero}>
              <Text style={s.heroLabel}>THIS SCREEN IS THE DEMO</Text>
              <Text style={s.heroTitle}>Every step highlights one feature</Text>
              <View style={s.heroRow}>
                <View style={s.heroPill}>
                  <Text style={s.heroPillText}>7 steps</Text>
                </View>
                <Text style={s.heroHint}>sit back — it plays itself</Text>
              </View>
            </View>
          </TourTarget>

          {/* Interactive pill */}
          <View style={s.pillRow}>
            <Pressable
              ref={tapRef}
              onPress={() => {
                setTapped(true);
                if (onTapStep) {
                  setStepCompleted('tap', true);
                  nextStep();
                }
              }}
              style={[s.pill, s.pillPrimary]}
            >
              <Text style={s.pillPrimaryText}>{tapped ? 'Tapped ✓' : 'Tap me'}</Text>
            </Pressable>
            <View style={s.pill}>
              <Text style={s.pillText}>Or don’t</Text>
            </View>
          </View>

          {/* Asymmetric ticket — per-corner radii */}
          <View ref={ticketRef} collapsable={false} style={s.ticket}>
            <Text style={s.ticketBadge}>◨</Text>
            <View style={s.ticketBody}>
              <Text style={s.ticketTitle}>Odd corners? Matched.</Text>
              <Text style={s.ticketText}>28 · 8 · 28 · 8 — extracted per corner</Text>
            </View>
          </View>

          {/* Component grid — bounce target */}
          <View ref={gridRef} collapsable={false} style={s.grid}>
            <Text style={s.gridTitle}>Works over any layout</Text>
            <View style={s.gridRow}>
              {['◐', '◱', '◮', '●'].map((g) => (
                <View key={g} style={s.gridCell}>
                  <Text style={s.gridGlyph}>{g}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Generic list — the last row is the auto-scroll target */}
          <Text style={s.sectionTitle}>A long list, for the scroll step</Text>
          <View style={s.panel}>
            {LIST.map((label, i) => (
              <View
                key={label}
                ref={i === LIST.length - 1 ? lastRowRef : undefined}
                collapsable={false}
                style={[s.row, i === LIST.length - 1 && s.rowLast]}
              >
                <View style={[s.rowDot, i === LIST.length - 1 && s.rowDotHot]} />
                <Text style={s.rowText}>
                  {i === LIST.length - 1 ? 'The tour scrolls to me' : label}
                </Text>
              </View>
            ))}
          </View>

          {!isActive ? (
            <Pressable style={s.cta} onPress={begin}>
              <Text style={s.ctaText}>{AUTO_PLAY ? 'Replay tour' : 'Start tour'}</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {/* Tab bar */}
      <View style={[s.tabbar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((t, i) => (
          <Pressable
            key={t}
            ref={i === 3 ? tabRef : undefined}
            collapsable={false}
            onPress={() => setTab(i)}
            style={[s.tab, i === tab && s.tabActive]}
          >
            <Text style={[s.tabText, i === tab && s.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function DemoShowcase() {
  return (
    <SafeAreaProvider>
      <TourGuideProvider>
        <Demo />
        <TourGuideOverlay />
      </TourGuideProvider>
    </SafeAreaProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 20,
  },
  kicker: { fontSize: 12, color: C.inkSoft, letterSpacing: 0.4 },
  title: { fontSize: 26, fontWeight: '800', color: C.ink, marginTop: 2, letterSpacing: -0.5 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.brandDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 18 },

  hero: {
    backgroundColor: C.brand,
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
  },
  heroLabel: { color: '#C7D2FE', fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  heroHint: { color: '#C7D2FE', fontSize: 12 },

  pillRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  pill: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: C.surface,
  },
  pillPrimary: { backgroundColor: C.brand },
  pillPrimaryText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  pillText: { fontSize: 14, fontWeight: '600', color: C.inkSoft },

  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
    padding: 16,
    backgroundColor: '#14213D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 8,
  },
  ticketBadge: { fontSize: 20, color: C.amber },
  ticketBody: { flex: 1 },
  ticketTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  ticketText: { color: '#94A3B8', fontSize: 12.5, marginTop: 2 },

  grid: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    marginTop: 18,
  },
  gridTitle: { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 12 },
  gridRow: { flexDirection: 'row', gap: 10 },
  gridCell: {
    flex: 1,
    aspectRatio: 1.4,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridGlyph: { fontSize: 20, color: C.brandDeep },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.ink, marginTop: 26, marginBottom: 10 },
  panel: { backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.hairline,
    borderRadius: 14,
  },
  rowLast: { borderBottomWidth: 0 },
  rowDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#DDE1EC' },
  rowDotHot: { backgroundColor: C.brand },
  rowText: { fontSize: 14, fontWeight: '500', color: C.ink },

  cta: {
    marginTop: 24,
    backgroundColor: C.ink,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  tabbar: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: C.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.hairline,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 18, alignItems: 'center' },
  tabActive: { backgroundColor: '#EEF0F7' },
  tabText: { fontSize: 12, color: C.inkSoft, fontWeight: '600' },
  tabTextActive: { color: C.ink },
});
