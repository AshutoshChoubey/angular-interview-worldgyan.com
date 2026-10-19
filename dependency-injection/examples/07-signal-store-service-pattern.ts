/**
 * 07-signal-store-service-pattern.ts
 *
 * Demonstrates:
 * 1. Modern reactive service architecture using Angular Signals (v16-v22+).
 * 2. Unidirectional data flow: private mutable signal + public readonly computed projections.
 * 3. Replacing legacy NgRx / BehaviorSubject boilerplate with zero-overhead O(1) reactivity.
 * 4. Seamless integration with provideZonelessChangeDetection().
 */

import { Injectable, computed, signal } from '@angular/core';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  tax: number;
  grandTotal: number;
}

@Injectable({ providedIn: 'root' })
export class CartSignalStore {
  // 🔒 1. Private mutable state holder:
  private readonly _items = signal<CartProduct[]>([
    { id: 'p1', name: 'Angular 22 Architecture Guide', price: 49.99, quantity: 1 }
  ]);

  // 🌐 2. Public read-only signal projection (Prevents external consumers from calling .set()):
  readonly items = this._items.asReadonly();

  // ⚡ 3. Derived computed state (Memoized, lazy evaluation):
  readonly totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  readonly tax = computed(() =>
    Math.round(this.subtotal() * 0.08 * 100) / 100
  );

  readonly summary = computed<CartSummary>(() => ({
    totalItems: this.totalItems(),
    subtotal: this.subtotal(),
    tax: this.tax(),
    grandTotal: this.subtotal() + this.tax()
  }));

  // 🛠️ 4. State mutator methods enforcing immutable updates:
  addProduct(product: Omit<CartProduct, 'quantity'>) {
    this._items.update(list => {
      const existing = list.find(item => item.id === product.id);
      if (existing) {
        return list.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...list, { ...product, quantity: 1 }];
    });
  }

  removeProduct(productId: string) {
    this._items.update(list => list.filter(item => item.id !== productId));
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeProduct(productId);
      return;
    }
    this._items.update(list =>
      list.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }

  clearCart() {
    this._items.set([]);
  }
}
