import { signal } from '@angular/core';

/**
 * Example 1: Basic Writable Signals
 * Covers: signal(), getter invocation (), set(), and update()
 */

// 1. Primitive Signal
export const counter = signal<number>(0);

console.log('Initial counter:', counter()); // Output: 0

// 2. Set new value directly
counter.set(5);
console.log('After set(5):', counter()); // Output: 5

// 3. Update based on previous value
counter.update(current => current + 1);
console.log('After update(+1):', counter()); // Output: 6

// 4. Object Signal with Immutability
interface CartItem {
  id: string;
  name: string;
  quantity: number;
}

export const cart = signal<CartItem[]>([
  { id: '1', name: 'Angular Book', quantity: 1 }
]);

// Add item immutably
export function addItem(item: CartItem) {
  cart.update(items => [...items, item]);
}

// Update item quantity immutably
export function incrementQuantity(id: string) {
  cart.update(items =>
    items.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    )
  );
}

// Remove item immutably
export function removeItem(id: string) {
  cart.update(items => items.filter(item => item.id !== id));
}
