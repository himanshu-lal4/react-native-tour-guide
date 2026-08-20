import { registerRootComponent } from 'expo';

import App from './src/App';
import DemoShowcase from './src/DemoShowcase';

// Flip to true to run the polished README/demo screen instead of the feature
// harness. DemoShowcase is what the README GIF is recorded from; App.tsx is the
// exhaustive harness used to exercise every option while developing.
const RECORD_DEMO = false;

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(RECORD_DEMO ? DemoShowcase : App);
