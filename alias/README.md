# react-native-tour-guide

**This package is an alias.** The canonical package is
**[`@wrack/react-native-tour-guide`](https://www.npmjs.com/package/@wrack/react-native-tour-guide)**,
and it is what this package installs and re-exports. Both import specifiers work
and resolve to the same code — use whichever you already have.

In-app tours, walkthroughs, onboarding flows, and coach marks for React Native.
The spotlight automatically matches each highlighted component's shape, with no
manual configuration. Works with Expo Go and React Native CLI, has no native
dependencies (only `react-native-svg`), is written in TypeScript, and is New
Architecture (Fabric) ready.

- **Documentation:** https://himanshu-lal4.github.io/react-native-tour-guide/
- **Repository:** https://github.com/himanshu-lal4/react-native-tour-guide

## Install

```bash
npm install react-native-tour-guide react-native-svg
```

```bash
# Expo
npx expo install react-native-tour-guide react-native-svg
```

## Complete example

```tsx
import { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  TourGuideProvider,
  TourGuideOverlay,
  useTourGuide,
} from 'react-native-tour-guide';

function Screen() {
  const profileRef = useRef<View>(null);
  const { startTour } = useTourGuide();

  return (
    <View style={{ flex: 1, padding: 24, gap: 16 }}>
      <View
        ref={profileRef}
        style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#888' }}
      />
      <Pressable
        onPress={() =>
          startTour([
            {
              ref: profileRef,
              title: 'Your profile',
              description: 'Tap here to edit your details.',
            },
          ])
        }
      >
        <Text>Start tour</Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  return (
    <TourGuideProvider>
      <Screen />
      <TourGuideOverlay />
    </TourGuideProvider>
  );
}
```

`TourGuideProvider` must wrap anything that calls `useTourGuide`, and
`TourGuideOverlay` must render inside the provider — it draws the spotlight.

## Everything else

The full API reference, theming, auto-scroll, persistence, conditional steps and
custom tooltips are documented at
**https://himanshu-lal4.github.io/react-native-tour-guide/** — that documentation
applies unchanged to this package.

## License

MIT
