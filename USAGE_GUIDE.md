# Usage Guide - React Native Tour Guide

This guide provides detailed examples and best practices for using `@wrack/react-native-tour-guide` in your React Native applications.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Simple Tour Example](#simple-tour-example)
3. [Multi-Step Tour](#multi-step-tour)
4. [Customization](#customization)
5. [Automatic Scrolling](#automatic-scrolling)
6. [Tour Persistence](#tour-persistence)
7. [Advanced Features](#advanced-features)
8. [Best Practices](#best-practices)

## Basic Setup

### Step 1: Install Dependencies

```bash
npm install @wrack/react-native-tour-guide react-native-svg
```

### Step 2: Wrap Your App

Wrap your entire app with `TourGuideProvider` and add `TourGuideOverlay` at the root:

```tsx
import {
  TourGuideProvider,
  TourGuideOverlay,
} from '@wrack/react-native-tour-guide';

export default function App() {
  return (
    <TourGuideProvider>
      {/* Your app content */}
      <NavigationContainer>
        <YourNavigator />
      </NavigationContainer>

      {/* Place overlay at the root level */}
      <TourGuideOverlay />
    </TourGuideProvider>
  );
}
```

## Simple Tour Example

Here's a basic single-step tour:

```tsx
import { useRef, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTourGuide } from '@wrack/react-native-tour-guide';

function WelcomeScreen() {
  const { startTour } = useTourGuide();
  const buttonRef = useRef(null);

  useEffect(() => {
    // Start tour after screen loads
    const timer = setTimeout(() => {
      startTour([
        {
          id: 'welcome_button',
          targetRef: buttonRef,
          title: 'Get Started',
          description: 'Tap this button to begin your journey!',
          tooltipPosition: 'bottom',
          spotlightShape: 'rectangle',
        },
      ]);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable ref={buttonRef} style={styles.button}>
        <Text>Get Started</Text>
      </Pressable>
    </View>
  );
}
```

## Multi-Step Tour

Create an onboarding tour with multiple steps:

```tsx
import { useRef, useEffect } from 'react';
import { useTourGuide } from '@wrack/react-native-tour-guide';

function DashboardScreen() {
  const { startTour } = useTourGuide();

  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    // Check if user has seen the tour (implement your own logic)
    const hasSeenTour = false; // Replace with actual check

    if (!hasSeenTour) {
      setTimeout(() => {
        startTour([
          {
            id: 'step_1_profile',
            targetRef: profileRef,
            title: 'Your Profile',
            description: 'Access your profile settings and preferences here.',
            tooltipPosition: 'bottom',
            spotlightShape: 'circle',
            spotlightPadding: 16,
          },
          {
            id: 'step_2_search',
            targetRef: searchRef,
            title: 'Search',
            description: 'Find anything quickly using our powerful search.',
            tooltipPosition: 'bottom',
            spotlightShape: 'rectangle',
          },
          {
            id: 'step_3_notifications',
            targetRef: notificationsRef,
            title: 'Stay Updated',
            description: 'Never miss important updates and notifications.',
            tooltipPosition: 'left',
            spotlightShape: 'circle',
          },
          {
            id: 'step_4_menu',
            targetRef: menuRef,
            title: 'More Options',
            description: 'Discover more features in the menu.',
            tooltipPosition: 'top',
            spotlightShape: 'rectangle',
            onNext: () => {
              // Mark tour as completed
              console.log('Tour completed!');
            },
            onSkip: () => {
              // User skipped the tour
              console.log('Tour skipped');
            },
          },
        ]);
      }, 1000);
    }
  }, []);

  return (
    <View>
      <View ref={profileRef}>
        <ProfileButton />
      </View>
      <View ref={searchRef}>
        <SearchBar />
      </View>
      <View ref={notificationsRef}>
        <NotificationIcon />
      </View>
      <View ref={menuRef}>
        <MenuButton />
      </View>
    </View>
  );
}
```

## Customization

### Custom Colors and Styling

```tsx
startTour(steps, {
  tooltipStyles: {
    backgroundColor: '#1E1E1E',
    titleColor: '#FFD700',
    descriptionColor: '#FFFFFF',
    primaryButtonColor: '#FFD700',
    secondaryButtonColor: '#3A3A3C',
    skipButtonColor: '#FFD700',
    borderRadius: 20,
  },
  spotlightStyles: {
    overlayOpacity: 0.8,
    overlayColor: '#000000',
  },
  nextButtonText: 'Continue',
  prevButtonText: 'Go Back',
  skipButtonText: 'Skip Tour',
  doneButtonText: 'Finish',
  showStepCounter: true,
  showProgressDots: false,
});
```

### Custom Text Styles

```tsx
startTour(steps, {
  tooltipStyles: {
    titleStyle: {
      fontSize: 20,
      fontWeight: '800',
      fontFamily: 'YourCustomFont-Bold',
    },
    descriptionStyle: {
      fontSize: 15,
      lineHeight: 22,
      fontFamily: 'YourCustomFont-Regular',
    },
  },
});
```

### Enable Blur and Gradient (Optional)

First, install the optional dependencies:

```bash
npm install @react-native-community/blur react-native-linear-gradient @react-native-masked-view/masked-view
```

Then enable them in your tour:

```tsx
startTour(steps, {
  spotlightStyles: {
    enableBlur: true,
    blurAmount: 10,
    enableGradient: true,
    gradientColors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'],
  },
});
```

## Automatic Scrolling

For elements that might be off-screen, enable automatic scrolling:

```tsx
import { useRef, useState } from 'react';
import { ScrollView } from 'react-native';

function ScrollableScreen() {
  const { startTour } = useTourGuide();
  const scrollViewRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  const targetRef = useRef(null);

  const handleStartTour = () => {
    startTour([
      {
        id: 'scrollable_target',
        targetRef: targetRef,
        title: 'Hidden Feature',
        description: 'This element will be scrolled into view automatically.',
        tooltipPosition: 'bottom',
        scrollToTarget: {
          scrollRef: scrollViewRef,
          offset: 50, // Additional padding from top
          animated: true,
          getCurrentScrollOffset: () => scrollY,
        },
      },
    ]);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      onScroll={(event) => {
        setScrollY(event.nativeEvent.contentOffset.y);
      }}
      scrollEventThrottle={16}
    >
      {/* Content... */}
      <View ref={targetRef}>
        <SomeComponent />
      </View>
    </ScrollView>
  );
}
```

### Absolute Scroll Positioning

If you want to scroll to an absolute position:

```tsx
scrollToTarget: {
  scrollRef: scrollViewRef,
  offset: 500, // Scroll to Y position 500
  absolute: true,
  animated: true,
}
```

## Tour Persistence

Implement tour persistence to show tours only once:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

function useOnboardingTour() {
  const { startTour } = useTourGuide();
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    checkTourStatus();
  }, []);

  const checkTourStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('@onboarding_tour_completed');
      setHasSeenTour(value === 'true');
    } catch (error) {
      console.error('Error checking tour status:', error);
    }
  };

  const markTourAsCompleted = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_tour_completed', 'true');
      setHasSeenTour(true);
    } catch (error) {
      console.error('Error marking tour as completed:', error);
    }
  };

  const startOnboardingTour = (steps) => {
    const stepsWithCallback = steps.map((step, index) => ({
      ...step,
      onNext: index === steps.length - 1 ? markTourAsCompleted : step.onNext,
      onSkip: markTourAsCompleted,
    }));

    startTour(stepsWithCallback);
  };

  return { hasSeenTour, startOnboardingTour };
}

// Usage
function MyScreen() {
  const { hasSeenTour, startOnboardingTour } = useOnboardingTour();

  useEffect(() => {
    if (!hasSeenTour) {
      setTimeout(() => {
        startOnboardingTour(tourSteps);
      }, 500);
    }
  }, [hasSeenTour]);
}
```

## Advanced Features

### Custom Tooltip Component

Create your own tooltip design:

```tsx
import { TooltipProps } from '@wrack/react-native-tour-guide';

const CustomTooltip = (props: TooltipProps) => {
  const {
    title,
    description,
    currentStep,
    totalSteps,
    onNext,
    onPrev,
    onSkip,
  } = props;

  return (
    <View style={styles.customTooltip}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.footer}>
        <Text style={styles.progress}>
          {currentStep + 1} of {totalSteps}
        </Text>

        <View style={styles.buttons}>
          {onPrev && <Button title="← Back" onPress={onPrev} />}
          <Button title="Skip" onPress={onSkip} />
          <Button title="Next →" onPress={onNext} />
        </View>
      </View>
    </View>
  );
};

