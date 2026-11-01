const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'topology-manager',

  exposes: {
    './Module': './apps/topology-manager/src/app/topology-manager/topology-manager.routes.ts'
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
