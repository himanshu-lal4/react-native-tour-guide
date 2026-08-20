/**
 * DemoShowcase — the screen used to record the README demo.
 *
 * Deliberately NOT a feature harness. It is a plausible, finished-looking
 * product screen, and the tour runs over it the way it would in a real app.
 * Every step demonstrates a different capability *incidentally* — a circular
 * avatar produces a circular spotlight, a pill button produces a pill, the last
 * transaction is off-screen so the tour has to scroll — instead of announcing
 * "here is the circle feature".
 *
 * Five steps, ~2s each. Short enough that the GIF loops before a reader scrolls
 * past it.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
} from '@wrack/react-native-tour-guide';
import type { TourGuideConfig, TourStep } from '@wrack/react-native-tour-guide';

// Self-play pacing for recording. Slow on device, sped up in post by
// scripts/make-gif.sh so the result is crisp rather than frantic.
const AUTO_PLAY = true;
const PACE = 2600;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#F4F5F9',
  surface: '#FFFFFF',
  ink: '#0E1116',
  inkSoft: '#6B7280',
  hairline: '#E8EAF0',
  brand: '#4F46E5',
  brandDeep: '#3730A3',
  mint: '#10B981',
  rose: '#F43F5E',
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const ACTIONS = [
  { key: 'send', label: 'Send', tint: C.brand },
  { key: 'request', label: 'Request', tint: C.mint },
  { key: 'topup', label: 'Top up', tint: C.amber },
  { key: 'split', label: 'Split', tint: C.rose },
];

const SPEND = [38, 52, 30, 64, 48, 72, 44];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const TX = [
  { id: '1', name: 'Aurora Coffee', note: 'Today · 08:12', amount: '-$4.80', tint: '#8B5CF6', initials: 'AC' },
  { id: '2', name: 'Nimbus Cloud', note: 'Today · 07:40', amount: '-$29.00', tint: '#0EA5E9', initials: 'NC' },
  { id: '3', name: 'Marta Ruiz', note: 'Yesterday', amount: '+$120.00', tint: C.mint, initials: 'MR' },
  { id: '4', name: 'Bloom Grocery', note: 'Yesterday', amount: '-$63.25', tint: C.amber, initials: 'BG' },
  { id: '5', name: 'Transit Card', note: 'Mon · 18:05', amount: '-$2.75', tint: '#64748B', initials: 'TC' },
  { id: '6', name: 'Payday', note: 'Mon · 09:00', amount: '+$3,420.00', tint: C.mint, initials: 'PD' },
];

const TABS = ['Home', 'Cards', 'Invest', 'You'];

// ─── Screen ───────────────────────────────────────────────────────────────────
function Wallet() {
  const { startTour, isActive } = useTourGuide();
  const insets = useSafeAreaInsets();

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollY = useRef(0);

  const balanceRef = useRef(null);
  const actionRef = useRef(null);
  const payRef = useRef(null);
  const tabRef = useRef(null);

  const [tab, setTab] = useState(0);

  const steps: TourStep[] = [
    {
      id: 'avatar',
      // Declarative targeting: the avatar is wrapped in <TourTarget id="avatar">
      // below — no ref threading, and the TourTarget's style drives the shape.
      targetId: 'avatar',
      title: 'Your profile',
      description:
        'The spotlight reads the avatar’s border radius and comes out perfectly round. No shape config.',
      spotlightPadding: 6,
      tooltipPosition: 'bottom',
      autoAdvance: AUTO_PLAY ? PACE : undefined,
    },
    {
      id: 'balance',
      targetRef: balanceRef,
      title: 'Balance at a glance',
      description:
        'Cards keep their exact corner radius, so the highlight always matches the real UI.',
      targetStyle: { borderRadius: 24 },
      spotlightPadding: 8,
      autoAdvance: AUTO_PLAY ? PACE : undefined,
    },
    {
      id: 'actions',
      targetRef: actionRef,
      title: 'Move money fast',
      description:
        'This step is interactive — the Send button underneath is really tappable while highlighted.',
      targetStyle: { borderRadius: 999 },
      spotlightPadding: 6,
      interactive: true,
      autoAdvance: AUTO_PLAY ? PACE : undefined,
    },
    {
      id: 'payday',
      targetRef: payRef,
      title: 'Nothing gets missed',
      description:
        'This row starts off-screen. The tour scrolls it into view and waits for the scroll to settle.',
      targetStyle: { borderRadius: 16 },
      spotlightPadding: 6,
      autoAdvance: AUTO_PLAY ? PACE : undefined,
    },
    {
      id: 'tabs',
      targetRef: tabRef,
      title: 'Always readable',
      description:
        'Near the bottom edge the tooltip flips above the target and stays clear of the home indicator.',
      targetStyle: { borderRadius: 18 },
      spotlightPadding: 8,
      autoAdvance: AUTO_PLAY ? PACE : undefined,
    },
  ];

  const config: TourGuideConfig = {
    ...theme,
    tourId: 'wallet-onboarding',
    // Inline overlay: no Modal, so interactive steps can pass touches through
    // the spotlight to the app underneath.
    overlayMode: 'inline',
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

  const begin = useCallback(() => startTour(steps, config), [startTour, steps, config]);

  // Auto-start once for recording, then loop after a beat.
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
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.hello}>Good morning</Text>
              <Text style={s.name}>Himanshu</Text>
            </View>
            <TourTarget id="avatar" style={s.avatar}>
              <Text style={s.avatarText}>H</Text>
            </TourTarget>
          </View>

          {/* Balance card */}
          <View ref={balanceRef} collapsable={false} style={s.card}>
            <View style={s.cardGlow} />
            <Text style={s.cardLabel}>Total balance</Text>
            <Text style={s.cardValue}>$12,480.55</Text>
            <View style={s.cardRow}>
              <View style={s.deltaPill}>
                <Text style={s.deltaText}>↑ 2.4%</Text>
              </View>
              <Text style={s.cardHint}>vs. last month</Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={s.actions}>
            {ACTIONS.map((a, i) => (
              <View
                key={a.key}
                ref={i === 0 ? actionRef : undefined}
                collapsable={false}
                style={[s.action, { backgroundColor: i === 0 ? a.tint : C.surface }]}
              >
                <Text style={[s.actionText, { color: i === 0 ? '#FFFFFF' : C.ink }]}>
                  {a.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Spending */}
          <View style={s.panel}>
            <View style={s.panelHead}>
              <Text style={s.panelTitle}>This week</Text>
              <Text style={s.panelMeta}>$412.30</Text>
            </View>
            <View style={s.chart}>
              {SPEND.map((v, i) => (
                <View key={i} style={s.chartCol}>
                  <View style={[s.bar, { height: v, backgroundColor: i === 5 ? C.brand : '#DDE1EC' }]} />
                  <Text style={s.barLabel}>{DAYS[i]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Transactions */}
          <Text style={s.sectionTitle}>Recent activity</Text>
          <View style={s.panel}>
            {TX.map((t, i) => (
              <View
                key={t.id}
                ref={t.id === '6' ? payRef : undefined}
                collapsable={false}
                style={[s.row, i === TX.length - 1 && s.rowLast]}
              >
                <View style={[s.rowIcon, { backgroundColor: t.tint }]}>
                  <Text style={s.rowIconText}>{t.initials}</Text>
                </View>
                <View style={s.rowBody}>
                  <Text style={s.rowName}>{t.name}</Text>
                  <Text style={s.rowNote}>{t.note}</Text>
                </View>
                <Text
                  style={[s.rowAmount, t.amount.startsWith('+') && { color: C.mint }]}
                >
                  {t.amount}
                </Text>
              </View>
            ))}
          </View>

          {!AUTO_PLAY ? (
            <Pressable style={s.cta} onPress={begin} disabled={isActive}>
              <Text style={s.ctaText}>Start tour</Text>
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
        <Wallet />
        <TourGuideOverlay />
      </TourGuideProvider>
    </SafeAreaProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const shadow = (elev: number, opacity = 0.08) =>
  Platform.select({
    ios: {
      shadowColor: '#0B1020',
      shadowOffset: { width: 0, height: elev },
      shadowOpacity: opacity,
      shadowRadius: elev * 2,
    },
    android: { elevation: elev },
    default: {},
  });

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
  hello: { fontSize: 13, color: C.inkSoft, letterSpacing: 0.2 },
  name: { fontSize: 24, fontWeight: '700', color: C.ink, marginTop: 2, letterSpacing: -0.4 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.brandDeep,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(4, 0.18),
  },
  avatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 17 },

  card: {
    backgroundColor: C.brand,
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
    ...shadow(10, 0.22),
  },
  cardGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    opacity: 0.09,
  },
  cardLabel: { color: '#C7D2FE', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: -1,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  deltaPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  deltaText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  cardHint: { color: '#C7D2FE', fontSize: 12 },

  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  action: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    ...shadow(2, 0.06),
  },
  actionText: { fontSize: 13, fontWeight: '600' },

  panel: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    marginTop: 18,
    ...shadow(3, 0.06),
  },
  panelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontSize: 15, fontWeight: '700', color: C.ink },
  panelMeta: { fontSize: 15, fontWeight: '600', color: C.inkSoft },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
    height: 96,
  },
  chartCol: { alignItems: 'center', gap: 8, flex: 1 },
  bar: { width: 14, borderRadius: 7 },
  barLabel: { fontSize: 11, color: C.inkSoft },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
    marginTop: 26,
    marginBottom: -4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.hairline,
    borderRadius: 16,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  rowIconText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  rowBody: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '600', color: C.ink },
  rowNote: { fontSize: 12, color: C.inkSoft, marginTop: 2 },
  rowAmount: { fontSize: 14, fontWeight: '700', color: C.ink },

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