// Use it in your tour
startTour(steps, {
  renderTooltip: (props) => <CustomTooltip {...props} />,
});
```

### Programmatic Control

Control the tour programmatically:

```tsx
function MyComponent() {
  const {
    startTour,
    nextStep,
    prevStep,
    skipTour,
    endTour,
    isActive,
    currentStep,
  } = useTourGuide();

  const handleStartTour = () => {
    startTour(tourSteps);
  };

  const handleCustomNext = () => {
    // Do something before moving to next step
    console.log('Moving to next step');
    nextStep();
  };

  const handleCustomSkip = () => {
    // Confirm before skipping
    Alert.alert('Skip Tour', 'Are you sure you want to skip?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Skip', onPress: skipTour },
    ]);
  };

  return (
    <View>
      <Button title="Start Tour" onPress={handleStartTour} />
      {isActive && (
        <View>
          <Button title="Next" onPress={handleCustomNext} />
          <Button title="Skip" onPress={handleCustomSkip} />
          <Button title="End" onPress={endTour} />
          <Text>Step {currentStep + 1}</Text>
        </View>
      )}
    </View>
  );
}
```

### Highlighting Tab Bar Items

To highlight tab bar buttons in React Navigation:

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

function MyTabs() {
  const homeTabRef = useRef(null);
  const profileTabRef = useRef(null);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarButton: (props) => (
            <Pressable
              {...props}
              ref={homeTabRef}
              style={props.style}
              onPress={props.onPress}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarButton: (props) => (
            <Pressable
              {...props}
              ref={profileTabRef}
              style={props.style}
              onPress={props.onPress}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

## Best Practices

### 1. Timing

Always add a delay before starting tours to ensure layouts are measured:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    startTour(steps);
  }, 500); // 500-1000ms is recommended

  return () => clearTimeout(timer);
}, []);
```

