import { useRef, useState, useCallback, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, ScrollView, Platform, Switch } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  TourGuideProvider,
  TourGuideOverlay,
  useTourGuide,
  darkTheme,
  createTheme,
} from '@wrack/react-native-tour-guide';
import type { TourStep, TourGuideConfig } from '@wrack/react-native-tour-guide';

const isIOS = Platform.OS === 'ios';
const isWeb = Platform.OS === 'web';

// Per-step dwell time for the self-playing showcase. Keep this comfortably
// SLOW on-device so every step fully settles — measurement, auto-scroll, and the
// spotlight animation all need to finish before a human (or a frame grab) can
// read it. The README GIF is sped up in post (scripts/make-gif.sh), so a relaxed
// on-device pace produces a crisp, readable fast GIF rather than a frantic one.
// Keeping every step on the same clock also makes the iOS and Android recordings
// identical — only the platform chrome differs.
const PACE = 3800;

// While iterating on layout/alignment we step through manually (tap Next) so we
// can inspect each step. Flip to true to make the tour self-play for recording.
const AUTO_PLAY = false;
const pace = () => (AUTO_PLAY ? PACE : undefined);

// ─── Custom Theme (shows the createTheme API used in the README) ──────────────
const brandTheme = createTheme({
  tooltipStyles: { primaryButtonColor: '#FF6B35', backgroundColor: '#1B1B3A', borderRadius: 20 },
  spotlightStyles: { overlayOpacity: 0.65 },
});

