const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'dashboard-widgets',

  exposes: {
    './Widgets': './src/elements.ts'
  },

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto'
    }),
    '@shared/core': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto'
    }
  }
});
