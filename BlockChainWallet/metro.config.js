const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    unstable_enablePackageExports: true,
    extraNodeModules: {
      'react-native/asset-registry': path.resolve(__dirname, 'node_modules/react-native/src/asset-registry.js'),
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
