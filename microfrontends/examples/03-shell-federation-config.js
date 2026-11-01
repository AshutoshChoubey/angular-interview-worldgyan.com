/**
 * @file 03-shell-federation-config.js
 * @description Native Federation Configuration for Host Shell (gui-aggregator-service)
 * @framework Angular 22+ (@angular-architects/native-federation)
 * 
 * Enforces strict singletons across all Microfrontends for:
 * - Angular Core, Common, Router, Elements
 * - Shared State Library (@shared/core)
 */

const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'gui-aggregator-service',

  shared: {
    // Automatically share all installed workspace dependencies
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto'
    }),

    // Shared business state engine must be a single shared instance in memory
    '@shared/core': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto'
    }
  },

  // Skip unused secondary entry points to optimize esbuild build performance
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket'
  ]
});

