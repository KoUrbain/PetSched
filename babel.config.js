// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    // SDK 50: expo-router/babel is deprecated; babel-preset-expo covers it
    presets: ['babel-preset-expo'],
    // Keep Reanimated plugin last
    plugins: [
      'react-native-reanimated/plugin',
      // optional: module-resolver for TS path aliases
      // ['module-resolver', { alias: { '@lib': './lib', '@components': './components', '@store': './store', '@app': './app' } }],
    ],
  };
};
