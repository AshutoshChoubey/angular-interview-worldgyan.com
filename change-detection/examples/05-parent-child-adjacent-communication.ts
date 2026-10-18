/**
 * Example 05: Modern Component Communication Patterns
 * Angular 22 Production Architecture
 *
 * Demonstrates:
 * 1. Parent to Child via signal input() & input.required()
 * 2. Child to Parent via signal output()
 * 3. Two-way communication via modern model() signals
 * 4. Sibling-to-Sibling / Adjacent component communication via shared Signal stores
 */

import {
  Component,
  ChangeDetectionStrategy,
  Injectable,
  input,
  output,
  model,
  signal,
  computed,
  inject
} from '@angular/core';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  qty: number;
}

/**
 * ---------------------------------------------------------------------------
 * 1. SHARED SIGNAL STORE: Adjacent / Sibling Component Synchronization
 * ---------------------------------------------------------------------------
 */
@Injectable({ providedIn: 'root' })
export class GlobalCartService {
  // Private writable source
  private readonly _items = signal<CartItem[]>([
    { id: 'p-1', title: 'Angular 22 Enterprise Handbook', price: 49.0, qty: 1 }
  ]);

  // Public read-only exposure
  readonly items = this._items.asReadonly();

  // Derived computations
  readonly itemCount = computed(() =>
    this._items().reduce((total, item) => total + item.qty, 0)
  );

  readonly totalAmount = computed(() =>
    this._items().reduce((total, item) => total + item.price * item.qty, 0)
  );

  addItem(item: CartItem): void {
    this._items.update((current) => {
      const existing = current.find((i) => i.id === item.id);
      if (existing) {
        return current.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...current, item];
    });
  }

  removeItem(id: string): void {
    this._items.update((current) => current.filter((i) => i.id !== id));
  }
}

/**
 * ---------------------------------------------------------------------------
 * 2. CHILD COMPONENT: Using input(), output(), and model()
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-cart-item-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="item-row">
      <span>{{ item().title }} - \${{ item().price }}</span>
      <div class="quantity-picker">
        <button (click)="decrement()">-</button>
        <span>{{ quantity() }}</span>
        <button (click)="increment()">+</button>
      </div>
      <button class="delete-btn" (click)="onDelete()">Delete</button>
    </div>
  `
})
export class CartItemRowComponent {
  // 1. Parent to Child: Required Signal Input
  readonly item = input.required<CartItem>();

  // 2. Two-Way Model Signal (Angular 17.2+ / Angular 22)
  readonly quantity = model.required<number>();

  // 3. Child to Parent: Signal Output
  readonly itemDeleted = output<string>();

  increment(): void {
    this.quantity.update((q) => q + 1);
  }

  decrement(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    } else {
      this.onDelete();
    }
  }

  onDelete(): void {
    this.itemDeleted.emit(this.item().id);
  }
}

/**
 * ---------------------------------------------------------------------------
 * 3. SIBLING A: Navigation Header (Consuming Global Cart)
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-nav-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="logo">WorldGyan Store</div>
      <div class="cart-pill">
        🛒 Cart Items: <strong>{{ cart.itemCount() }}</strong> (\${{ cart.totalAmount().toFixed(2) }})
      </div>
    </header>
  `
})
export class NavHeaderComponent {
  // Injected directly into Sibling A
  protected cart = inject(GlobalCartService);
}

/**
 * ---------------------------------------------------------------------------
 * 4. SIBLING B: Product Catalog (Modifying Global Cart)
 * ---------------------------------------------------------------------------
 */
@Component({
  selector: 'app-catalog-shelf',
  standalone: true,
  imports: [CartItemRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="shelf">
      <h3>Active Cart List (Parent &amp; Child View)</h3>
      @for (item of cart.items(); track item.id) {
        <app-cart-item-row
          [item]="item"
          [(quantity)]="item.qty"
          (itemDeleted)="cart.removeItem($event)"
        />
      }
      <button class="add-btn" (click)="addSampleProduct()">+ Add Architecture Video Course ($89)</button>
    </section>
  `
})
export class CatalogShelfComponent {
  // Injected directly into Sibling B
  protected cart = inject(GlobalCartService);

  addSampleProduct(): void {
    this.cart.addItem({
      id: `p-${Date.now()}`,
      title: 'Signals & Performance Masterclass',
      price: 89.0,
      qty: 1
    });
  }
}