### 2. Persistence

Always implement persistence to avoid annoying users:

```tsx
// Good
if (!hasSeenTour) {
  startTour(steps);
}

// Bad - will show every time
startTour(steps);
```

### 3. Keep Tours Short

Limit tours to 3-5 steps for better engagement:

```tsx
// Good - concise and focused
const tourSteps = [
  {
    /* Key feature 1 */
  },
  {
    /* Key feature 2 */
  },
  {
    /* Key feature 3 */
  },
];

// Bad - too many steps
const tourSteps = [
  {
    /* Step 1 */
  },
  {
    /* Step 2 */
  },
  // ... 10 more steps
];
```

### 4. Always Provide Skip Option

Never force users to complete a tour:

```tsx
// The library automatically provides a skip button
// Just make sure to handle the onSkip callback
{
  id: 'step1',
  // ... other props
  onSkip: () => {
    // Save that user skipped the tour
    markTourAsCompleted();
  },
}
```

### 5. Test on Different Screen Sizes

Test your tours on various devices and orientations:

```tsx
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

// Adjust spotlight padding for small screens
const spotlightPadding = isSmallScreen ? 8 : 12;
```

### 6. Use Meaningful Descriptions

Write clear, concise descriptions:

```tsx
// Good
{
  title: 'Search',
  description: 'Find any recipe quickly using our smart search.',
}

// Bad
{
  title: 'This is the search bar',
  description: 'You can use this search bar to search for things in the app.',
}
```

### 7. Context-Aware Tours

Show tours when users first encounter a feature:

```tsx
function FeatureScreen() {
  const { hasSeenFeatureTour } = useTourPersistence('feature_tour');

  useEffect(() => {
    // Only show tour when user first visits this screen
    if (!hasSeenFeatureTour) {
      startTour(featureSteps);
    }
  }, [hasSeenFeatureTour]);
}
```

## Troubleshooting

### Tour Not Showing

- Ensure `TourGuideOverlay` is placed correctly
- Check that refs are attached to visible components
- Add a delay before starting the tour
- Verify the component has a valid layout (use `onLayout` to debug)

### Wrong Position

- Add more delay before starting tour
- Ensure target component is fully rendered
- Check for any transforms or absolute positioning
- Test on actual devices, not just simulators

### Performance Issues

- Avoid starting tours during heavy animations
- Reduce blur amount if performance is poor
- Disable optional visual effects if needed
- Test on older devices

## Examples Repository

For more examples, check out the `/example` directory in the package:

- Basic tour
- Multi-step tour
- Scrolling tour
- Custom styling
- Tab bar integration

## Support

- 📖 [Full API Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/himanshu-lal4/react-native-tour-guide/issues)
- 💬 [Discussions](https://github.com/himanshu-lal4/react-native-tour-guide/discussions)

---

Happy touring! 🎯
