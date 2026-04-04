import { useRef, useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Platform,
  Switch,
} from 'react-native';
import {
  TourGuideProvider,
  TourGuideOverlay,
  useTourGuide,
  darkTheme,
  createTheme,
} from '@wrack/react-native-tour-guide';
import type { TourStep } from '@wrack/react-native-tour-guide';

const isIOS = Platform.OS === 'ios';

// ─── Custom Theme (shows createTheme API) ─────────────────
const _brandTheme = createTheme({
  tooltipStyles: { primaryButtonColor: '#FF6B35', backgroundColor: '#1B1B3A', borderRadius: 20 },
  spotlightStyles: { overlayOpacity: 0.65 },
});
void _brandTheme; // used in README examples

// ─── Main App Content ─────────────────────────────────────
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

  // ─── Refs ───────────────────────────────────────────────
  const scrollViewRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  // Start button
  const mainBtnRef = useRef(null);

  // Theme showcase
  const darkCardRef = useRef(null);
  const lightCardRef = useRef(null);
  const minimalCardRef = useRef(null);
  const vibrantCardRef = useRef(null);

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

  // ─── Main Tour — walks through everything ─────────────
  const startMainTour = useCallback(() => {
    const steps: TourStep[] = [
      // --- Welcome ---
      {
        id: 'welcome',
        targetRef: mainBtnRef,
        title: 'Welcome!',
        description: 'This tour walks you through every feature of the library. Just keep pressing Next!',
        targetStyle: styles.startBtn,
      },

      // --- Themes ---
      {
        id: 'dark',
        targetRef: darkCardRef,
        title: 'Dark Theme',
        description: 'Rich dark backgrounds with high contrast text. Great for dark mode apps.',
        targetStyle: styles.themeCard,
      },
      {
        id: 'light',
        targetRef: lightCardRef,
        title: 'Light Theme',
        description: 'Clean white tooltip with subtle overlay. Perfect for light mode.',
        targetStyle: styles.themeCard,
      },
      {
        id: 'minimal',
        targetRef: minimalCardRef,
        title: 'Minimal Theme',
        description: 'Understated styling with lower overlay opacity. Keeps focus on content.',
        targetStyle: styles.themeCard,
      },
      {
        id: 'vibrant',
        targetRef: vibrantCardRef,
        title: 'Vibrant Theme',
        description: 'Bold colors for energetic experiences. Eye-catching accent buttons.',
        targetStyle: styles.themeCard,
      },

      // --- Shape matching ---
      {
        id: 'rounded-btn',
        targetRef: roundedBtnRef,
        title: 'Rounded Rectangle',
        description: 'The spotlight matches this button\'s 12px border radius automatically.',
        targetStyle: styles.primaryBtn,
      },
      {
        id: 'circle',
        targetRef: circleRef,
        title: 'Circle',
        description: 'Circular component gets a circular spotlight — border radius is scaled with padding.',
        targetStyle: styles.shapeCircle,

      },
      {
        id: 'pill',
        targetRef: pillRef,
        title: 'Pill / Capsule',
        description: 'Fully-rounded ends stay fully rounded even when the spotlight is larger.',
        targetStyle: styles.shapePill,

      },
      {
        id: 'chat-bubble',
        targetRef: chatBubbleRef,
        title: 'Chat Bubble',
        description: 'Asymmetric corners — large radius on 3 corners, small on bottom-left. Matched exactly.',
        targetStyle: styles.chatBubble,

      },
      {
        id: 'squircle',
        targetRef: squircleRef,
        title: 'Squircle / App Icon',
        description: 'Large border radius on a square — common for app icons. Spotlight stays proportional.',
        targetStyle: styles.squircle,

      },
      {
        id: 'tag',
        targetRef: tagRef,
        title: 'Small Tag',
        description: 'Compact fully-rounded tag. The spotlight expands but keeps the pill shape.',
        targetStyle: styles.tag,

      },

      // --- Advanced features ---
      {
        id: 'pulse',
        targetRef: pulseTargetRef,
        title: 'Pulse Animation',
        description: 'Animated pulsing border draws attention to the highlighted element.',
        targetStyle: styles.pulseTarget,

      },
      {
        id: 'per-corner',
        targetRef: perCornerRef,
        title: 'Per-Corner Radius',
        description: 'Rounded top corners, sharp bottom — auto-extracted from targetStyle.',
        targetStyle: styles.perCornerCard,

      },
      {
        id: 'conditional',
        targetRef: conditionalRef,
        title: 'Conditional Steps',
        description: 'This step is conditionally visible based on the toggle switch.',
        active: showConditional,
        targetStyle: styles.featureRow,
      },
      {
        id: 'backdrop',
        targetRef: backdropRef,
        title: 'Backdrop Tap',
        description: 'Tap the dark overlay to advance! This step uses backdropBehavior: "next".',
        backdropBehavior: 'next',
        targetStyle: styles.featureRow,
      },
      {
        id: 'auto-advance',
        targetRef: autoAdvanceRef,
        title: 'Auto-Advance (3s)',
        description: 'This step moves forward automatically after 3 seconds.',
        autoAdvance: 3000,
        hideNextButton: true,
        targetStyle: styles.featureRow,
      },
      {
        id: 'pause-resume',
        targetRef: pauseResumeRef,
        title: 'Pause & Resume',
        description: 'Use pauseTour() / resumeTour() to coordinate with modals and sheets.',
        targetStyle: styles.featureRow,
      },
      {
        id: 'scroll-target',
        targetRef: scrollTargetRef,
        title: 'Auto-Scroll',
        description: 'The tour automatically scrolled here — just set scrollRef in the config!',
        targetStyle: styles.scrollCard,
      },
    ];

    startTour(steps, {
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
      getCurrentScrollOffset: () => scrollY,
      showStepCounter: true,
      showProgressDots: true,
      animationDuration: 350,
      enableAccessibility: true,
      onTourStart: () => console.log('Tour started'),
      onTourEnd: (completed) => console.log(completed ? 'Tour completed!' : 'Tour skipped'),
    });
  }, [startTour, showConditional, scrollY]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        <View style={styles.container}>
          {/* ─── Header ─────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.title}>React Native Tour Guide</Text>
            <Text style={styles.subtitle}>Complete Feature Showcase</Text>
          </View>

          {/* ─── Start Tour Button ───────────────── */}
          <Pressable ref={mainBtnRef} style={styles.startBtn} onPress={startMainTour} disabled={isActive}>
            <Text style={styles.startBtnText}>Start Tour</Text>
          </Pressable>

          {/* ─── Pause/Resume Controls ─────────────── */}
          {isActive && (
            <Pressable
              style={styles.pauseBtn}
              onPress={isPaused ? resumeTour : pauseTour}
            >
              <Text style={styles.pauseBtnText}>
                {isPaused ? 'Resume Tour' : 'Pause Tour'}
              </Text>
            </Pressable>
          )}

          {isActive && !isPaused && (
            <Text style={styles.stepIndicator}>
              Step {currentStep + 1} of {activeSteps.length}
            </Text>
          )}

          {/* ─── Theme Cards ──────────────────────────── */}
          <Text style={styles.sectionTitle}>Theme Presets</Text>
          <View style={styles.themeGrid}>
            <View ref={darkCardRef} style={[styles.themeCard, { backgroundColor: '#2C2C2E' }]}>
              <Text style={[styles.themeLabel, { color: '#FFF' }]}>Dark</Text>
            </View>
            <View ref={lightCardRef} style={[styles.themeCard, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0' }]}>
              <Text style={[styles.themeLabel, { color: '#1C1C1E' }]}>Light</Text>
            </View>
            <View ref={minimalCardRef} style={[styles.themeCard, { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#EEE' }]}>
              <Text style={[styles.themeLabel, { color: '#555' }]}>Minimal</Text>
            </View>
            <View ref={vibrantCardRef} style={[styles.themeCard, { backgroundColor: '#1A1A2E' }]}>
              <Text style={[styles.themeLabel, { color: '#E94560' }]}>Vibrant</Text>
            </View>
          </View>

          {/* ─── Shape Matching Demo ───────────────────── */}
          <Text style={styles.sectionTitle}>Auto Shape Matching</Text>
          <Text style={styles.sectionDesc}>Spotlight automatically matches the target's border radius</Text>
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

          {/* ─── Advanced Features ─────────────────────── */}
          <Text style={styles.sectionTitle}>Advanced Features</Text>

          <View ref={pulseTargetRef} style={styles.pulseTarget}>
            <Text style={styles.pulseText}>Pulse</Text>
          </View>

          <View ref={perCornerRef} style={styles.perCornerCard}>
            <Text style={styles.featureTitle}>Per-Corner Radius</Text>
            <Text style={styles.featureDesc}>Top corners rounded, bottom sharp — auto-detected from targetStyle</Text>
          </View>

          <View ref={conditionalRef} style={styles.featureRow}>
            <View style={styles.featureRowContent}>
              <Text style={styles.featureTitle}>Conditional Step</Text>
              <Switch value={showConditional} onValueChange={setShowConditional} />
            </View>
            <Text style={styles.featureDesc}>Toggle to show/hide this step in the advanced tour</Text>
          </View>

          <View ref={backdropRef} style={styles.featureRow}>
            <Text style={styles.featureTitle}>Backdrop: "next"</Text>
            <Text style={styles.featureDesc}>Tap overlay to advance instead of using buttons</Text>
          </View>

          <View ref={autoAdvanceRef} style={styles.featureRow}>
            <Text style={styles.featureTitle}>Auto-Advance (3s)</Text>
            <Text style={styles.featureDesc}>Step progresses automatically after a timer</Text>
          </View>

          <View ref={pauseResumeRef} style={styles.featureRow}>
            <Text style={styles.featureTitle}>Pause & Resume</Text>
            <Text style={styles.featureDesc}>Hide overlay while preserving tour state</Text>
          </View>

          <View style={styles.spacer} />
          <View style={styles.spacer} />

          <View ref={scrollTargetRef} style={styles.scrollCard}>
            <Text style={styles.featureTitle}>Auto-Scroll Target</Text>
            <Text style={styles.featureDesc}>The tour scrolls here automatically using scrollToTarget config</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>@wrack/react-native-tour-guide</Text>
            <Text style={styles.footerSubtext}>
              {Platform.OS === 'web' ? 'Running on Web' : isIOS ? 'Running on iOS' : 'Running on Android'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Root App ──────────────────────────────────────────────
export default function App() {
  return (
    <TourGuideProvider>
      <AppContent />
      <TourGuideOverlay />
    </TourGuideProvider>
  );
}

// ─── Styles ────────────────────────────────────────────────
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
    paddingBottom: 60,
  },
  container: {
    flex: 1,
    padding: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
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

  // Start button
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
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