// ─── Main App Content ─────────────────────────────────────────────────────────
function AppContent() {
  const {
    startTour,
    isActive,
    isPaused,
    pauseTour,
    resumeTour,
    currentStep,
    activeSteps,
  } = useTourGuide();

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const scrollViewRef = useRef(null);
  // Live scroll offset in a ref. The tour config is created ONCE at startTour
  // time, so a `() => scrollY` state getter would capture scrollY=0 forever
  // (stale closure) and every auto-scroll after the first would miscalculate —
  // the target drifts off-screen. Reading a ref always returns the live offset.
  const scrollYRef = useRef(0);

  // Real safe-area insets — passed to the tour so tooltips stay on-screen and
  // targets are scrolled out from behind the status bar and Android nav bar.
  const insets = useSafeAreaInsets();

  const mainBtnRef = useRef(null);

  // Shape matching demo
  const roundedBtnRef = useRef(null);
  const circleRef = useRef(null);
  const pillRef = useRef(null);
  const chatBubbleRef = useRef(null);
  const squircleRef = useRef(null);
  const tagRef = useRef(null);
  const perCornerRef = useRef(null);

  // Advanced features
  const pulseTargetRef = useRef(null);
  const conditionalRef = useRef(null);
  const backdropRef = useRef(null);
  const autoAdvanceRef = useRef(null);
  const pauseResumeRef = useRef(null);
  const scrollTargetRef = useRef(null);

  const [showConditional, setShowConditional] = useState(true);
  const hasAutoStarted = useRef(false);

  // ─── Shared tour config ─────────────────────────────────────────────────────
  const baseConfig = useCallback(
    (extra?: Partial<TourGuideConfig>): TourGuideConfig => ({
      ...darkTheme,
      spotlightStyles: {
        ...darkTheme.spotlightStyles,
        enablePulse: true,
        pulseColor: '#FFFFFF',
        pulseWidth: 2,
        pulseDuration: 1500,
        pulseMinOpacity: 0.1,
        pulseMaxOpacity: 0.5,
      },
      scrollRef: scrollViewRef,
      getCurrentScrollOffset: () => scrollYRef.current,
      showStepCounter: true,
      showProgressDots: true,
      animationDuration: 300,
      enableAccessibility: true,
      // Respect safe-area insets. Add extraInsets here too if your screen has a
      // bottom tab bar or top tabs, e.g. extraInsets: { bottom: 56 }.
      insets,
      ...extra,
    }),
    [insets]
  );

  // ─── Hero Tour — short, punchy highlight reel (great for the README hero) ─────
  const startHeroTour = useCallback(() => {
    const steps: TourStep[] = [
      {
        id: 'hero-welcome',
        targetRef: mainBtnRef,
        title: '👋 Meet Tour Guide',
        description: 'Spotlight onboarding for React Native — drop-in, declarative, and customizable.',
        targetStyle: styles.startBtn,
        autoAdvance: pace(),
      },
      {
        id: 'hero-circle',
        targetRef: circleRef,
        title: '✨ Auto Shape Matching',
        description: 'The spotlight matches each target automatically — circles stay round.',
        targetStyle: styles.shapeCircle,
        autoAdvance: pace(),
      },
      {
        id: 'hero-chat',
        targetRef: chatBubbleRef,
        title: '🎯 Any Shape',
        description: 'Even asymmetric corners are matched pixel-for-pixel.',
        targetStyle: styles.chatBubble,
        autoAdvance: pace(),
      },
      {
        id: 'hero-pulse',
        targetRef: pulseTargetRef,
        title: '💫 Pulse Animation',
        description: 'Draw the eye with an animated pulsing border.',
        targetStyle: styles.pulseTarget,
        autoAdvance: pace(),
      },
      {
        id: 'hero-scroll',
        targetRef: scrollTargetRef,
        title: '📜 Smart Auto-Scroll',
        description: 'Off-screen targets? The tour scrolls to them for you.',
        targetStyle: styles.scrollCard,
        autoAdvance: pace(),
      },
      {
        id: 'hero-done',
        title: '🚀 That’s the gist!',
        description: 'Tap “Explore everything” to see themes, backdrops, auto-advance and more.',
      },
    ];

    startTour(steps, baseConfig({ animationDuration: 280 }));
  }, [startTour, baseConfig]);

  // ─── Full Showcase — self-playing tour covering every feature ─────────────────
  const startFullTour = useCallback(() => {
    const steps: TourStep[] = [
      // --- Welcome ---
      {
        id: 'welcome',
        targetRef: mainBtnRef,
        title: '👋 Welcome!',
        description:
          'This self-playing tour walks through every feature of the library. Sit back and watch.',
        targetStyle: styles.startBtn,
        autoAdvance: pace(),
      },

      // --- Shape matching ---
      {
        id: 'rounded-btn',
        targetRef: roundedBtnRef,
        title: 'Rounded Rectangle',
        description: "The spotlight matches this button's 12px border radius automatically.",
        targetStyle: styles.primaryBtn,
        autoAdvance: pace(),
      },
      {
        id: 'circle',
        targetRef: circleRef,
        title: 'Circle',
        description:
          'A circular target gets a circular spotlight — the radius scales with padding.',
        targetStyle: styles.shapeCircle,
        autoAdvance: pace(),
      },
      {
        id: 'pill',
        targetRef: pillRef,
        title: 'Pill / Capsule',
        description: 'Fully-rounded ends stay fully rounded even as the spotlight grows.',
        targetStyle: styles.shapePill,
        autoAdvance: pace(),
      },
      {
        id: 'chat-bubble',
        targetRef: chatBubbleRef,
        title: 'Chat Bubble',
        description: 'Asymmetric corners — large on three, small on the fourth. Matched exactly.',
        targetStyle: styles.chatBubble,
        autoAdvance: pace(),
      },
      {
        id: 'squircle',
        targetRef: squircleRef,
        title: 'Squircle / App Icon',
        description: 'A large radius on a square — the spotlight stays perfectly proportional.',
        targetStyle: styles.squircle,
        autoAdvance: pace(),
      },
      {
        id: 'tag',
        targetRef: tagRef,
        title: 'Small Tag',
        description: 'A compact fully-rounded tag — the spotlight expands but keeps its shape.',
        targetStyle: styles.tag,
        autoAdvance: pace(),
      },

      // --- Advanced features ---
      {
        id: 'pulse',
        targetRef: pulseTargetRef,
        title: '💫 Pulse Animation',
        description: 'An animated pulsing border draws attention to the highlighted element.',
        targetStyle: styles.pulseTarget,
        autoAdvance: pace(),
      },
      {
        id: 'per-corner',
        targetRef: perCornerRef,
        title: 'Per-Corner Radius',
        description: 'Rounded top corners, sharp bottom — auto-extracted from targetStyle.',
        targetStyle: styles.perCornerCard,
        autoAdvance: pace(),
      },
      {
        id: 'conditional',
        targetRef: conditionalRef,
        title: 'Conditional Steps',
        description: 'This step only appears when the toggle is on — show steps based on state.',
        active: showConditional,
        targetStyle: styles.featureRow,
        autoAdvance: pace(),
      },
      {
        id: 'backdrop',
        targetRef: backdropRef,
        title: 'Backdrop Tap',
        description: 'Tap the dark overlay to advance — this step uses backdropBehavior: "next".',
        backdropBehavior: 'next',
        targetStyle: styles.featureRow,
        autoAdvance: pace(),
      },
      {
        id: 'auto-advance',
        targetRef: autoAdvanceRef,
        title: '⏱️ Auto-Advance',
        description: 'Steps can move forward on a timer — that is exactly how this tour plays itself.',
        targetStyle: styles.featureRow,
        autoAdvance: pace(),
      },
      {
        id: 'pause-resume',
        targetRef: pauseResumeRef,
        title: 'Pause & Resume',
        description: 'Call pauseTour() / resumeTour() to coordinate with modals and sheets.',
        targetStyle: styles.featureRow,
        autoAdvance: pace(),
      },
      {
        id: 'scroll-target',
        targetRef: scrollTargetRef,
        title: '📜 Auto-Scroll',
        description: 'The tour scrolled here automatically — just set scrollRef in the config.',
        targetStyle: styles.scrollCard,
        autoAdvance: pace() ? PACE + 800 : undefined,
      },
      {
        id: 'finish',
        title: '🎉 You’ve seen it all!',
        description: 'Shape matching, pulse, backdrops, auto-advance, and smart scrolling.',
      },
    ];

    startTour(
      steps,
      baseConfig({
        onTourStart: () => console.log('Tour started'),
        onTourEnd: (completed) => console.log(completed ? 'Tour completed!' : 'Tour skipped'),
      })
    );
  }, [startTour, baseConfig, showConditional]);

  // ─── Auto-start the hero tour once on mount (immediate, recordable) ───────────
  useEffect(() => {
    if (hasAutoStarted.current) return;
    hasAutoStarted.current = true;
    const t = setTimeout(startHeroTour, 600);
    return () => clearTimeout(t);
  }, [startHeroTour]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => {
          scrollYRef.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.container}>
          {/* ─── Header ─────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.title}>React Native Tour Guide</Text>
            <Text style={styles.subtitle}>Spotlight onboarding & feature tours</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>npm i @wrack/react-native-tour-guide</Text>
              </View>
            </View>
          </View>

          {/* ─── Tour Launch Buttons ─────────────────────────────────────── */}
          <Pressable
            ref={mainBtnRef}
            style={styles.startBtn}
            onPress={startFullTour}
            disabled={isActive}
          >
            <Text style={styles.startBtnText}>Explore everything →</Text>
          </Pressable>

          <Pressable
            style={styles.heroBtn}
            onPress={startHeroTour}
            disabled={isActive}
          >
            <Text style={styles.heroBtnText}>⚡ Quick hero tour</Text>
          </Pressable>

          {/* ─── Pause/Resume Controls ───────────────────────────────────── */}
          {isActive && (
            <Pressable style={styles.pauseBtn} onPress={isPaused ? resumeTour : pauseTour}>
              <Text style={styles.pauseBtnText}>{isPaused ? 'Resume Tour' : 'Pause Tour'}</Text>
            </Pressable>
          )}

          {isActive && !isPaused && (
            <Text style={styles.stepIndicator}>
              Step {currentStep + 1} of {activeSteps.length}
            </Text>
          )}

          {/* ─── Shape Matching Demo ─────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Auto Shape Matching</Text>
          <Text style={styles.sectionDesc}>
            The spotlight automatically matches each target's border radius.
          </Text>
          <View style={styles.shapeGrid}>
            <Pressable ref={roundedBtnRef} style={styles.primaryBtn}>
              <Text style={styles.btnText}>Rounded</Text>
            </Pressable>
            <View ref={circleRef} style={styles.shapeCircle}>
              <Text style={styles.shapeIcon}>A</Text>
            </View>
            <View ref={pillRef} style={styles.shapePill}>
              <Text style={styles.pillText}>PILL</Text>
            </View>
          </View>
          <View style={styles.shapeGrid}>
            <View ref={chatBubbleRef} style={styles.chatBubble}>
              <Text style={styles.chatText}>Hey! This is a chat bubble</Text>
            </View>
            <View ref={squircleRef} style={styles.squircle}>
              <Text style={styles.squircleIcon}>S</Text>
            </View>
            <View ref={tagRef} style={styles.tag}>
              <Text style={styles.tagText}>Tag</Text>
            </View>
          </View>

          {/* ─── Advanced Features ───────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Advanced Features</Text>

          <View ref={pulseTargetRef} style={styles.pulseTarget}>
            <Text style={styles.pulseText}>Pulse</Text>
          </View>

          <View ref={perCornerRef} style={styles.perCornerCard}>
            <Text style={styles.featureTitle}>Per-Corner Radius</Text>
            <Text style={styles.featureDesc}>
              Top corners rounded, bottom sharp — auto-detected from targetStyle.
            </Text>
          </View>

          <View ref={conditionalRef} style={styles.featureRow}>
            <View style={styles.featureRowContent}>
              <Text style={styles.featureTitle}>Conditional Step</Text>
              <Switch value={showConditional} onValueChange={setShowConditional} />
            </View>
            <Text style={styles.featureDesc}>Toggle to show/hide this step in the tour.</Text>
          </View>

          <View ref={backdropRef} style={styles.featureRow}>
            <Text style={styles.featureTitle}>Backdrop: "next"</Text>
            <Text style={styles.featureDesc}>Tap the overlay to advance instead of a button.</Text>
          </View>

          <View ref={autoAdvanceRef} style={styles.featureRow}>
            <Text style={styles.featureTitle}>Auto-Advance</Text>
            <Text style={styles.featureDesc}>Steps progress automatically on a timer.</Text>
          </View>

          <View ref={pauseResumeRef} style={styles.featureRow}>
            <Text style={styles.featureTitle}>Pause & Resume</Text>
            <Text style={styles.featureDesc}>Hide the overlay while preserving tour state.</Text>
          </View>

          <View style={styles.spacer} />
          <View style={styles.spacer} />

          <View ref={scrollTargetRef} style={styles.scrollCard}>
            <Text style={styles.featureTitle}>Auto-Scroll Target</Text>
            <Text style={styles.featureDesc}>
              The tour scrolls here automatically using the scrollRef config.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>@wrack/react-native-tour-guide</Text>
            <Text style={styles.footerSubtext}>
              {isWeb ? 'Running on Web' : isIOS ? 'Running on iOS' : 'Running on Android'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Root App ───────────────────────────────────────────────────────────────
export default function App() {
  // Reference brandTheme so the createTheme example is exercised (and tree-shaken
  // away in production builds if unused).
  void brandTheme;
  return (
    <SafeAreaProvider>
      <TourGuideProvider>
        <AppContent />
        <TourGuideOverlay />
      </TourGuideProvider>
    </SafeAreaProvider>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    // Generous tail room so the auto-scroll target (one of the last elements)
    // can be scrolled UP into a comfortable position with the tooltip above it,
    // instead of being pinned to the bottom behind the nav bar.
    paddingBottom: 480,
  },
  container: {
    flex: 1,
    padding: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  badge: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#7CFC9B',
    fontSize: 12,
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: 'Menlo' },
      android: { fontFamily: 'monospace' },
      default: { fontFamily: 'monospace' },
    }),
  },

  // Buttons
  startBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  heroBtn: {
    backgroundColor: '#1B1B3A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  heroBtnText: {
    color: '#FFD166',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Pause button
  pauseBtn: {
    backgroundColor: '#FF9500',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  pauseBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  stepIndicator: {
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },

  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 28,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },

  // Theme cards
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
    marginTop: 6,
  },
  themeCard: {
    flex: 1,
    minWidth: '45%' as unknown as number,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Shape matching grid
  shapeGrid: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  shapeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapePill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#555',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 1,
  },
  chatBubble: {
    flex: 1,
    backgroundColor: '#DCF8C6',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chatText: {
    fontSize: 13,
    color: '#1B5E20',
  },
  squircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#5856D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squircleIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FFECB3',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57F17',
  },

  // Advanced features
  pulseTarget: {
    backgroundColor: '#FFF3E0',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  pulseText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '700',
  },
  perCornerCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  featureRow: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  featureRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  featureDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },

  // Scroll target
  spacer: { height: 120 },
  scrollCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#1E88E5',
    borderStyle: 'dashed',
  },

  // Footer
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#BBB',
    marginTop: 4,
  },
});
