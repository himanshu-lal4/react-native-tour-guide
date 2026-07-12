---
layout: page
title: "Getting Started — React Native Tour Guide"
description: "Install and set up a React Native app tour in minutes: wrap your app in TourGuideProvider, add TourGuideOverlay, and call startTour with your steps."
permalink: /getting-started/
---

# Getting started

Add a guided tour to a React Native (or Expo) app in three steps.

## 1. Install

```bash
npm install @wrack/react-native-tour-guide react-native-svg
# yarn add @wrack/react-native-tour-guide react-native-svg
# pnpm add @wrack/react-native-tour-guide react-native-svg
# Expo: npx expo install @wrack/react-native-tour-guide react-native-svg
```

The only required dependency is `react-native-svg`, which Expo ships out of the box — so it works in **Expo Go** with no custom dev build.

## 2. Wrap your app

```tsx
import { TourGuideProvider, TourGuideOverlay } from '@wrack/react-native-tour-guide';

export default function App() {
  return (
    <TourGuideProvider>
      <YourApp />
      <TourGuideOverlay />
    </TourGuideProvider>
  );
}
```

## 3. Start a tour

```tsx
import { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTourGuide } from '@wrack/react-native-tour-guide';

function HomeScreen() {
  const { startTour } = useTourGuide();
  const buttonRef = useRef(null);
  const avatarRef = useRef(null);

  const start = () =>
    startTour([
      { id: 'welcome', targetRef: buttonRef, title: 'Welcome', description: 'Tap here to begin.', targetStyle: styles.button },
      { id: 'avatar',  targetRef: avatarRef, title: 'Profile', description: 'View your profile.', targetStyle: styles.avatar },
    ]);

  return (
    <View>
      <Pressable ref={buttonRef} style={styles.button} onPress={start}><Text>Start Tour</Text></Pressable>
      <View ref={avatarRef} style={styles.avatar} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 12, padding: 16, backgroundColor: '#007AFF' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ccc' },
});
```

Pass each component's style as `targetStyle` and the spotlight matches its shape automatically — the button gets 12px rounded corners, the avatar becomes a perfect circle.

## Next steps

- [How to build a full app tour]({{ '/react-native-app-tour/' | relative_url }})
- [FAQ]({{ '/faq/' | relative_url }})
- Full API reference: [README on GitHub]({{ site.repo_url }}#readme)
