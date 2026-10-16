/**
 * src/app/app.config.ts — Enterprise Application Configuration
 * 
 * Demonstrates:
 * 1. Zoneless Change Detection (Zero zone.js monkey patching)
 * 2. Router with Component Input Binding & View Transitions
 * 3. HttpClient configured with browser-native fetch()
 * 4. Non-destructive Client Hydration with Event Replay
 */
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, Routes } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./main').then(m => m.AppComponent)
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Stable in Angular 22: Zoneless reactive scheduling via Signals
    provideZonelessChangeDetection(),

    // 2. High-performance client-side router
    provideRouter(
      routes,
      withComponentInputBinding(), // Maps route params directly to input() signals
      withViewTransitions()        // Native CSS View Transitions API
    ),

    // 3. Modern browser-native fetch backend instead of legacy XMLHttpRequest
    provideHttpClient(
      withFetch()
    ),

    // 4. Non-destructive hydration with user event capture & replay
    provideClientHydration(
      withEventReplay()
    )
  ]
};

