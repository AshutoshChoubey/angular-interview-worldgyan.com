const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'fault-management',

  exposes: {
    './Module': './apps/fault-management/src/app/fault-management/fault-management.routes.ts'
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
