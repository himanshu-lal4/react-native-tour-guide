module.exports = function (api) {
  api.cache(true);

  // Plain Expo preset. The workspace library (@wrack/react-native-tour-guide) is
  // resolved to the repo root by metro.config.js (react-native-monorepo-config +
  // package "exports"), so no babel module-resolver alias is needed here. Using
  // react-native-builder-bob's babel-config injects a RegExp `overrides` entry
  // that newer Metro can't build a transform cache key for ("Configuration
  // contains string/RegExp pattern, but no filename was passed to Babel").
  return {
    presets: ['babel-preset-expo'],
  };
};
