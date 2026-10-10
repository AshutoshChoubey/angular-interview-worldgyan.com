import { signal, computed, untracked } from '@angular/core';

/**
 * Example 2: Computed Signals & Dynamic Dependency Tracking
 * Covers: computed(), memoization, conditional tracking, untracked(), custom equality
 */

// 1. Basic Computed Signal
export const unitPrice = signal(50);
export const quantity = signal(3);
export const discountPercent = signal(10); // 10%

export const subtotal = computed(() => unitPrice() * quantity());
export const discountAmount = computed(() => (subtotal() * discountPercent()) / 100);
export const finalTotal = computed(() => subtotal() - discountAmount());

// 2. Dynamic Dependency Tracking (Branching)
export const isLoggedIn = signal(false);
export const userDisplayName = signal('Guest');
export const premiumStatus = signal('Gold Member');

export const greeting = computed(() => {
  if (!isLoggedIn()) {
    // While isLoggedIn() is false, premiumStatus() is never read,
    // so changes to premiumStatus() WILL NOT trigger recomputation!
    return `Welcome, ${userDisplayName()}! Please log in.`;
  }
  return `Welcome back, ${userDisplayName()} (${premiumStatus()})!`;
});

// 3. Using untracked()
export const pageTitle = signal('Dashboard');
export const debugLoggingEnabled = signal(true);

export const headerTitle = computed(() => {
  const title = pageTitle();
  // Read debugLoggingEnabled without making headerTitle depend on it
  const isDebug = untracked(() => debugLoggingEnabled());
  if (isDebug) {
    console.log(`[Computed] Render header: ${title}`);
  }
  return title;
});

// 4. Custom Equality Function
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export const userLocation = signal<GeoLocation>(
  { latitude: 28.6139, longitude: 77.209 },
  {
    // Prevent notifications if coordinates remain identical up to 4 decimal places
    equal: (prev, next) =>
      prev.latitude.toFixed(4) === next.latitude.toFixed(4) &&
      prev.longitude.toFixed(4) === next.longitude.toFixed(4)
  }
);
