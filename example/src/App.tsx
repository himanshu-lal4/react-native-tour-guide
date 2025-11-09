import { useRef, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  TourGuideProvider,
  TourGuideOverlay,
  useTourGuide,
} from '@wrack/react-native-tour-guide';

const isIOS = Platform.OS === 'ios';

function AppContent() {
  const { startTour, isActive } = useTourGuide();

  // Refs for tour targets
  const welcomeButtonRef = useRef(null);
  const circularButtonRef = useRef(null);
  const secondButtonRef = useRef(null);
  const circularIconRef = useRef(null);
  const thirdButtonRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  const handleStartTour = () => {
    // Different tour steps for iOS and Android
    const tourSteps = isIOS
      ? [
          {
            id: 'step1',
            targetRef: welcomeButtonRef,
            title: 'Welcome to iOS! 👋',
            description:
              'Experience the sleek iOS design with a RECTANGLE spotlight. Tap "Continue" to proceed.',
            tooltipPosition: 'bottom' as const,
            spotlightShape: 'rectangle' as const,
            spotlightPadding: 4,
            spotlightBorderRadius: 12,
          },
          {
            id: 'step2',
            targetRef: circularButtonRef,
            title: 'Perfect Circles ⭕',
            description:
              'Notice the smooth CIRCULAR spotlight! iOS loves rounded elements.',
            tooltipPosition: 'bottom' as const,
            spotlightShape: 'circle' as const,
            spotlightPadding: 8,
          },
          {
            id: 'step3',
            targetRef: secondButtonRef,
            title: 'Smart Scrolling 🍎',
            description:
              'Watch as the tour automatically scrolls to this button with smooth iOS animations.',
            tooltipPosition: 'top' as const,
            spotlightShape: 'rectangle' as const,
            spotlightPadding: 4,
            spotlightBorderRadius: 12,
            scrollToTarget: {
              scrollRef: scrollViewRef,
              offset: 50,
              animated: true,
              getCurrentScrollOffset: () => scrollY,
            },
          },
          {
            id: 'step4',
            targetRef: circularIconRef,
            title: 'Icon Spotlight 🎯',
            description:
              'Perfect for highlighting circular icons in your iOS app.',
            tooltipPosition: 'top' as const,
            spotlightShape: 'circle' as const,
            spotlightPadding: 8,
          },
          {
            id: 'step5',
            targetRef: thirdButtonRef,
            title: 'All Done! 🎉',
            description:
              'You just completed the iOS tour. Enjoy building beautiful apps!',
            tooltipPosition: 'top' as const,
            spotlightShape: 'rectangle' as const,
            spotlightPadding: 4,
            spotlightBorderRadius: 12,
          },
        ]
      : [
          {
            id: 'step1',
            targetRef: welcomeButtonRef,
            title: 'Welcome to Android! 🤖',
            description:
              'Explore Material Design with a RECTANGLE spotlight. Tap "Next" to continue.',
            tooltipPosition: 'bottom' as const,
            spotlightShape: 'rectangle' as const,
            spotlightPadding: 4,
            spotlightBorderRadius: 12,
          },
          {
            id: 'step2',
            targetRef: circularButtonRef,
            title: 'Circular Spotlight ⭕',
            description:
              'See how the CIRCLE spotlight adapts to Material Design principles!',
            tooltipPosition: 'bottom' as const,
            spotlightShape: 'circle' as const,
            spotlightPadding: 8,
          },
          {
            id: 'step3',
            targetRef: secondButtonRef,
            title: 'Auto-Scroll Feature 📜',
            description:
              'This demonstrates automatic scrolling on Android with smooth transitions.',
            tooltipPosition: 'top' as const,
            spotlightShape: 'rectangle' as const,
            spotlightPadding: 4,
            spotlightBorderRadius: 12,
            scrollToTarget: {
              scrollRef: scrollViewRef,
              offset: 50,
              animated: true,
              getCurrentScrollOffset: () => scrollY,
            },
          },
          {
            id: 'step4',
            targetRef: circularIconRef,
            title: 'Floating Action 🎯',
            description:
              'Great for highlighting circular FABs and icons in Material Design.',
            tooltipPosition: 'top' as const,
            spotlightShape: 'circle' as const,
            spotlightPadding: 8,
          },
          {
            id: 'step5',
            targetRef: thirdButtonRef,
            title: 'Tour Complete! 🎉',
            description:
              'You finished the Android tour. Start building amazing Material Design apps!',
            tooltipPosition: 'top' as const,
            spotlightShape: 'rectangle' as const,
            spotlightPadding: 4,
            spotlightBorderRadius: 12,
          },
        ];

    // Different styling for iOS and Android
    const tourConfig = isIOS
      ? {
          tooltipStyles: {
            backgroundColor: '#1C1C1E',
            titleColor: '#FFFFFF',
            descriptionColor: '#E5E5EA',
            primaryButtonColor: '#007AFF',
            secondaryButtonColor: '#48484A',
          },
          spotlightStyles: {
            overlayOpacity: 0.75,
            overlayColor: '#000000',
          },
          showStepCounter: true,
          nextButtonText: 'Continue',
          prevButtonText: 'Back',
          doneButtonText: 'Done',
        }
      : {
          tooltipStyles: {
            backgroundColor: '#212121',
            titleColor: '#FFFFFF',
            descriptionColor: '#BDBDBD',
            primaryButtonColor: '#03DAC6',
            secondaryButtonColor: '#424242',
          },
          spotlightStyles: {
            overlayOpacity: 0.7,
            overlayColor: '#000000',
          },
          showStepCounter: true,
          nextButtonText: 'Next',
          prevButtonText: 'Previous',
          doneButtonText: 'Finish',
        };

    startTour(tourSteps, tourConfig);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={(event) => {
          setScrollY(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isIOS ? '🍎 iOS Tour Guide' : '🤖 Android Tour Guide'}
            </Text>
            <Text style={styles.subtitle}>
              {isIOS ? 'Sleek & Minimal' : 'Material Design'}
            </Text>
          </View>

          <Pressable
            ref={welcomeButtonRef}
            style={[
              styles.button,
              isIOS ? styles.iosButton : styles.androidButton,
            ]}
            onPress={handleStartTour}
            disabled={isActive}
          >
            <Text style={styles.buttonText}>
              {isIOS ? 'Begin Tour' : 'Start Tour'}
            </Text>
          </Pressable>

          <View style={styles.spacer} />

          <View style={styles.circularSection}>
            <Text style={styles.sectionLabel}>
              {isIOS ? 'Circular Spotlight' : 'Circular FAB Example'}
            </Text>
            <Pressable
              ref={circularButtonRef}
              style={[
                styles.circularButton,
                isIOS ? styles.iosCircular : styles.androidCircular,
              ]}
              onPress={() => {}}
            >
              <Text style={styles.circularButtonText}>
                {isIOS ? '⭕' : '➕'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.spacer} />

          <View
            style={[styles.card, isIOS ? styles.iosCard : styles.androidCard]}
          >
            <Text style={styles.cardTitle}>
              {isIOS ? 'Features' : 'Key Features'}
            </Text>
            <Text style={styles.cardText}>
              • Precise component spotlighting{'\n'}• Customizable tooltips
              {'\n'}• Automatic scrolling{'\n'}• TypeScript support{'\n'}•
              Flexible configuration{'\n'}• Circle & Rectangle shapes{'\n'}•{' '}
              {isIOS ? 'iOS optimized' : 'Material Design'}
            </Text>
          </View>

          <View style={styles.spacer} />

          <Pressable
            ref={secondButtonRef}
            style={[
              styles.button,
              isIOS ? styles.iosSecondaryButton : styles.androidSecondaryButton,
            ]}
            onPress={() => {}}
          >
            <Text
              style={[
                styles.buttonText,
                isIOS ? styles.iosSecondaryText : styles.androidSecondaryText,
              ]}
            >
              {isIOS ? 'Feature Button' : 'Action Button'}
            </Text>
          </Pressable>

          <View style={styles.spacer} />

          <View
            style={[styles.card, isIOS ? styles.iosCard : styles.androidCard]}
          >
            <Text style={styles.cardTitle}>
              {isIOS ? 'Easy Integration' : 'Simple Setup'}
            </Text>
            <Text style={styles.cardText}>
              {isIOS
                ? 'Just wrap your app with TourGuideProvider and add TourGuideOverlay at the root level. Then use the useTourGuide hook to control tours.'
                : 'Wrap your app with TourGuideProvider, add TourGuideOverlay, and use the useTourGuide hook to create guided tours with Material Design.'}
            </Text>
          </View>

          <View style={styles.spacer} />

          <View style={styles.circularSection}>
            <Text style={styles.sectionLabel}>
              {isIOS ? 'Icon Spotlight' : 'Circular Action'}
            </Text>
            <Pressable
              ref={circularIconRef}
              style={[
                styles.circularIconButton,
                isIOS ? styles.iosCircularIcon : styles.androidCircularIcon,
              ]}
              onPress={() => {}}
            >
              <Text style={styles.circularIconText}>{isIOS ? '🎯' : '⚡'}</Text>
            </Pressable>
          </View>

          <View style={styles.spacer} />

          <Pressable
            ref={thirdButtonRef}
            style={[
              styles.button,
              isIOS ? styles.iosAccentButton : styles.androidAccentButton,
            ]}
            onPress={() => {}}
          >
            <Text style={styles.buttonText}>
              {isIOS ? 'Complete Action' : 'Execute Action'}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Tap "Start Tour" to see it in action!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <TourGuideProvider>
      <AppContent />
      <TourGuideOverlay />
    </TourGuideProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: isIOS ? '#F2F2F7' : '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  // iOS Specific Button Styles
  iosButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iosSecondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
  },
  iosAccentButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iosSecondaryText: {
    color: '#007AFF',
  },
  // Android Specific Button Styles
  androidButton: {
    backgroundColor: '#6200EE',
    borderRadius: 4,
    elevation: 6,
  },
  androidSecondaryButton: {
    backgroundColor: '#03DAC6',
    borderRadius: 4,
    elevation: 4,
  },
  androidAccentButton: {
    backgroundColor: '#018786',
    borderRadius: 4,
    elevation: 6,
  },
  androidSecondaryText: {
    color: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
  },
  // iOS Card Style
  iosCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderRadius: 16,
  },
  // Android Card Style
  androidCard: {
    elevation: 4,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  spacer: {
    height: 24,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  circularSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  circularButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // iOS Circular Styles
  iosCircular: {
    backgroundColor: '#FF3B30',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iosCircularIcon: {
    backgroundColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Android Circular Styles
  androidCircular: {
    backgroundColor: '#BB86FC',
    elevation: 8,
  },
  androidCircularIcon: {
    backgroundColor: '#FFB300',
    elevation: 8,
  },
  circularButtonText: {
    fontSize: 40,
  },
  circularIconButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularIconText: {
    fontSize: 36,
  },
});
